"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowUpCircle, ArrowDownCircle,
  Loader2, Pencil, Plus, Receipt, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { AddTransactionForm } from "@/components/forms/add-transaction-form";
import { EditTransactionForm } from "@/components/forms/edit-transaction-form";
import type { Customer } from "@/types/customer";
import type { Transaction } from "@/types/transaction";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [txRes, custRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/customers"),
      ]);
      if (!txRes.ok || !custRes.ok) throw new Error("Fetch failed");
      const [txData, custData] = await Promise.all([txRes.json(), custRes.json()]);
      setTransactions(txData);
      setCustomers(custData);
    } catch {
      toast.error("Could not load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast.success("Transaction deleted");
    } catch {
      toast.error("Could not delete transaction");
    } finally {
      setDeletingId(null);
    }
  };

  const totalJama   = transactions.filter((t) => t.type === "jama").reduce((s, t) => s + t.amount, 0);
  const totalWapsi  = transactions.filter((t) => t.type === "wapsi").reduce((s, t) => s + t.amount, 0);
  const netUdhaar   = totalJama - totalWapsi;

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
                <Receipt className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-lg font-bold text-gray-800">Transactions</span>
              
            </div>
          </div>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button disabled={customers.length === 0}>
                <Plus className="h-4 w-4" /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
                
                <DialogDescription>Record Jama (diya) or Wapsi (liya).</DialogDescription>
              </DialogHeader>
              <AddTransactionForm
                customers={customers}
                onSuccess={() => { setAddOpen(false); fetchAll(); }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Summary Cards */}
        {!loading && transactions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ArrowUpCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Jama</p>
                <p className="text-2xl font-bold text-red-600">Rs. {totalJama.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Credit given</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ArrowDownCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Wapsi</p>
                <p className="text-2xl font-bold text-green-600">Rs. {totalWapsi.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Cash received</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${netUdhaar > 0 ? "bg-orange-100" : "bg-blue-100"}`}>
                <Receipt className={`h-6 w-6 ${netUdhaar > 0 ? "text-orange-500" : "text-blue-500"}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Net Udhaar</p>
                <p className={`text-2xl font-bold ${netUdhaar > 0 ? "text-orange-600" : "text-green-600"}`}>
                  Rs. {Math.abs(netUdhaar).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">
                  {netUdhaar > 0 ? "Still outstanding" : netUdhaar < 0 ? "Overpaid" : "Fully settled ✓"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Receipt className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Pehle customer add karein</h3>
            <p className="text-sm text-gray-500">Transaction ke liye ek bhi customer nahi hai.</p>
            <Link href="/customers"><Button>Go to Customers</Button></Link>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Receipt className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Koi transaction nahi</h3>
            <p className="text-sm text-gray-500">Pehla Jama ya Wapsi record karein.</p>
            <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add Transaction</Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">All Transactions</h2>
              {!loading && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {transactions.length}
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Customer", "Type", "Amount", "Description", "Date", "Actions"].map((h) => (
                      <th key={h} className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-blue-50/40 transition-colors">
                      {/* Customer */}
                      <td className="px-6 py-4">
                        <Link href={`/customers/${tx.customerId}`} className="flex items-center gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-700">
                              {tx.customer?.name.charAt(0).toUpperCase() ?? "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {tx.customer?.name ?? "—"}
                            </p>
                            {tx.customer?.phone && (
                              <p className="text-xs text-gray-400">{tx.customer.phone}</p>
                            )}
                          </div>
                        </Link>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${tx.type === "jama" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {tx.type === "jama" ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
                          {tx.type === "jama" ? "Jama" : "Wapsi"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <span className={`font-bold text-base ${tx.type === "jama" ? "text-red-600" : "text-green-600"}`}>
                          {tx.type === "jama" ? "+" : "-"} Rs. {tx.amount.toLocaleString()}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4 text-gray-500 max-w-[160px] truncate">
                        {tx.description ?? <span className="text-gray-300">—</span>}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setEditTx(tx)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                            disabled={deletingId === tx.id}
                            onClick={() => handleDelete(tx.id)}
                          >
                            {deletingId === tx.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200/50 bg-white/80 backdrop-blur-sm mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">© {new Date().getFullYear()} Digi Khata.</p>
        </div>
      </footer>

      {/* Edit Dialog */}
      <Dialog open={!!editTx} onOpenChange={(o) => !o && setEditTx(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update Jama/Wapsi details.</DialogDescription>
          </DialogHeader>
          {editTx && (
            <EditTransactionForm
              transaction={editTx}
              customers={customers}
              onSuccess={() => { setEditTx(null); fetchAll(); }}
              onCancel={() => setEditTx(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
