import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const { userId } = await auth();

    if (!file) {
      return new NextResponse("a File is required", { status: 400 });
    }

    if (file.type != "application/pdf") {
      return new NextResponse("File type must be: application/pdf", {
        status: 400,
      });
    }

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const blob = await put(`pdf-files/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    const data = await prisma.file.create({
      data: {
        userId,
        name: blob.pathname,
        type: blob.contentType,
        size: file.size,
        url: blob.url,
        downloadUrl: blob.downloadUrl,

        chat: {
          create: {
            userId,
          },
        },
      },
    });

    return NextResponse.json(data);
  } catch (err) {
    console.log(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
