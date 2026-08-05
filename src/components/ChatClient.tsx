"use client";

import { useChat, UIMessage } from "@ai-sdk/react";
// import { DefaultChatTransport } from "ai";
import { Sidebar } from "@/components/Sidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { useState, useEffect, useRef } from "react";
import { generateId } from "ai";

interface ChatClientProps {
  id?: string;
  initialMessages?: UIMessage[];
}

export function ChatClient({ id, initialMessages = [] }: ChatClientProps) {
  const [chatId, setChatId] = useState(id || "");
  const [model, setModel] = useState("gemini-1.5-flash");
  const [systemPrompt, setSystemPrompt] = useState("");
  
  useEffect(() => {
    if (!id) {
      setChatId(generateId());
    }

    const loadSettings = () => {
      const savedModel = localStorage.getItem("ir-model");
      const savedPrompt = localStorage.getItem("ir-system-prompt");
      if (savedModel) setModel(savedModel);
      if (savedPrompt) setSystemPrompt(savedPrompt);
    };

    loadSettings();
    window.addEventListener('settings-updated', loadSettings);
    return () => window.removeEventListener('settings-updated', loadSettings);
  }, [id]);

  // @ts-ignore - Bypass AI SDK UseChatOptions typing changes in v4
  const { messages, sendMessage, stop, status, error } = useChat({
    id: chatId,
    initialMessages,
    body: { id: chatId, model, systemPrompt },
    api: '/api/chat'
  } as any);
  
  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !chatId) return;
    
    // @ts-ignore - Bypass AI SDK typing changes in v4
    sendMessage({ role: 'user', content: input });
    setInput("");

    // If this is the first message on the root page, update the URL
    if (messages.length === 0 && !id) {
      window.history.replaceState(null, '', `/c/${chatId}`);
      window.dispatchEvent(new Event('chat-created'));
    }
  };

  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const prevIsLoading = useRef(isLoading);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (prevIsLoading.current && !isLoading && autoSpeak && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant') {
        const textContent = lastMessage.parts 
          ? (lastMessage.parts as any[]).filter(p => p.type === 'text' || p.type === 'reasoning').map(p => p.text).join("")
          : (lastMessage as any).content;
          
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(textContent));
        }
      }
    }
    prevIsLoading.current = isLoading;
  }, [isLoading, messages, autoSpeak]);

  return (
    <div className="flex h-screen bg-transparent overflow-hidden text-text-primary transition-colors duration-300">
      <Sidebar currentChatId={chatId} />
      
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-bg-secondary overflow-hidden rounded-2xl flex items-center justify-center mb-6 text-accent shadow-sm border border-border-theme">
                <img src="/bot-avatar.png" alt="IR one" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-3xl font-bold mb-2 tracking-tight">How can I help you today?</h1>
              <p className="text-text-secondary max-w-md">
                I am IR one, an advanced AI chatbot. You can ask me questions, upload documents, or request code.
              </p>
            </div>
          ) : (
            <div className="pb-10 pt-4">
              {messages.map(m => {
                const textContent = m.parts 
                  ? (m.parts as any[]).filter(p => p.type === 'text' || p.type === 'reasoning').map(p => p.text).join("")
                  : (m as any).content;

                return (
                  <ChatMessage key={m.id} role={m.role as any} content={textContent || (m as any).content || ""} />
                );
              })}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="w-full py-6 px-4 bg-chat-bot-bg transition-colors duration-300" style={{ backdropFilter: 'var(--glass-backdrop)', WebkitBackdropFilter: 'var(--glass-backdrop)' }}>
                  <div className="max-w-3xl mx-auto flex gap-6">
                    <div className="w-8 h-8 overflow-hidden rounded-full bg-bg-tertiary border border-border-theme flex flex-shrink-0 items-center justify-center text-text-primary shadow-sm">
                      <img src="/bot-avatar.png" alt="IR one" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="w-full py-4 px-4 bg-red-900/20 text-red-400 text-center text-sm border-t border-red-900/30">
                  Error: {error.message || "Failed to fetch response. Please check your API key."}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
        
        <div className="flex-shrink-0">
          <ChatInput 
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            autoSpeak={autoSpeak}
            setAutoSpeak={setAutoSpeak}
          />
        </div>
      </main>
    </div>
  );
}
