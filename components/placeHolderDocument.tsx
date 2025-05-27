"use client";

import { PlusCircleIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const PlaceHolderDocument = () => {
  const router = useRouter();

  const handleClick = () => {
    // check if user is FREE tier and if they're oner the file limit, push to the upgrade page

    router.push("/dashboard/upload");
  };

  return (
    <Button
      onClick={handleClick}
      className="flex flex-col items-center justify-center w-64 h-80 rounded-xl bg-gray-200 drop-shadow-md text-gray-400"
    >
      <PlusCircleIcon className="min-h-16 min-w-16" />
      <p>Add a document</p>
    </Button>
  );
};
export default PlaceHolderDocument;
