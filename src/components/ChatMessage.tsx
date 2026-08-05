"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { User, Bot, Copy, CheckCircle2, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

interface ChatMessageProps {
  role: "user" | "assistant" | "system" | "data";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel(); // Stop any other speech
      const utterance = new SpeechSynthesisUtterance(content);
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const isUser = role === "user";

  return (
    <div 
      className={clsx(
        "group w-full py-6 text-base md:px-4 transition-all duration-300", 
        isUser ? "bg-chat-user-bg text-chat-user-text" : "bg-chat-bot-bg text-chat-bot-text",
      )}
      style={{
        backdropFilter: 'var(--glass-backdrop)',
        WebkitBackdropFilter: 'var(--glass-backdrop)',
        boxShadow: 'var(--neon-shadow)'
      }}
    >
      <div className="max-w-3xl mx-auto flex gap-4 md:gap-6 px-4 md:px-0">
        <div className="flex-shrink-0 flex flex-col items-center">
          <div className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm border border-border-theme overflow-hidden",
            isUser ? "bg-accent text-white" : "bg-bg-tertiary text-text-primary"
          )}>
            {isUser ? <User size={18} /> : <img src="/bot-avatar.png" alt="IR one" className="w-full h-full object-cover" />}
          </div>
        </div>
        
        <div className="flex-1 space-y-2 overflow-hidden min-w-0">
          <div className="font-semibold text-text-primary">
            {isUser ? "You" : "IR one"}
          </div>
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent prose-p:text-current prose-headings:text-current prose-strong:text-current">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <div className="rounded-md overflow-hidden bg-bg-primary my-4 border border-border-theme shadow-md">
                      <div className="flex items-center justify-between px-4 py-2 bg-bg-tertiary text-xs font-mono text-text-secondary">
                        <span>{match[1]}</span>
                      </div>
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, borderRadius: 0, background: "transparent" }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-bg-tertiary border border-border-theme rounded px-1.5 py-0.5 text-sm font-mono text-accent" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>

        <div className="flex-shrink-0 flex gap-3 justify-end items-start mt-1">
          {!isUser && (
            <button 
              onClick={toggleSpeech}
              className={`transition-colors ${isSpeaking ? 'text-accent animate-pulse' : 'text-text-muted hover:text-accent'}`}
              title={isSpeaking ? "Stop reading" : "Read aloud"}
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          )}
          <button 
            onClick={handleCopy}
            className="text-text-muted hover:text-accent transition-colors"
            title="Copy message"
          >
            {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
