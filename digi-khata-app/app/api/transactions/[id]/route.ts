import { prisma } from "@/lib/prisma";

const MOCK_USER_ID = "test-user-123" as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: MOCK_USER_ID },
      include: {
        customer: { select: { id: true, name: true, phone: true, address: true } },
      },
    });

    if (!transaction) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    return Response.json(transaction);
  } catch (error) {
    console.error("[GET /api/transactions/:id]", error);
    return Response.json({ error: "Failed to fetch transaction" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount, type, description, customerId } = body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return Response.json({ error: "Amount must be a positive number" }, { status: 400 });
    }
    if (!type || !["jama", "wapsi"].includes(type)) {
      return Response.json({ error: "Type must be 'jama' or 'wapsi'" }, { status: 400 });
    }
    if (!customerId || typeof customerId !== "string") {
      return Response.json({ error: "Customer is required" }, { status: 400 });
    }

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: MOCK_USER_ID },
    });
    if (!existing) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        amount: Number(amount),
        type,
        description: description?.trim() || null,
        customerId,
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("[PUT /api/transactions/:id]", error);
    return Response.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: MOCK_USER_ID },
    });
    if (!existing) {
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    await prisma.transaction.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/transactions/:id]", error);
    return Response.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
