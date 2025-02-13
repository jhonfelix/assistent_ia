import { Inter } from "next/font/google";
import "./globals.css";
import Warnings from "./components/warnings";
import { assistantId } from "./assistant-config";
const inter = Inter({ subsets: ["latin"] });
import { Analytics } from "@vercel/analytics/react"

export const metadata = {
  title: "Assistente de IA Ícaro",
  description: "Ferramenta de IA de pesquisa de dados de ocorrências aeronáuticas ocorridas no Brasil nos últimos 10 anos.",
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
        <Analytics />
      </body>
    </html>
  );
}
