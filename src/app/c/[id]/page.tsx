import { ChatClient } from "@/components/ChatClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedParams = await params;

  // Fetch the chat and its messages
  const chat = await prisma.chat.findUnique({
    where: {
      id: resolvedParams.id,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!chat) {
    redirect("/");
  }

  // @ts-ignore - Bypass AI SDK UIMessage typing changes
  const initialMessages: any[] = chat.messages.map((m: any) => ({
    id: m.id,
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
    parts: []
  }));

  return <ChatClient id={resolvedParams.id} initialMessages={initialMessages} />;
}
