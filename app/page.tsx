import { Button } from "@/components/ui/button";
import {
  BrainCogIcon,
  EyeIcon,
  GlobeIcon,
  MonitorSmartphoneIcon,
  ServerCogIcon,
  ZapIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    name: "Store your PDF Douments",
    description:
      "Keep all your important PDf files securely stored and easily accessible anytime, anywhere.",
    icon: GlobeIcon,
  },
  {
    name: "Blazing Fast Responses",
    description:
      " Lorem ipsum dolor sit amet consectetur adipisicing elit. Nam molestiae quo nostrum.",
    icon: ZapIcon,
  },
  {
    name: "Chat MEmorization",
    description:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aliquid deleniti mollitia facilis blanditiis illo temporibus.",
    icon: BrainCogIcon,
  },
  {
    name: "Interactive PDF Viewer",
    description:
      " Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque, nemo.",
    icon: EyeIcon,
  },
  {
    name: "Cloud Backup",
    description:
      "  Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum iusto, nostrum odit maiores velit repudiandae beatae quos?",
    icon: ServerCogIcon,
  },
  {
    name: "Responsive Across Devices",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque quas cum quae expedita tempora!",
    icon: MonitorSmartphoneIcon,
  },
];

export default function Home() {
  return (
    <main className="bg-gradient-to-bl p-2 lg:p-5 from-white to-indigo-600 min-h-full">
      <div className="bg-white rounded-md py-24 sm:py-32 drop-shadow-xl">
        <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl mx-auto sm:text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600">
              Your Interactive Document Companion
            </h2>

            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Transform your PDFs into Interactive Conversations
            </p>

            <p className="text-lg text-gray-600 leading-8 mt-6">
              Introduction{" "}
              <span className="font-bold text-indigo-600">Chat with PDF</span>
              <br />
              <br />
              Upload your document, and our chatbot will answer questions,
              summarize content, and answer all your Qs. Ideal for everyone,{" "}
              <span className="text-indigo-600">Chat with PDF</span> turns
              static documents into{" "}
              <span className="font-bold">dynamic conversations</span>,
              enhancing productivity 10x fold effortlessly.
            </p>

            <Button asChild className="mt-6">
              <Link href={"/dashboard"}>Get Started</Link>
            </Button>
          </div>

          <div className="relative overflow-hidden pt-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <Image
                alt="App screenshot"
                src={"https://i.imgur.com/VciRSTI.jpeg"}
                width={2432}
                height={1442}
                className="mb-[0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
              />

              <div className="relative" aria-hidden>
                <div className="bg-gradient-to-t absolute from-white/95 h-12 w-full bottom-0"></div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-16 sm:mt-20 md:mt-24">
            <dl className="mx-auto max-w-2xl grid grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16 text-gray-600 lg:max-w-none">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <feature.icon
                      aria-hidden="true"
                      className="absolute left-1 top-1 h-5 w-5 text-indigo-600"
                    />
                  </dt>

                  <dd>{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </main>
  );
}
