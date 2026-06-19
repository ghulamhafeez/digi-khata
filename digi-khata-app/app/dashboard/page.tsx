"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowUpCircle, ArrowDownCircle,
  Loader2, Receipt, Users, TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/types/customer";
import type { Transaction } from "@/types/transaction";

interface DashboardStats {
  totalCustomers: number;
  totalJama: number;
  totalWapsi: number;
  netUdhaar: number;
  recentTransactions: Transaction[];
  topDebtors: (Customer & { totalUdhaar: number })[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [custRes, txRes] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/transactions"),
      ]);

      if (!custRes.ok || !txRes.ok) throw new Error("Fetch failed");

      const [customers, transactions]: [Customer[], Transaction[]] =
        await Promise.all([custRes.json(), txRes.json()]);

      const totalJama  = transactions.filter((t) => t.type === "jama").reduce((s, t) => s + t.amount, 0);
      const totalWapsi = transactions.filter((t) => t.type === "wapsi").reduce((s, t) => s + t.amount, 0);

      // Top debtors — customers with highest outstanding
      const topDebtors = [...customers]
        .filter((c) => (c.totalUdhaar ?? 0) > 0)
        .sort((a, b) => (b.totalUdhaar ?? 0) - (a.totalUdhaar ?? 0))
        .slice(0, 5) as (Customer & { totalUdhaar: number })[];

      setStats({
        totalCustomers: customers.length,
        totalJama,
        totalWapsi,
        netUdhaar: totalJama - totalWapsi,
        recentTransactions: transactions.slice(0, 8),
        topDebtors,
      });
    } catch {
      // error handled by empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Home
              </button>
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-lg font-bold text-gray-800">Dashboard</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/customers"><Button variant="outline" size="sm"><Users className="h-4 w-4" /> Customers</Button></Link>
            <Link href="/transactions"><Button size="sm"><Receipt className="h-4 w-4" /> Transactions</Button></Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">Loading dashboard...</p>
          </div>
        ) : !stats ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <p className="text-sm text-gray-500">Could not load data.</p>
            <Button onClick={fetchStats}>Retry</Button>
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Customers */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Customers</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCustomers}</p>
                </div>

                {/* Total Jama */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-3">
                    <ArrowUpCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Jama</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">Rs. {stats.totalJama.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Credit given</p>
                </div>

                {/* Total Wapsi */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                    <ArrowDownCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Wapsi</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">Rs. {stats.totalWapsi.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Cash received</p>
                </div>

                {/* Net Udhaar */}
                <div className={`rounded-2xl border shadow-lg p-5 ${stats.netUdhaar > 0 ? "bg-orange-50 border-orange-200" : "bg-white border-gray-100"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stats.netUdhaar > 0 ? "bg-orange-100" : "bg-blue-100"}`}>
                    <Receipt className={`h-5 w-5 ${stats.netUdhaar > 0 ? "text-orange-500" : "text-blue-500"}`} />
                  </div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Net Udhaar</p>
                  <p className={`text-2xl font-bold mt-1 ${stats.netUdhaar > 0 ? "text-orange-600" : "text-green-600"}`}>
                    Rs. {Math.abs(stats.netUdhaar).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {stats.netUdhaar > 0 ? "Outstanding" : stats.netUdhaar < 0 ? "Overpaid" : "All settled ✓"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Debtors */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Top Debtors</h3>
                  <Link href="/customers">
                    <span className="text-xs text-blue-600 hover:underline">View all</span>
                  </Link>
                </div>
                {stats.topDebtors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
                    <p className="text-sm text-green-600 font-medium">🎉 Sab saaf hai!</p>
                    <p className="text-xs text-gray-400">Koi outstanding nahi.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {stats.topDebtors.map((c, i) => (
                      <Link key={c.id} href={`/customers/${c.id}`}>
                        <div className="px-6 py-4 flex items-center justify-between hover:bg-blue-50/40 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-blue-700">
                                {c.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                              {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-600 text-sm">
                              Rs. {c.totalUdhaar.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">#{i + 1}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
                  <Link href="/transactions">
                    <span className="text-xs text-blue-600 hover:underline">View all</span>
                  </Link>
                </div>
                {stats.recentTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Receipt className="h-8 w-8 text-gray-200" />
                    <p className="text-sm text-gray-400">Koi transaction nahi.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {stats.recentTransactions.map((tx) => (
                      <div key={tx.id} className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === "jama" ? "bg-red-100" : "bg-green-100"}`}>
                            {tx.type === "jama"
                              ? <ArrowUpCircle className="h-4 w-4 text-red-500" />
                              : <ArrowDownCircle className="h-4 w-4 text-green-500" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">
                              {tx.customer?.name ?? "—"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {tx.description || (tx.type === "jama" ? "Jama" : "Wapsi")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-sm ${tx.type === "jama" ? "text-red-600" : "text-green-600"}`}>
                            {tx.type === "jama" ? "+" : "-"} Rs. {tx.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(tx.createdAt).toLocaleDateString("en-PK", {
                              day: "numeric", month: "short",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-gray-200/50 bg-white/80 backdrop-blur-sm mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">© {new Date().getFullYear()} Digi Khata.</p>
        </div>
      </footer>
    </div>
  );
}
