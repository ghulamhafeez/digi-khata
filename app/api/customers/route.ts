import { prisma } from "@/lib/prisma";

const MOCK_USER_ID = "test-user-123" as const;

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      where: { userId: MOCK_USER_ID },
      include: {
        transactions: {
          select: { amount: true, type: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute totals per customer
    const withTotals = customers.map((c) => {
      const totalJama = c.transactions
        .filter((t) => t.type === "jama")
        .reduce((s, t) => s + t.amount, 0);
      const totalWapsi = c.transactions
        .filter((t) => t.type === "wapsi")
        .reduce((s, t) => s + t.amount, 0);
      const { transactions: _, ...customer } = c;
      return { ...customer, totalJama, totalWapsi, totalUdhaar: totalJama - totalWapsi };
    });

    return Response.json(withTotals);
  } catch (error) {
    console.error("[GET /api/customers]", error);
    return Response.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, address } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        userId: MOCK_USER_ID,
      },
    });

    return Response.json(
      { ...customer, totalJama: 0, totalWapsi: 0, totalUdhaar: 0 },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/customers]", error);
    return Response.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
