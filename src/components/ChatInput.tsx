"use client";

import { Send, Paperclip, Mic, Volume2, VolumeX } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import clsx from "clsx";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
  stop?: () => void;
  autoSpeak: boolean;
  setAutoSpeak: (value: boolean) => void;
}

export function ChatInput({ input = "", setInput, handleSubmit, isLoading, stop, autoSpeak, setAutoSpeak }: ChatInputProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [micError, setMicError] = useState("");

  useEffect(() => {
    // Initialize SpeechRecognition
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        
        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          
          if (currentTranscript.trim()) {
            setInput(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          if (event.error === 'network') {
            setMicError("Network error: Speech recognition requires Chrome & internet.");
          } else {
            setMicError(`Mic error: ${event.error}`);
          }
          setTimeout(() => setMicError(""), 5000);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [setInput]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInput(""); // clear input when starting new recording
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        if (isListening) {
          recognitionRef.current?.stop();
          setIsListening(false);
        }
        formRef.current?.requestSubmit();
      }
    }
  };

  return (
    <div className="p-4 border-t border-border-theme transition-colors duration-300">
      <form 
        ref={formRef}
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto relative flex items-end p-2 bg-bg-secondary border border-border-theme focus-within:ring-2 focus-within:ring-accent transition-all"
        style={{
          borderRadius: 'var(--radius-theme)',
          boxShadow: 'var(--shadow-theme)'
        }}
      >
        <button 
          type="button"
          className="p-3 text-text-muted hover:text-text-primary transition-colors"
          title="Attach file (PDF, Word, TXT, Image)"
        >
          <Paperclip size={20} />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (input.trim() && !isLoading) {
                formRef.current?.requestSubmit();
              }
            }
          }}
          placeholder="Message IR one..."
          className="w-full bg-transparent border-none focus:outline-none py-3 px-2 text-text-primary placeholder:text-text-muted text-base"
        />

        <button
          type="button"
          onClick={() => setAutoSpeak(!autoSpeak)}
          className={`p-3 transition-colors ${autoSpeak ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
          title={autoSpeak ? "Auto-Speak enabled" : "Enable Auto-Speak"}
        >
          {autoSpeak ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>

        <button
          type="button"
          onClick={toggleListening}
          className={`p-3 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-text-muted hover:text-text-primary'}`}
          title={isListening ? "Stop listening" : "Start Voice Chat"}
        >
          <Mic size={20} />
        </button>

        {isLoading && stop ? (
          <button
            type="button"
            onClick={stop}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all border border-red-500/50"
            title="Stop generating"
          >
            <div className="w-3 h-3 bg-red-500 rounded-sm" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className={clsx(
              "w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-all",
              input.trim()
                ? "bg-accent text-white hover:bg-accent-hover shadow-md border border-accent"
                : "bg-bg-tertiary text-text-muted border border-border-theme opacity-50 cursor-not-allowed"
            )}
          >
            <Send size={18} className={clsx(input.trim() && "translate-x-0.5")} />
          </button>
        )}
      </form>
      <div className="text-center text-xs text-text-muted mt-3">
        {micError ? (
          <span className="text-red-400 font-medium">{micError}</span>
        ) : (
          "IR one can make mistakes. Consider verifying important information."
        )}
      </div>
    </div>
  );
}
