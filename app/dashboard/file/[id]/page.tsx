import Chat from "@/components/chat";
import PdfView from "@/components/pdfView";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

type ChatToFilePageProps = {
  params: {
    id: string;
  };
};

const ChatToFilePage = async ({ params }: ChatToFilePageProps) => {
  auth.protect();
  const { userId } = await auth();
  const { id } = params; // ✅ just an object

  if (!userId) {
    throw new Error("User not found");
  }

  const data = await prisma.file.findUnique({
    where: { id, userId },
  });

  if (!data) {
    throw new Error("Missing data");
  }

  return (
    <div className="grid lg:grid-cols-5 h-full overflow-hidden">
      <div className="col-span-5 lg:col-span-2 overflow-y-auto">
        <Chat id={id} />
      </div>
      <div className="col-span-5 lg:col-span-3 overflow-auto border-r-2 lg:border-indigo-600 bg-gray-100 lg:-order-1">
        <PdfView url={data.downloadUrl} />
      </div>
    </div>
  );
};

export default ChatToFilePage;
