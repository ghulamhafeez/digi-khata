import { prisma } from "@/lib/prisma";

const MOCK_USER_ID = "test-user-123";

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

    // Ensure the customer belongs to this user
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

    // Ensure the customer belongs to this user
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
