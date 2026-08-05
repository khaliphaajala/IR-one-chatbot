"use client";

import { PlusCircle, MessageSquare, Trash2, Edit2, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";

export function Sidebar({ currentChatId = null }: { currentChatId?: string | null }) {
  const { data: session, status } = useSession();
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    const fetchChats = () => {
      if (session?.user?.id) {
        fetch("/api/chats")
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setChats(data);
            }
          })
          .catch(console.error);
      } else if (status === "unauthenticated") {
        setChats([]);
      }
    };

    fetchChats();

    window.addEventListener('chat-created', fetchChats);
    return () => window.removeEventListener('chat-created', fetchChats);
  }, [session, status, currentChatId]);

  return (
    <div className="w-64 h-full bg-bg-secondary border-r border-border-theme flex flex-col hidden md:flex">
      <div className="p-4 border-b border-border-theme">
        <Link 
          href="/"
          className="flex items-center gap-2 w-full p-2 rounded-md bg-bg-tertiary text-text-primary hover:text-accent transition-colors justify-center font-medium border border-border-theme"
        >
          <PlusCircle size={18} />
          New Chat
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="text-xs font-semibold text-text-muted mb-4 px-2">RECENT CHATS</div>
        {chats.length === 0 ? (
          <div className="text-sm text-text-muted px-2 italic">No chats yet.</div>
        ) : (
          chats.map(chat => (
            <Link
              key={chat.id}
              href={`/c/${chat.id}`}
              className={clsx(
                "flex items-center gap-2 p-2 rounded-md transition-colors group text-sm",
                currentChatId === chat.id 
                  ? "bg-bg-tertiary text-text-primary" 
                  : "hover:bg-bg-tertiary text-text-secondary hover:text-text-primary"
              )}
            >
              <MessageSquare size={16} />
              <span className="flex-1 truncate">{chat.title}</span>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                <button className="p-1 hover:text-blue-500 transition-colors"><Edit2 size={14} /></button>
                <button className="p-1 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="p-4 border-t border-border-theme flex items-center justify-between">
        {session?.user ? (
          <div className="flex items-center gap-2 overflow-hidden cursor-pointer group" onClick={() => signOut()}>
            {session.user.image ? (
              <img src={session.user.image} alt={session.user.name || "User"} className="w-8 h-8 rounded-full border border-border-theme" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <span className="text-sm font-medium truncate flex-1 text-text-primary group-hover:text-accent transition-colors">
              {session.user.name}
            </span>
            <LogOut size={16} className="text-text-muted group-hover:text-text-primary transition-colors" />
          </div>
        ) : (
          <Link href="/login" className="flex items-center gap-2 overflow-hidden cursor-pointer group flex-1">
            <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center text-text-muted border border-border-theme group-hover:text-accent group-hover:border-accent transition-colors">
              <LogOut size={14} className="rotate-180" />
            </div>
            <span className="text-sm font-medium truncate flex-1 text-text-muted group-hover:text-text-primary transition-colors">
              Log in
            </span>
          </Link>
        )}
        <ThemeToggle />
      </div>
    </div>
  );
}
