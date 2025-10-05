"use client";

import { useUser } from "@clerk/nextjs";
import { Message } from "./chat";
import Markdown from "react-markdown";
import Image from "next/image";
import { Button } from "./ui/button";
import { BotIcon, Loader2Icon } from "lucide-react";

const ChatMessage = ({ message }: { message: Message }) => {
  const isHuman = message.role === "human";
  const { user } = useUser();

  return (
    <div className={`chat mb-2 ${isHuman ? "chat-end" : "chat-start"}`}>
      <div className="chat-image avatar">
        {isHuman ? (
          user?.imageUrl && (
            <Image
              src={user?.imageUrl}
              alt="Profile Picture"
              width={40}
              height={40}
              className="rounded-full"
            />
          )
        ) : (
          <div className="h-10 w-10 bg-indigo-600 text-center flex items-center justify-center rounded-full ">
            <BotIcon className="text-white h-7 w-7" />
          </div>
        )}
      </div>
      <div
        className={`chat-bubble max-w-[80%] overflow-x-auto p-4 bg-gray-900 text-gray-200 rounded-xl ${
          isHuman && "bg-indigo-600 text-white"
        }`}
      >
        {message.message === "Thinking..." ? (
          <div className="flex items-center justify-center">
            <Loader2Icon className="animate-spin h-5 w-5 text-white" />
          </div>
        ) : (
          <Markdown>{message.message}</Markdown>
        )}
      </div>
    </div>
  );
};
export default ChatMessage;

// <div className="chat chat-start">
//   <div className="chat-image avatar">
//     <div className="w-10 rounded-full">
//       <img
//         alt="Tailwind CSS chat bubble component"
//         src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
//       />
//     </div>
//   </div>

//   <div className="chat-header">
//     Obi-Wan Kenobi
//     <time className="text-xs opacity-50">12:45</time>
//   </div>

//   <div className="chat-bubble">You were the Chosen One!</div>
//   <div className="chat-footer opacity-50">Delivered</div>
// </div>

// <div className="chat chat-end">
//   <div className="chat-image avatar">
//     <div className="w-10 rounded-full">
//       <img
//         alt="Tailwind CSS chat bubble component"
//         src="https://img.daisyui.com/images/profile/demo/anakeen@192.webp"
//       />
//     </div>
//   </div>

//   <div className="chat-header">
//     Anakin
//     <time className="text-xs opacity-50">12:46</time>
//   </div>

//   <div className="chat-bubble">I hate you!</div>
//   <div className="chat-footer opacity-50">Seen at 12:46</div>
// </div>
