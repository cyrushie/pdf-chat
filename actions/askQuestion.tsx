"use server";

import { Message } from "@/components/chat";
import { generateLangchainCompletion } from "@/lib/langchain";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const FREE_LIMIT = 3;
const PRO_LIMIT = 100;

export const askQuestion = async (query: string, id: string) => {
  auth.protect();

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthenticated User");
  }

  const chat = await prisma.chat.findFirst({
    where: {
      fileId: id,
      userId,
    },
    include: { messages: true },
  });

  if (!chat) {
    throw new Error("Chat does not exist");
  }

  const userMessages = chat?.messages.filter(
    (msg) => msg.role === "human"
  ).length;

  // limits PRO/Free

  const userMessage = await prisma.message.create({
    data: {
      role: "human",
      message: query,
      chatId: chat.id,
      createdAt: new Date(),
    },
  });

  // Generate AI response
  const reply = await generateLangchainCompletion(id, query);

  const aiMessage = await prisma.message.create({
    data: {
      role: "ai",
      message: reply,
      chatId: chat.id,
      createdAt: new Date(),
    },
  });

  return { success: true, message: null };
};
