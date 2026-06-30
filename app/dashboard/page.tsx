"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  Receipt,
  TrendingUp,
  AlertCircle,
  Filter,
  X,
  CalendarDays,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Customer } from "@/types/customer";
import type { Transaction } from "@/types/transaction";

interface MonthlyData {
  month: string; // "YYYY-MM"
  jama: number;
  wapsi: number;
}

interface DashboardData {
  totalCustomers: number;
  totalJama: number;
  totalWapsi: number;
  netUdhaar: number;
  transactionCount: number;
  recentTransactions: Transaction[];
  topDebtors: (Customer & { totalUdhaar: number })[];
  monthly: MonthlyData[];
}

interface Filters {
  dateFrom: string;
  dateTo: string;
  customerId: string;
  type: string;
}

const EMPTY_FILTERS: Filters = {
  dateFrom: "",
  dateTo: "",
  customerId: "",
  type: "",
};

function formatMonth(yyyymm: string) {
  const [y, m] = yyyymm.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-PK", {
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [showFilter, setShowFilter] = useState(false);

  const hasActive = Object.values(applied).some(Boolean);

  // Fetch customers list once for the filter dropdown
  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then(setCustomers)
      .catch(() => {});
  }, []);

  const fetchDashboard = useCallback(async (f: Filters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (f.dateFrom) params.set("dateFrom", f.dateFrom);
      if (f.dateTo) params.set("dateTo", f.dateTo);
      if (f.customerId) params.set("customerId", f.customerId);
      if (f.type) params.set("type", f.type);

      const res = await fetch(`/api/dashboard?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Server error");
      setData(json);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load dashboard";
      setError(msg);
      toast.error(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(applied);
  }, [applied, fetchDashboard]);

  const applyFilters = () => {
    setApplied(filters);
    setShowFilter(false);
  };
  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setShowFilter(false);
  };

  // Bar chart: find max for scaling
  const maxBar = data
    ? Math.max(...data.monthly.map((m) => Math.max(m.jama, m.wapsi)), 1)
    : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
          {/* Title */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Back to Home — desktop only, mobile uses bottom nav */}
            <Link
              href="/"
              className="hidden md:flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mr-1"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <div className="hidden md:block h-4 w-px bg-gray-200 mr-1" />
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-800 truncate">
              Dashboard
            </span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant={hasActive ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilter((v) => !v)}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">
                {hasActive ? "Filters Active" : "Filter"}
              </span>
            </Button>
          </div>
        </div>

        {/* Filter panel — slides in below header */}
        {showFilter && (
          <div className="border-t border-gray-100 bg-white px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <CalendarDays className="h-3.5 w-3.5" /> From
                </Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, dateFrom: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5 text-xs">
                  <CalendarDays className="h-3.5 w-3.5" /> To
                </Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, dateTo: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Customer</Label>
                <Select
                  value={filters.customerId}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, customerId: e.target.value }))
                  }
                >
                  <option value="">All customers</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select
                  value={filters.type}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, type: e.target.value }))
                  }
                >
                  <option value="">Jama + Wapsi</option>
                  <option value="jama">Jama only</option>
                  <option value="wapsi">Wapsi only</option>
                </Select>
              </div>
            </div>
            <div className="max-w-7xl mx-auto flex gap-2 mt-4">
              <Button onClick={applyFilters}>Apply Filters</Button>
              {hasActive && (
                <Button variant="outline" onClick={clearFilters}>
                  <X className="h-4 w-4" /> Clear
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Active filter pills */}
      {hasActive && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-wrap gap-2">
          {applied.dateFrom && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
              From: {applied.dateFrom}
            </span>
          )}
          {applied.dateTo && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
              To: {applied.dateTo}
            </span>
          )}
          {applied.customerId && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
              Customer:{" "}
              {customers.find((c) => c.id === applied.customerId)?.name ??
                applied.customerId}
            </span>
          )}
          {applied.type && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium capitalize">
              {applied.type} only
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-red-500 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <>
            {/* Summary cards skeleton */}
            <div>
              <Skeleton className="h-4 w-24 mb-4 bg-gray-200" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 space-y-3 animate-pulse"
                  >
                    <Skeleton className="w-10 h-10 rounded-xl bg-gray-200" />
                    <Skeleton className="h-4 w-20 bg-gray-200" />
                    <Skeleton className="h-6 w-32 bg-gray-200" />
                    <Skeleton className="h-3 w-16 bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Chart skeleton */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 space-y-4">
              <Skeleton className="h-5 w-48 bg-gray-200" />
              <div className="flex items-end justify-between gap-3 h-40 pt-4 animate-pulse">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="w-full flex items-end gap-1 h-28">
                      <Skeleton className="flex-1 h-16 rounded-t bg-gray-200" />
                      <Skeleton className="flex-1 h-24 rounded-t bg-gray-200" />
                    </div>
                    <Skeleton className="h-3 w-12 bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Debtors skeleton */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 space-y-4 animate-pulse">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-28 bg-gray-200" />
                    <Skeleton className="h-3.5 w-36 bg-gray-200" />
                  </div>
                  <Skeleton className="h-4 w-16 bg-gray-200" />
                </div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2 py-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-7 h-7 rounded-full bg-gray-200" />
                        <Skeleton className="h-4 w-24 bg-gray-200" />
                      </div>
                      <Skeleton className="h-4 w-16 bg-gray-200" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded bg-gray-200" />
                  </div>
                ))}
              </div>

              {/* Recent Transactions skeleton */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 space-y-4 animate-pulse">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32 bg-gray-200" />
                    <Skeleton className="h-3.5 w-24 bg-gray-200" />
                  </div>
                  <Skeleton className="h-4 w-16 bg-gray-200" />
                </div>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-1"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full bg-gray-200" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-20 bg-gray-200" />
                        <Skeleton className="h-3 w-28 bg-gray-200" />
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-4 w-16 bg-gray-200" />
                      <Skeleton className="h-3 w-12 bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Balances skeleton */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden animate-pulse">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-36 bg-gray-200" />
                  <Skeleton className="h-3.5 w-32 bg-gray-200" />
                </div>
                <Skeleton className="h-4 w-16 bg-gray-200" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-50">
                    {[...Array(3)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-7 h-7 rounded-full bg-gray-200" />
                            <Skeleton className="h-4 w-24 bg-gray-200" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            <Skeleton className="h-4 w-20 bg-gray-200" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            <Skeleton className="h-4 w-20 bg-gray-200" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            <Skeleton className="h-4.5 w-20 bg-gray-200" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            <Skeleton className="h-5 w-16 rounded-full bg-gray-200" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <p className="text-sm text-gray-500">
              {error ?? "Could not load data."}
            </p>
            <Button onClick={() => fetchDashboard(applied)}>Retry</Button>
          </div>
        ) : (
          <>
            {/* ── Summary Cards ── */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                {hasActive ? "Filtered Summary" : "Overview"}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    {hasActive ? "Transactions" : "Customers"}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {hasActive ? data.transactionCount : data.totalCustomers}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {hasActive ? "in selected range" : "total"}
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-3">
                    <ArrowUpCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Total Jama
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    Rs.&nbsp;{data.totalJama.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Credit given</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                    <ArrowDownCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Total Wapsi
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    Rs.&nbsp;{data.totalWapsi.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Cash received</p>
                </div>

                <div
                  className={`rounded-2xl border shadow-lg p-5 ${
                    data.netUdhaar > 0
                      ? "bg-orange-50 border-orange-200"
                      : "bg-white border-gray-100"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      data.netUdhaar > 0 ? "bg-orange-100" : "bg-green-100"
                    }`}
                  >
                    <Receipt
                      className={`h-5 w-5 ${
                        data.netUdhaar > 0
                          ? "text-orange-500"
                          : "text-green-500"
                      }`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Net Udhaar
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      data.netUdhaar > 0 ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    Rs.&nbsp;{Math.abs(data.netUdhaar).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {data.netUdhaar > 0
                      ? "Outstanding"
                      : data.netUdhaar < 0
                      ? "Overpaid"
                      : "All settled ✓"}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Monthly Chart ── */}
            {data.monthly.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-6">
                  Monthly Activity (Last 6 months)
                </h3>
                <div className="flex items-end justify-between gap-3 h-40">
                  {data.monthly.map((m) => (
                    <div
                      key={m.month}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div className="w-full flex items-end gap-1 h-28">
                        {/* Jama bar */}
                        <div className="flex-1 flex flex-col justify-end">
                          <div
                            className="bg-red-400 rounded-t-sm transition-all"
                            style={{
                              height: `${(m.jama / maxBar) * 100}%`,
                              minHeight: m.jama > 0 ? "4px" : "0",
                            }}
                            title={`Jama: Rs. ${m.jama.toLocaleString()}`}
                          />
                        </div>
                        {/* Wapsi bar */}
                        <div className="flex-1 flex flex-col justify-end">
                          <div
                            className="bg-green-400 rounded-t-sm transition-all"
                            style={{
                              height: `${(m.wapsi / maxBar) * 100}%`,
                              minHeight: m.wapsi > 0 ? "4px" : "0",
                            }}
                            title={`Wapsi: Rs. ${m.wapsi.toLocaleString()}`}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 text-center whitespace-nowrap">
                        {formatMonth(m.month)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-6 mt-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-red-400" />
                    <span className="text-xs text-gray-500">Jama</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-green-400" />
                    <span className="text-xs text-gray-500">Wapsi</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ── Top Debtors ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">Top Debtors</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Highest outstanding udhaar
                    </p>
                  </div>
                  <Link href="/customers">
                    <span className="text-xs text-blue-600 hover:underline">
                      View all →
                    </span>
                  </Link>
                </div>
                {data.topDebtors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
                    <p className="text-2xl">🎉</p>
                    <p className="text-sm text-green-600 font-medium">
                      Sab saaf hai!
                    </p>
                    <p className="text-xs text-gray-400">
                      Koi outstanding udhaar nahi.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {data.topDebtors.map((c, i) => {
                      const max = data.topDebtors[0].totalUdhaar;
                      const pct = max > 0 ? (c.totalUdhaar / max) * 100 : 0;
                      return (
                        <Link key={c.id} href={`/customers/${c.id}`}>
                          <div className="px-6 py-4 hover:bg-blue-50/40 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-blue-700">
                                    {c.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">
                                    {c.name}
                                  </p>
                                  {c.phone && (
                                    <p className="text-xs text-gray-400">
                                      {c.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-orange-600 text-sm">
                                  Rs.&nbsp;{c.totalUdhaar.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-400">
                                  #{i + 1}
                                </p>
                              </div>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-orange-400 h-1.5 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Recent Transactions ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Recent Transactions
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {hasActive ? "Filtered results" : "Latest 10 entries"}
                    </p>
                  </div>
                  <Link href="/transactions">
                    <span className="text-xs text-blue-600 hover:underline">
                      View all →
                    </span>
                  </Link>
                </div>
                {data.recentTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Receipt className="h-8 w-8 text-gray-200" />
                    <p className="text-sm text-gray-400">
                      {hasActive
                        ? "No transactions match filters."
                        : "Koi transaction nahi."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {data.recentTransactions.map((tx) => (
                      <Link key={tx.id} href={`/customers/${tx.customerId}`}>
                        <div className="px-6 py-3 flex items-center justify-between hover:bg-blue-50/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                tx.type === "jama"
                                  ? "bg-red-100"
                                  : "bg-green-100"
                              }`}
                            >
                              {tx.type === "jama" ? (
                                <ArrowUpCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <ArrowDownCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">
                                {tx.customer?.name ?? "—"}
                              </p>
                              <p className="text-xs text-gray-400">
                                {tx.description ??
                                  (tx.type === "jama" ? "Jama" : "Wapsi")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-bold text-sm ${
                                tx.type === "jama"
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {tx.type === "jama" ? "+" : "−"}&nbsp;Rs.&nbsp;
                              {tx.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(tx.createdAt).toLocaleDateString(
                                "en-PK",
                                {
                                  day: "numeric",
                                  month: "short",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── All Customers Balance Summary ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Customer Balances
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Net udhaar per customer
                  </p>
                </div>
                <Link href="/customers">
                  <span className="text-xs text-blue-600 hover:underline">
                    Manage →
                  </span>
                </Link>
              </div>
              {data.topDebtors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <p className="text-sm text-gray-400">
                    No outstanding balances.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Jama
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Wapsi
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Net Udhaar
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.topDebtors.map((c) => (
                          <tr
                            key={c.id}
                            className="hover:bg-blue-50/30 transition-colors"
                          >
                            <td className="px-6 py-3">
                              <Link
                                href={`/customers/${c.id}`}
                                className="flex items-center gap-3"
                              >
                                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-blue-700">
                                    {c.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-900 hover:text-blue-600">
                                  {c.name}
                                </span>
                              </Link>
                            </td>
                            <td className="px-6 py-3 text-right text-red-600 font-medium">
                              Rs.&nbsp;{(c.totalJama ?? 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-3 text-right text-green-600 font-medium">
                              Rs.&nbsp;{(c.totalWapsi ?? 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-3 text-right font-bold text-orange-600">
                              Rs.&nbsp;{c.totalUdhaar.toLocaleString()}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                Pending
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile Cards */}
                  <div className="block md:hidden divide-y divide-gray-100">
                    {data.topDebtors.map((c) => (
                      <Link key={c.id} href={`/customers/${c.id}`}>
                        <div className="p-4 hover:bg-blue-50/40 active:bg-blue-100/40 transition-colors space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-blue-700">
                                  {c.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-semibold text-gray-900">
                                {c.name}
                              </span>
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              Pending
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 pl-10">
                            <span>
                              Jama:{" "}
                              <span className="text-red-600 font-medium">
                                Rs. {(c.totalJama ?? 0).toLocaleString()}
                              </span>
                            </span>
                            <span>
                              Wapsi:{" "}
                              <span className="text-green-600 font-medium">
                                Rs. {(c.totalWapsi ?? 0).toLocaleString()}
                              </span>
                            </span>
                          </div>
                          <div className="flex justify-between text-sm font-bold pl-10">
                            <span className="text-gray-500">Net Udhaar</span>
                            <span className="text-orange-600">
                              Rs. {c.totalUdhaar.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="hidden md:block border-t border-gray-200/50 bg-white/80 backdrop-blur-sm mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Digi Khata.
          </p>
        </div>
      </footer>
    </div>
  );
}
