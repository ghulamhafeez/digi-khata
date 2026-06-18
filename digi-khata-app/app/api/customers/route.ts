import { prisma } from "@/lib/prisma";

const MOCK_USER_ID = "test-user-123" as const;

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      where: { userId: MOCK_USER_ID },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(customers);
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

    return Response.json(customer, { status: 201 });
  } catch (error) {
    console.error("[POST /api/customers]", error);
    return Response.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
