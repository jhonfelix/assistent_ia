import { Inter } from "next/font/google";
import "./globals.css";
import Warnings from "./components/warnings";
import { assistantId } from "./assistant-config";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Assistente de IA  ",
  description: "Assistente rápido de ocorrências aeronáuticas - CENIPA",
  icons: {
    icon: "/icaro.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {assistantId ? children : <Warnings />}
        {/*<img className="logo" src="/openai.svg" alt="OpenAI Logo" />*/}
        <img className="logo" src="/icaro.svg" alt="Ícaro" />
      </body>
    </html>
  );
}
