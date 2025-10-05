import { HuggingFaceInferenceEmbeddings } from "./../node_modules/@langchain/community/dist/embeddings/hf";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { TogetherAI } from "@langchain/community/llms/togetherai";
import { auth } from "@clerk/nextjs/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { pc } from "./pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { PineconeStore } from "@langchain/pinecone";
import { prisma } from "./prisma";
import { Index } from "@pinecone-database/pinecone";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { Fireworks } from "@langchain/community/llms/fireworks";
import Together from "together-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const together = new Together();

export const indexName = "pdf-chat-index";

export const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: "intfloat/multilingual-e5-large",
});

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  // maxOutputTokens: 2048,
});

const llm1 = new Fireworks({
  model: "accounts/fireworks/models/deepseek-r1-0528",
  // temperature: 0,
  maxTokens: 4999,
  // timeout: undefined,
  // maxRetries: 2,
  // // other params...
});

// export const model = new HuggingFaceInference({
//   apiKey: process.env.HUGGINGFACE_API_KEY,
//   model: "HuggingFaceTB/SmolLM3-3B",
// });

const model = new TogetherAI({
  model: "deepseek-ai/DeepSeek-R1",
});

let pineconeVectorStore;

const searchIndexEmbeddings = async (
  index: Index,
  docId: string,
  userId: string
) => {
  const res = await index.searchRecords({
    query: {
      topK: 1,
      inputs: { text: "dummy text" },
      filter: {
        docId,
        userId,
      },
    },
    fields: ["docId", "userId"],
  });

  return res.result.hits.length >= 1;
};

const fetchMessagesFromDB = async (docId: string, userId: string) => {
  const chat = await prisma.chat.findFirst({
    where: {
      fileId: docId,
      userId,
    },
    include: { messages: true },
  });

  const chatHistory = chat?.messages.map((msg) => {
    return msg.role === "human"
      ? new HumanMessage(msg.message)
      : new AIMessage(msg.message);
  });

  return chatHistory;
};

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
  const { userId } = await auth();
  const doc = await prisma.file.findUnique({
    where: {
      id: docId,
    },
  });

  if (!userId) {
    throw new Error("User not found!");
  }

  if (!doc) {
    throw new Error("Document not found");
  }

  // importing the pdf through fetch
  const pdfRes = await fetch(doc.downloadUrl);
  const pdfBlob = await pdfRes.blob();

  const loader = new PDFLoader(pdfBlob);
  const document = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });

  const documents = await splitter.splitDocuments(document);

  const enhancedDocuments = documents.map((doc) => {
    doc.pageContent = `passage: ${doc.pageContent}`;
    doc.metadata = {
      ...doc.metadata,
      docId,
      userId,
    };

    return doc;
  });

  const index = pc.index("pdf-chat-index");

  const isDocumentEmbeddingExist = await searchIndexEmbeddings(
    index,
    docId,
    userId
  );

  if (isDocumentEmbeddingExist) {
    pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
    });

    return pineconeVectorStore;
  } else {
    pineconeVectorStore = await PineconeStore.fromDocuments(
      enhancedDocuments,
      embeddings,
      {
        pineconeIndex: pc.index(indexName),
      }
    );

    return pineconeVectorStore;
  }
}

export const generateLangchainCompletion = async (
  docId: string,
  query: string
) => {
  const { userId } = await auth();
  pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(docId);

  if (!userId) {
    throw new Error("User not found");
  }
  if (!pineconeVectorStore) {
    throw new Error("Pinecone Vector Store not found");
  }

  // Create a retriever to search through the context
  const retriever = pineconeVectorStore.asRetriever({
    filter: { docId, userId },
  });

  // Fetch chat history from the database
  const chatHistory = await fetchMessagesFromDB(docId, userId);

  // console.log(chatHistory);

  // Define a prompt template for generating search queries based on conversatin history
  const historyAwarePrompt = ChatPromptTemplate.fromMessages([
    ...(chatHistory ?? []),
    ["user", "{input}"],
    [
      "user",
      `Your task is to help retrieve relevant information from a PDF based on the user's question.

  If the input is a clear question or request for more information, generate a search query that captures its meaning.

  If the input is conversational or casual (e.g., "that's interesting", "okay", "cool", "I agree"), return the exact same input without changing it.`,
    ],
  ]);

  // given the histroy, the current query, and a prompt, the llm will write a new more suitable query.
  const historyAwareRetrieverChain = await createHistoryAwareRetriever({
    llm,
    retriever,
    rephrasePrompt: historyAwarePrompt,
  });

  // const systemPrompt =
  //   "You are an assistant for question-answering tasks. " +
  //   "Use the following pieces of retrieved context to answer " +
  //   "the question. If you don't know the answer, say that you " +
  //   "don't know." +
  //   "answer concise." +
  //   "\n\n" +
  // ("{context}");

  const systemPrompt = `You're a helpful, friendly assistant answering questions based on the information provided below.
Use the context to give clear and friendly answers.
If the answer isn't in the context, it's okay to say you’re not sure.
Keep your responses natural and easy to understand.
\n\n
Context:
{context}`;

  const historyAwareRetrievalPrompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ...(chatHistory ?? []),
    ["user", "{input}"],
  ]);

  const historyAwareCombineDocsChain = await createStuffDocumentsChain({
    llm,
    prompt: historyAwareRetrievalPrompt,
  });

  const conversationalRetrievalChain = await createRetrievalChain({
    retriever: historyAwareRetrieverChain,
    combineDocsChain: historyAwareCombineDocsChain,
  });

  const reply = await conversationalRetrievalChain.invoke({
    chat_history: chatHistory,
    input: query,
  });

  console.log(reply.answer);
  console.log(reply.context);

  return reply.answer;
};
