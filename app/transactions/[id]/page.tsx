"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowUpCircle, ArrowDownCircle,
  Loader2, Pencil, Trash2, Receipt,
  CalendarDays, User, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { EditTransactionForm } from "@/components/forms/edit-transaction-form";
import type { Customer } from "@/types/customer";
import type { Transaction } from "@/types/transaction";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [tx, setTx]           = useState<Transaction | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchTx = useCallback(async () => {
    try {
      const [txRes, custRes] = await Promise.all([
        fetch(`/api/transactions/${id}`),
        fetch("/api/customers"),
      ]);
      if (!txRes.ok) throw new Error("Transaction not found");
      const [txData, custData] = await Promise.all([txRes.json(), custRes.json()]);
      setTx(txData);
      setCustomers(custData);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load transaction");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Transaction deleted");
      router.push("/transactions");
    } catch {
      toast.error("Could not delete transaction");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-16 sm:w-24 bg-gray-200" />
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-lg bg-gray-200" />
                <Skeleton className="h-5 w-24 sm:w-32 bg-gray-200" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-11 w-11 md:h-8 md:w-16 bg-gray-200 rounded-lg" />
              <Skeleton className="h-11 w-11 md:h-8 md:w-16 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          {/* Amount card skeleton */}
          <div className="rounded-2xl border border-gray-200 bg-white/60 shadow-lg p-8 text-center space-y-4 animate-pulse">
            <Skeleton className="w-16 h-16 rounded-full mx-auto bg-gray-200" />
            <Skeleton className="h-10 w-48 mx-auto bg-gray-200" />
            <Skeleton className="h-6 w-32 mx-auto rounded-full bg-gray-200" />
          </div>

          {/* Details card skeleton */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg divide-y divide-gray-50 p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 pt-2">
                <Skeleton className="w-9 h-9 rounded-xl bg-gray-200" />
                <div className="space-y-1.5 flex-1 animate-pulse">
                  <Skeleton className="h-3 w-16 bg-gray-200" />
                  <Skeleton className="h-5 w-48 bg-gray-200" />
                </div>
              </div>
            ))}
          </div>

          {/* Link card skeleton */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-4 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-full bg-gray-200" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28 bg-gray-200" />
                <Skeleton className="h-3 w-20 bg-gray-200" />
              </div>
            </div>
            <Skeleton className="h-4 w-4 rounded bg-gray-200" />
          </div>
        </main>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Receipt className="h-12 w-12 text-gray-300" />
        <p className="text-gray-500">Transaction not found.</p>
        <Link href="/transactions"><Button>Back to Transactions</Button></Link>
      </div>
    );
  }

  const isJama = tx.type === "jama";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/transactions">
              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors min-h-[44px] px-1" aria-label="Back to Transactions">
                <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Transactions</span>
              </button>
            </Link>
            <div className="h-4 w-px bg-gray-200 flex-shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isJama ? "bg-red-100" : "bg-green-100"}`}>
                <Receipt className={`h-4 w-4 ${isJama ? "text-red-600" : "text-green-600"}`} />
              </div>
              <span className="text-sm sm:text-base font-bold text-gray-800 truncate">Transaction Detail</span>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} aria-label="Edit">
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {/* Amount card */}
        <div className={`rounded-2xl border shadow-lg p-8 text-center ${isJama ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isJama ? "bg-red-100" : "bg-green-100"}`}>
            {isJama
              ? <ArrowUpCircle className="h-8 w-8 text-red-500" />
              : <ArrowDownCircle className="h-8 w-8 text-green-500" />}
          </div>
          <p className={`text-4xl font-bold ${isJama ? "text-red-600" : "text-green-600"}`}>
            {isJama ? "+" : "−"} Rs. {tx.amount.toLocaleString()}
          </p>
          <span className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-sm font-semibold ${isJama ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {isJama ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
            {isJama ? "Jama (Diya)" : "Wapsi (Liya)"}
          </span>
        </div>

        {/* Details card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg divide-y divide-gray-50">
          {/* Customer */}
          <div className="px-6 py-4 flex items-center gap-4">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Customer</p>
              <Link
                href={`/customers/${tx.customerId}`}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {tx.customer?.name ?? "—"}
              </Link>
            </div>
          </div>

          {/* Description */}
          <div className="px-6 py-4 flex items-center gap-4">
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Description</p>
              <p className="font-medium text-gray-900">
                {tx.description ?? <span className="text-gray-400 font-normal">No description</span>}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="px-6 py-4 flex items-center gap-4">
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CalendarDays className="h-4 w-4 text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Date</p>
              <p className="font-medium text-gray-900">
                {new Date(tx.createdAt).toLocaleDateString("en-PK", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(tx.createdAt).toLocaleTimeString("en-PK", {
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Updated */}
          {tx.updatedAt !== tx.createdAt && (
            <div className="px-6 py-3 bg-gray-50">
              <p className="text-xs text-gray-400">
                Last updated:{" "}
                {new Date(tx.updatedAt).toLocaleDateString("en-PK", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>

        {/* View customer ledger link */}
        <Link href={`/customers/${tx.customerId}`}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg px-6 py-4 flex items-center justify-between hover:bg-blue-50/40 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-700">
                  {tx.customer?.name.charAt(0).toUpperCase() ?? "?"}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{tx.customer?.name}</p>
                <p className="text-xs text-gray-400">View full ledger</p>
              </div>
            </div>
            <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
          </div>
        </Link>
      </main>

      <footer className="hidden md:block border-t border-gray-200/50 bg-white/80 backdrop-blur-sm mt-8">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">© {new Date().getFullYear()} Digi Khata.</p>
        </div>
      </footer>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update the transaction details.</DialogDescription>
          </DialogHeader>
          {tx && (
            <EditTransactionForm
              transaction={tx}
              customers={customers}
              onSuccess={() => { setEditOpen(false); fetchTx(); }}
              onCancel={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Transaction?</DialogTitle>
            <DialogDescription>
              This will permanently delete this {isJama ? "Jama" : "Wapsi"} of{" "}
              <strong>Rs. {tx.amount.toLocaleString()}</strong> for{" "}
              <strong>{tx.customer?.name}</strong>. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
  <Button
    variant="outline"
    className="w-32"
    onClick={() => setConfirmDelete(false)}
  >
    Cancel
  </Button>

  <Button
    variant="destructive"
    className="w-32"
    onClick={handleDelete}
    disabled={deleting}
  >
    {deleting ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Trash2 className="h-4 w-4" />
    )}
    {deleting ? "Deleting..." : "Yes, Delete"}
  </Button>
</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
