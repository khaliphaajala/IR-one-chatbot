import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages, generateId } from 'ai';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body.messages || body; // Fallback if it sends an array directly
  const chatId = body.id; // Optional: sent from client
  const requestedModel = body.model || 'gemini-1.5-flash';
  const customSystemPrompt = body.systemPrompt || "You are IR one, a helpful and modern AI chatbot similar to ChatGPT. You assist users with answering questions, writing code, and analyzing files.";

  const session = await getServerSession(authOptions);

  try {
    // Fix Vercel AI SDK v7 bug where convertToModelMessages crashes if parts is undefined
    const sanitizedMessages = messages.map((m: any) => {
      if (!m.parts) {
        m.parts = m.content ? [{ type: 'text', text: m.content }] : [];
      }
      return m;
    });

    const aiModel = requestedModel === 'gemini-1.5-pro' 
      ? google('gemini-1.5-pro') 
      : google('gemini-1.5-flash');

    const result = await streamText({
      model: aiModel,
      system: customSystemPrompt,
      messages: await convertToModelMessages(sanitizedMessages),
      async onFinish({ text, toolCalls, toolResults, finishReason, usage }) {
        if (!session?.user?.id) return; // Only save if user is logged in
        
        try {
          const userMessage = messages[messages.length - 1]; // The latest user message
          
          // Check if chat exists, otherwise create it
          let chat = null;
          if (chatId) {
            chat = await prisma.chat.findUnique({ where: { id: chatId } });
          }
          
          if (!chat && chatId) {
            // Create new chat using the first message content as title (up to 50 chars)
            const title = userMessage.content.substring(0, 50) + (userMessage.content.length > 50 ? '...' : '');
            chat = await prisma.chat.create({
              data: {
                id: chatId,
                title,
                userId: session.user.id,
              }
            });
          }

          if (chat) {
            // Save both messages
            await prisma.message.createMany({
              data: [
                {
                  content: userMessage.content,
                  role: 'user',
                  chatId: chat.id,
                },
                {
                  content: text,
                  role: 'assistant',
                  chatId: chat.id,
                }
              ]
            });
          }
        } catch (dbError) {
          console.error("Failed to save chat to DB:", dbError);
        }
      }
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      generateMessageId: () => generateId(),
      onError: (error: any) => {
        console.error("Stream Error:", error);
        
        // Handle OpenAI API errors that might be objects
        if (error && typeof error === 'object') {
          if (error.error?.type === 'insufficient_quota') {
            return "OpenAI API Error: Insufficient quota. Please check your billing details and add credits to your OpenAI account.";
          }
          return error.message || error.name || JSON.stringify(error);
        }
        return String(error);
      }
    });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred" }), { status: 500 });
  }
}
