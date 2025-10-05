import Chat from "@/components/chat";
import PdfView from "@/components/pdfView";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const ChatToFilePage = async ({ params }: { params: { id: string } }) => {
  auth.protect();
  const { userId } = await auth();
  const { id } = params;

  if (!userId) {
    throw new Error("User not found");
  }

  const data = await prisma.file.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!data) {
    throw new Error("Missing data");
  }

  const url = data.downloadUrl;

  return (
    <div className="grid lg:grid-cols-5 h-full overflow-hidden">
      {/* Right */}
      <div className="col-span-5 lg:col-span-2 overflow-y-auto">
        {/* Chat */}
        <Chat id={id} />
      </div>

      {/* Left */}
      <div className="col-span-5 lg:col-span-3 overflow-auto border-r-2 lg:border-indigo-600 bg-gray-100 lg:-order-1">
        {/* PDF View */}
        <PdfView url={url} />
      </div>
    </div>
  );
};
export default ChatToFilePage;
