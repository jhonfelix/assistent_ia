import { Inter } from "next/font/google";
import "./globals.css";
import Warnings from "./components/warnings";
import { assistantId } from "./assistant-config";
import { ThemeProvider } from "./context/ThemeContext"; 
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Assistente de IA Ícaro",
  description: "Ferramenta de pesquisa com a utilização de IA na consulta de dados de ocorrências aeronáuticas da aviação civil brasileira nos últimos 10 anos.",
  icons: {
    icon: "/icaro.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <ThemeProvider>
        {assistantId ? children : <Warnings />}
        <img className="logo" src="/icaro.svg" alt="Ícaro" />
        <Analytics />
      </ThemeProvider>
      </body>
    </html>
  );
}
