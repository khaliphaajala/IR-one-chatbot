import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    // Verify chat belongs to user before deleting
    const chat = await prisma.chat.findUnique({
      where: { id },
    });

    if (!chat || chat.userId !== session.user.id) {
      return new NextResponse("Not Found or Unauthorized", { status: 404 });
    }

    // Delete chat (cascades to delete messages due to Prisma schema)
    await prisma.chat.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CHAT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
