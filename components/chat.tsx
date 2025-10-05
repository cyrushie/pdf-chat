"use client";

import { useUser } from "@clerk/nextjs";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2Icon } from "lucide-react";
import { askQuestion } from "@/actions/askQuestion";
import { getAllMessages } from "@/lib/data/messages";
import ChatMessage from "./chatMessage";

export type Message = {
  id: string;
  role: "human" | "ai" | "placeholder";
  message: string;
  createdAt: Date;
};

const Chat = ({ id }: { id: string }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState<string>();
  const [loaded, setLoaded] = useState<boolean>(false);
  const bottomOfChatRef = useRef<HTMLDivElement>(null);

  if (!user) {
    throw new Error("User not found");
  }

  const fetchMessages = async () => {
    const chatMessages = await getAllMessages(id, user.id);

    const messages: Message[] = chatMessages.map((msg) => {
      return {
        id: msg.id,
        role: msg.role,
        createdAt: msg.createdAt,
        message: msg.message,
      };
    });

    setMessages(messages);
    setLoaded(true);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    bottomOfChatRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!input) {
      throw new Error("Input is required");
    }

    const q = input;

    setInput("");

    // Optimistic UI update
    setMessages((prev) => [
      ...prev,
      {
        id: "1",
        role: "human",
        message: q,
        createdAt: new Date(),
      },
      {
        id: "2",
        role: "ai",
        message: "Thinking...",
        createdAt: new Date(),
      },
    ]);

    startTransition(async () => {
      const { success, message } = await askQuestion(q, id);

      if (!success) {
        setMessages((prev) =>
          prev.slice(0, prev.length - 1).concat({
            id: "3",
            role: "ai",
            message: `Oops!.. ${message}`,
            createdAt: new Date(),
          })
        );
      }

      await fetchMessages();
    });
  };
  return (
    <div className="flex flex-col h-full overflow-y-scroll">
      {/* Chat contents */}
      <div className="flex-1 w-full">
        {/* Chat messages */}

        {loaded ? (
          <>
            <div>
              {messages.length === 0 && (
                <ChatMessage
                  key={"placeholder"}
                  message={{
                    id: "p1",
                    role: "ai",
                    message: "ask me anything",
                    createdAt: new Date(),
                  }}
                />
              )}

              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
            </div>

            <div ref={bottomOfChatRef} />
          </>
        ) : (
          <div className="flex items-center justify-center">
            <Loader2Icon className="text-indigo-600 h-20 w-20 animate-spin mt-40" />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex sticky bottom-0 space-x-2 p-5 bg-indigo-600/75"
      >
        <Input
          className="bg-white"
          placeholder="Ask a Question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <Button type="submit" disabled={!input || isPending}>
          {isPending ? (
            <Loader2Icon className="text-indigo-600 animate-spin" />
          ) : (
            "Ask"
          )}
        </Button>
      </form>
    </div>
  );
};
export default Chat;
