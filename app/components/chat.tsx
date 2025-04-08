"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./chat.module.css";
import { AssistantStream } from "openai/lib/AssistantStream";
import Markdown from "react-markdown";
import { AssistantStreamEvent } from "openai/resources/beta/assistants";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
import Link from "next/link";
import { ArrowUp, Loader2Icon, StopCircleIcon, ThumbsDown, ThumbsUp } from "lucide-react";

type MessageProps = {
  role: "user" | "assistant" | "code";
  text: string;
};

//git push origin main



type ChatProps = {
  functionCallHandler?: (
    toolCall: RequiredActionFunctionToolCall
  ) => Promise<string>;
};

const Chat = ({ functionCallHandler = async () => "" }: ChatProps) => {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [threadId, setThreadId] = useState("");
  const [textInfo, setTextInfo] = useState(true);

  const Message = ({ role, text }: MessageProps) => {
    const components = {
      user: (text: string) => <div className={styles.userMessage}>{text}</div>,
      assistant: (text: string) => (
        <div className={styles.assistantMessage}>
          <Markdown>{text}</Markdown>
          <div className={styles.checkmensages}><ThumbsUp size={'15px'} /> <ThumbsDown size={'15px'} /> <Loader2Icon size={'15px'}/></div>
        </div>
      ),
      code: (text: string) => (
        <div className={styles.codeMessage}>
          {text.split("\n").map((line, index) => (
            <div key={index}>
              <span>{`${index + 1}. `}</span>
              {line}
            </div>
          ))}
        </div>
      ),
    };
    return components[role](text);
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  useEffect(() => {
    const createThread = async () => {
      const res = await fetch(`/api/assistants/threads`, { method: "POST" });
      const data = await res.json();
      setThreadId(data.threadId);
    };
    createThread();
  }, []);

  const sendMessage = async (text: string) => {
    const response = await fetch(`/api/assistants/threads/${threadId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content: text }),
    });
    
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const submitActionResult = async (runId: string, toolCallOutputs: any[]) => {
    const response = await fetch(`/api/assistants/threads/${threadId}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId, toolCallOutputs }),
    });
    
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    setMessages((prev) => [...prev, { role: "user", text: userInput }]);
    setUserInput("");
    setTextInfo(false);
    setInputDisabled(true);
    setLoading(true);
    
    await sendMessage(userInput);
  };

  const handleRequiresAction = async (event: AssistantStreamEvent.ThreadRunRequiresAction) => {
    const runId = event.data.id;
    const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
    
    const toolCallOutputs = await Promise.all(
      toolCalls.map(async (toolCall) => ({
        output: await functionCallHandler(toolCall),
        tool_call_id: toolCall.id,
      }))
    );
    
    await submitActionResult(runId, toolCallOutputs);
  };

  const handleReadableStream = (stream: AssistantStream) => {
    
    stream.on("textCreated", () => setMessages((prev) => [...prev, { role: "assistant", text: "" }]));
   
    stream.on("textDelta", (delta) => {
      if (delta.value) {
        setMessages((prev) => {
          const lastMessage = { ...prev[prev.length - 1], text: prev[prev.length - 1].text + delta.value };
          return [...prev.slice(0, -1), lastMessage];
        });
      }
    });

     // Ativa o flag quando código for iniciado
  stream.on("toolCallCreated", (toolCall) => {
    if (toolCall.type === "code_interpreter") {
      /*setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "🔒 A resposta envolveu análise de dados e foi processada internamente.",
        },
      ]);*/
    }
  });

  // Mantém o flag enquanto o código estiver vindo
  stream.on("toolCallDelta", (delta) => {
    if (delta.type === "code_interpreter") {

    }
  });

    stream.on("event", (event) => {
      if (event.event === "thread.run.requires_action") handleRequiresAction(event);
      if (event.event === "thread.run.completed") {
        setInputDisabled(false);
        setLoading(false);
      }

    });
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {textInfo && <div className={styles.textInfo}>Olá, sou o <b>Ícaro</b> e estou aqui para fornecer dados e estatísticas sobre ocorrências aeronáuticas. <b>O que deseja saber?</b></div>}
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.text} />          
        ))}
          {loading ? <div className={styles.loading}>Processando... </div> : '' }
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          className={styles.input}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Digite sua pergunta"
          disabled={inputDisabled}
        />
        <button type="submit" className={styles.button} disabled={inputDisabled}>
          {loading ? <StopCircleIcon color="#000" /> : <ArrowUp />}
        </button>
      </form>
      <div className={styles.footer}>
        O Assistente de IA pode cometer erros. Considere verificar informações importantes na página oficial do {" "}
        <Link href="http://www2.fab.mil.br/cenipa/" target="_blank">CENIPA</Link> {" "}e/ou{" "} <Link href="https://painelsipaer.cenipa.fab.mil.br/extensions/Sipaer/home.html" target="_blank">PainelSipaer</Link>.
      </div>
    </div>
  );
};

export default Chat;
