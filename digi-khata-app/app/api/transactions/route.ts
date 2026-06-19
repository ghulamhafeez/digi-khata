import { prisma } from "@/lib/prisma";

const MOCK_USER_ID = "test-user-123" as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: MOCK_USER_ID,
        ...(customerId ? { customerId } : {}),
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(transactions);
  } catch (error) {
    console.error("[GET /api/transactions]", error);
    return Response.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, userId: MOCK_USER_ID },
    });
    if (!customer) {
      return Response.json({ error: "Customer not found" }, { status: 404 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(amount),
        type,
        description: description?.trim() || null,
        customerId,
        userId: MOCK_USER_ID,
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
      },
    });

    return Response.json(transaction, { status: 201 });
  } catch (error) {
    console.error("[POST /api/transactions]", error);
    return Response.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
