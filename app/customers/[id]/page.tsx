"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
  Phone,
  MapPin,
  Plus,
  Receipt,
  Pencil,
  Trash2,
  CalendarDays,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddTransactionForm } from "@/components/forms/add-transaction-form";
import { EditTransactionForm } from "@/components/forms/edit-transaction-form";
import { EditCustomerForm } from "@/components/forms/edit-customer-form";
import type { Customer } from "@/types/customer";
import type { Transaction } from "@/types/transaction";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [confirmTx, setConfirmTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "jama" | "wapsi">("all");

  const fetchAll = useCallback(async () => {
    try {
      const [custRes, txRes] = await Promise.all([
        fetch(`/api/customers/${id}`),
        fetch(`/api/transactions?customerId=${id}`),
      ]);
      if (!custRes.ok) throw new Error("Customer not found");
      const [custData, txData] = await Promise.all([
        custRes.json(),
        txRes.json(),
      ]);
      setCustomer(custData);
      setTransactions(txData);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDeleteTx = async (tx: Transaction) => {
    setDeletingId(tx.id);
    setConfirmTx(null);
    try {
      const res = await fetch(`/api/transactions/${tx.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
      // Refresh customer totals
      const custRes = await fetch(`/api/customers/${id}`);
      if (custRes.ok) setCustomer(await custRes.json());
      toast.success("Transaction deleted");
    } catch {
      toast.error("Could not delete");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-20" />
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-9 h-9 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Profile card skeleton */}
            <div className="md:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-lg p-6 flex flex-col gap-4">
              <Skeleton className="w-16 h-16 rounded-2xl animate-pulse" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Balance cards skeleton */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 space-y-3"
                >
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Ledger skeleton */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3.5 w-24" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
            {/* Desktop ledger skeleton */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {[...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-32" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <Skeleton className="w-8 h-8 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile ledger skeleton */}
            <div className="block md:hidden divide-y divide-gray-50">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-36" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Users className="h-12 w-12 text-gray-300" />
        <p className="text-gray-500">Customer not found.</p>
        <Link href="/customers">
          <Button>Back to Customers</Button>
        </Link>
      </div>
    );
  }

  const totalJama = customer.totalJama ?? 0;
  const totalWapsi = customer.totalWapsi ?? 0;
  const netUdhaar = customer.totalUdhaar ?? 0;

  // Filtered + running balance
  const filtered =
    typeFilter === "all"
      ? transactions
      : transactions.filter((t) => t.type === typeFilter);

  const chronological = [...filtered].reverse();
  let running = 0;
  const withBalance = chronological.map((tx) => {
    running += tx.type === "jama" ? tx.amount : -tx.amount;
    return { ...tx, runningBalance: running };
  });
  const displayRows = [...withBalance].reverse();

  const filtJama = filtered
    .filter((t) => t.type === "jama")
    .reduce((s, t) => s + t.amount, 0);
  const filtWapsi = filtered
    .filter((t) => t.type === "wapsi")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ── Header ── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
          {/* Back + name */}
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/customers">
              <button
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors min-h-[44px] px-1"
                aria-label="Back to Customers"
              >
                <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Customers</span>
              </button>
            </Link>
            <div className="h-4 w-px bg-gray-200 flex-shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-bold text-gray-900 truncate text-sm sm:text-base">
                {customer.name}
              </span>
            </div>
          </div>

        
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── Customer profile + balance ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Profile card */}
          <div className="md:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-lg p-6 flex flex-col gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-900">
                {customer.name}
              </h2>
              {customer.phone && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />{" "}
                  {customer.phone}
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />{" "}
                  {customer.address}
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <CalendarDays className="h-3.5 w-3.5" />
                Customer since
              </div>
              <p className="text-sm font-medium text-gray-700 mt-0.5">
                {new Date(customer.createdAt).toLocaleDateString("en-PK", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="pt-1 border-t border-gray-100">
              <p className="text-xs text-gray-400">Total transactions</p>
              <p className="text-lg font-bold text-gray-800">
                {transactions.length}
              </p>
            </div>
          </div>

          {/* Balance cards */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-3">
                <ArrowUpCircle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Total Jama
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                Rs. {totalJama.toLocaleString()}
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
                Rs. {totalWapsi.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Cash received</p>
            </div>

            <div
              className={`rounded-2xl border shadow-lg p-5 ${
                netUdhaar > 0
                  ? "bg-orange-50 border-orange-200"
                  : "bg-white border-gray-100"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  netUdhaar > 0 ? "bg-orange-100" : "bg-green-100"
                }`}
              >
                <Receipt
                  className={`h-5 w-5 ${
                    netUdhaar > 0 ? "text-orange-500" : "text-green-500"
                  }`}
                />
              </div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Net Udhaar
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  netUdhaar > 0 ? "text-orange-600" : "text-green-600"
                }`}
              >
                Rs. {Math.abs(netUdhaar).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {netUdhaar > 0
                  ? "Baaki hai"
                  : netUdhaar < 0
                  ? "Zyada diya"
                  : "Saaf ✓"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Ledger Table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-semibold text-gray-800 text-sm sm:text-base">
                Transaction History
              </h2>
              <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                Complete khata ledger
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-gray-500 hidden sm:inline">
                {filtered.length} entries
              </span>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as "all" | "jama" | "wapsi")
                }
                className="text-xs border border-gray-200 rounded-lg px-2 py-2 text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              >
                <option value="all">All</option>
                <option value="jama">Jama</option>
                <option value="wapsi">Wapsi</option>
              </select>
              <Button
                size="sm"
                onClick={() => setAddOpen(true)}
                aria-label="Add transaction"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Receipt className="h-8 w-8 text-gray-300" />
              </div>
              <div>
                <p className="font-medium text-gray-600">
                  Koi transaction nahi
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Pehla Jama ya Wapsi record karein.
                </p>
              </div>
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4" /> Add First Transaction
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Ledger Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider text-red-500">
                        Jama ↑
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider text-green-500">
                        Wapsi ↓
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {displayRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-10 text-center text-sm text-gray-400"
                        >
                          No {typeFilter} entries.
                        </td>
                      </tr>
                    ) : (
                      displayRows.map((tx) => (
                        <tr
                          key={tx.id}
                          className={`transition-colors ${
                            tx.type === "jama"
                              ? "hover:bg-red-50/30"
                              : "hover:bg-green-50/30"
                          }`}
                        >
                          <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                            {new Date(tx.createdAt).toLocaleDateString(
                              "en-PK",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">
                            {tx.description ?? (
                              <span className="text-gray-300 italic">
                                No description
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                tx.type === "jama"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {tx.type === "jama" ? (
                                <ArrowUpCircle className="h-3 w-3" />
                              ) : (
                                <ArrowDownCircle className="h-3 w-3" />
                              )}
                              {tx.type === "jama" ? "Jama" : "Wapsi"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-red-600">
                            {tx.type === "jama" ? (
                              `Rs. ${tx.amount.toLocaleString()}`
                            ) : (
                              <span className="text-gray-200">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-green-600">
                            {tx.type === "wapsi" ? (
                              `Rs. ${tx.amount.toLocaleString()}`
                            ) : (
                              <span className="text-gray-200">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={`font-bold text-xs ${
                                tx.runningBalance > 0
                                  ? "text-orange-600"
                                  : tx.runningBalance < 0
                                  ? "text-blue-600"
                                  : "text-green-600"
                              }`}
                            >
                              Rs. {Math.abs(tx.runningBalance).toLocaleString()}
                            </span>
                            <span className="text-gray-400 text-xs ml-1">
                              {tx.runningBalance > 0
                                ? "↑"
                                : tx.runningBalance < 0
                                ? "↓"
                                : "✓"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditTx(tx)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                disabled={deletingId === tx.id}
                                onClick={() => setConfirmTx(tx)}
                              >
                                {deletingId === tx.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>

                  {/* Totals footer */}
                  <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-3 text-sm font-bold text-gray-700"
                      >
                        {typeFilter === "all"
                          ? "Grand Total"
                          : `${typeFilter === "jama" ? "Jama" : "Wapsi"} Total`}
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-red-600">
                        Rs. {filtJama.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-bold text-green-600">
                        Rs. {filtWapsi.toLocaleString()}
                      </td>
                      <td
                        className={`px-6 py-3 text-right text-sm font-bold ${
                          filtJama - filtWapsi > 0
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        Rs. {Math.abs(filtJama - filtWapsi).toLocaleString()}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile Card Ledger View */}
              <div className="block md:hidden divide-y divide-gray-100">
                {displayRows.length === 0 ? (
                  <div className="px-6 py-10 text-center text-sm text-gray-400">
                    No {typeFilter} entries.
                  </div>
                ) : (
                  displayRows.map((tx) => (
                    <div
                      key={tx.id}
                      className={`p-4 transition-colors cursor-pointer space-y-3 ${
                        tx.type === "jama"
                          ? "hover:bg-red-50/20 active:bg-red-50/30"
                          : "hover:bg-green-50/20 active:bg-green-50/30"
                      }`}
                      onClick={() => router.push(`/transactions/${tx.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          {new Date(tx.createdAt).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            tx.type === "jama"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {tx.type === "jama" ? (
                            <ArrowUpCircle className="h-3 w-3" />
                          ) : (
                            <ArrowDownCircle className="h-3 w-3" />
                          )}
                          {tx.type === "jama" ? "Jama" : "Wapsi"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">
                          {tx.description ?? (
                            <span className="text-gray-300 italic">
                              No description
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span
                            className={`font-bold text-sm ${
                              tx.type === "jama"
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {tx.type === "jama" ? "+" : "−"} Rs.{" "}
                            {tx.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1">
                        <div className="text-gray-500">
                          Balance:{" "}
                          <span
                            className={`font-bold ${
                              tx.runningBalance > 0
                                ? "text-orange-600"
                                : tx.runningBalance < 0
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          >
                            Rs. {Math.abs(tx.runningBalance).toLocaleString()}
                          </span>
                          <span className="text-gray-400 ml-0.5">
                            {tx.runningBalance > 0
                              ? "↑"
                              : tx.runningBalance < 0
                              ? "↓"
                              : "✓"}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditTx(tx)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                            disabled={deletingId === tx.id}
                            onClick={() => setConfirmTx(tx)}
                          >
                            {deletingId === tx.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {/* Grand totals in mobile view */}
                <div className="bg-gray-50 p-4 border-t border-gray-100 flex flex-col gap-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-500">Total Jama:</span>
                    <span className="text-red-600 font-semibold">
                      Rs. {filtJama.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-500">Total Wapsi:</span>
                    <span className="text-green-600 font-semibold">
                      Rs. {filtWapsi.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-gray-200/60 pt-1 text-sm">
                    <span className="text-gray-700">Net Udhaar:</span>
                    <span
                      className={
                        filtJama - filtWapsi > 0
                          ? "text-orange-600"
                          : "text-green-600"
                      }
                    >
                      Rs. {Math.abs(filtJama - filtWapsi).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="hidden md:block border-t border-gray-200/50 bg-white/80 backdrop-blur-sm mt-8">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Digi Khata.
          </p>
        </div>
      </footer>

      {/* Edit Customer Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer details.</DialogDescription>
          </DialogHeader>
          <EditCustomerForm
            customer={customer}
            onSuccess={() => {
              setEditOpen(false);
              fetchAll();
            }}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={!!editTx} onOpenChange={(o) => !o && setEditTx(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update karein.</DialogDescription>
          </DialogHeader>
          {editTx && (
            <EditTransactionForm
              transaction={editTx}
              customers={[customer]}
              onSuccess={() => {
                setEditTx(null);
                fetchAll();
              }}
              onCancel={() => setEditTx(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Transaction Confirmation */}
      <Dialog open={!!confirmTx} onOpenChange={(o) => !o && setConfirmTx(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Transaction?</DialogTitle>
            <DialogDescription>
              {confirmTx && (
                <>
                  Permanently delete this{" "}
                  <strong>
                    {confirmTx.type === "jama" ? "Jama" : "Wapsi"}
                  </strong>{" "}
                  of <strong>Rs. {confirmTx.amount.toLocaleString()}</strong>
                  {confirmTx.description ? ` (${confirmTx.description})` : ""}?
                  This cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setConfirmTx(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!!deletingId}
              onClick={() => confirmTx && handleDeleteTx(confirmTx)}
            >
              {deletingId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Yes, Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
