import { prisma } from "@/lib/prisma";

const MOCK_USER_ID = "test-user-123" as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom   = searchParams.get("dateFrom");
    const dateTo     = searchParams.get("dateTo");
    const customerId = searchParams.get("customerId");
    const type       = searchParams.get("type");

    // ── Build where clause for filtered queries ──────────────────────────────
    const txWhere: Record<string, unknown> = { userId: MOCK_USER_ID };
    if (dateFrom || dateTo) {
      txWhere.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo
          ? { lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)) }
          : {}),
      };
    }
    if (customerId) txWhere.customerId = customerId;
    if (type === "jama" || type === "wapsi") txWhere.type = type;

    // ── Use Prisma aggregates — no JS math on large datasets ─────────────────
    const [
      totalCustomers,
      jamaAgg,
      wapsiAgg,
      transactionCount,
      recentTransactions,
    ] = await Promise.all([
      // 1. Total customers (never filtered)
      prisma.customer.count({ where: { userId: MOCK_USER_ID } }),

      // 2. Sum of Jama (respects filters)
      prisma.transaction.aggregate({
        where: { ...txWhere, type: "jama" },
        _sum: { amount: true },
      }),

      // 3. Sum of Wapsi (respects filters)
      prisma.transaction.aggregate({
        where: { ...txWhere, type: "wapsi" },
        _sum: { amount: true },
      }),

      // 4. Count (respects filters)
      prisma.transaction.count({ where: txWhere }),

      // 5. Recent 10 (respects filters)
      prisma.transaction.findMany({
        where: txWhere,
        include: { customer: { select: { id: true, name: true, phone: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const totalJama  = jamaAgg._sum.amount  ?? 0;
    const totalWapsi = wapsiAgg._sum.amount ?? 0;
    const netUdhaar  = totalJama - totalWapsi;

    // ── Top debtors — always unfiltered (true outstanding) ──────────────────
    // Use DB aggregation grouped by customer
    const jamaByCustomer = await prisma.transaction.groupBy({
      by: ["customerId"],
      where: { userId: MOCK_USER_ID, type: "jama" },
      _sum: { amount: true },
    });
    const wapsiByCustomer = await prisma.transaction.groupBy({
      by: ["customerId"],
      where: { userId: MOCK_USER_ID, type: "wapsi" },
      _sum: { amount: true },
    });

    // Build a map of customerId → { jama, wapsi }
    const balanceMap = new Map<string, { jama: number; wapsi: number }>();
    for (const row of jamaByCustomer) {
      balanceMap.set(row.customerId, {
        jama: row._sum.amount ?? 0,
        wapsi: 0,
      });
    }
    for (const row of wapsiByCustomer) {
      const existing = balanceMap.get(row.customerId);
      if (existing) {
        existing.wapsi = row._sum.amount ?? 0;
      } else {
        balanceMap.set(row.customerId, {
          jama: 0,
          wapsi: row._sum.amount ?? 0,
        });
      }
    }

    // Fetch customer details for debtors only
    const debtorIds = [...balanceMap.entries()]
      .filter(([, v]) => v.jama - v.wapsi > 0)
      .map(([id]) => id);

    const debtorCustomers = debtorIds.length > 0
      ? await prisma.customer.findMany({
          where: { id: { in: debtorIds }, userId: MOCK_USER_ID },
          select: { id: true, name: true, phone: true, address: true },
        })
      : [];

    const topDebtors = debtorCustomers
      .map((c) => {
        const b = balanceMap.get(c.id) ?? { jama: 0, wapsi: 0 };
        return {
          ...c,
          totalJama: b.jama,
          totalWapsi: b.wapsi,
          totalUdhaar: b.jama - b.wapsi,
        };
      })
      .sort((a, b) => b.totalUdhaar - a.totalUdhaar)
      .slice(0, 5);

    // ── Monthly breakdown — last 6 months, always unfiltered ────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTx = await prisma.transaction.findMany({
      where: { userId: MOCK_USER_ID, createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, type: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const monthlyMap: Record<string, { jama: number; wapsi: number }> = {};
    for (const tx of monthlyTx) {
      const key = tx.createdAt.toISOString().slice(0, 7);
      if (!monthlyMap[key]) monthlyMap[key] = { jama: 0, wapsi: 0 };
      if (tx.type === "jama")  monthlyMap[key].jama  += tx.amount;
      if (tx.type === "wapsi") monthlyMap[key].wapsi += tx.amount;
    }

    const monthly = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, jama: v.jama, wapsi: v.wapsi }));

    return Response.json({
      totalCustomers,
      totalJama,
      totalWapsi,
      netUdhaar,
      transactionCount,
      recentTransactions,
      topDebtors,
      monthly,
    });
  } catch (error) {
    console.error("[GET /api/dashboard]", error);
    return Response.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
