"use server";

import { prisma } from "../prisma";

export const getAllMessages = async (id: string, userId: string) => {
  const chat = await prisma.chat.findUnique({
    where: {
      fileId: id,
      userId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  return chat.messages;
};
