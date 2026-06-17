import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.user.findMany();
    return Response.json(customers);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    const customer = await prisma.user.create({
      data: { name, email },
    });

    return Response.json(customer, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
