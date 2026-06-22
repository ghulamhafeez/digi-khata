import { prisma } from "@/lib/prisma";

const MOCK_USER_ID = "test-user-123" as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const customer = await prisma.customer.findFirst({
      where: { id, userId: MOCK_USER_ID },
      include: {
        transactions: {
          select: { amount: true, type: true },
        },
      },
    });

    if (!customer) {
      return Response.json({ error: "Customer not found" }, { status: 404 });
    }

    const totalJama = customer.transactions
      .filter((t) => t.type === "jama")
      .reduce((s, t) => s + t.amount, 0);
    const totalWapsi = customer.transactions
      .filter((t) => t.type === "wapsi")
      .reduce((s, t) => s + t.amount, 0);

    const { transactions: _, ...rest } = customer;
    return Response.json({
      ...rest,
      totalJama,
      totalWapsi,
      totalUdhaar: totalJama - totalWapsi,
    });
  } catch (error) {
    console.error("[GET /api/customers/:id]", error);
    return Response.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, phone, address } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    const existing = await prisma.customer.findFirst({
      where: { id, userId: MOCK_USER_ID },
    });
    if (!existing) {
      return Response.json({ error: "Customer not found" }, { status: 404 });
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("[PUT /api/customers/:id]", error);
    return Response.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.customer.findFirst({
      where: { id, userId: MOCK_USER_ID },
    });
    if (!existing) {
      return Response.json({ error: "Customer not found" }, { status: 404 });
    }

    await prisma.customer.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/customers/:id]", error);
    return Response.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
