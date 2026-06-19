"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowUpCircle, ArrowDownCircle,
  Loader2, Phone, MapPin, Plus, Receipt,
  Pencil, Trash2,
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

export default function CustomerLedgerPage() {
  const { id } = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [custRes, txRes] = await Promise.all([
        fetch(`/api/customers/${id}`),
        fetch(`/api/transactions?customerId=${id}`),
      ]);
      if (!custRes.ok) throw new Error("Customer not found");
      const [custData, txData] = await Promise.all([custRes.json(), txRes.json()]);
      setCustomer(custData);
      setTransactions(txData);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (txId: string) => {
    if (!confirm("Delete this transaction?")) return;
    setDeletingId(txId);
    try {
      const res = await fetch(`/api/transactions/${txId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTransactions((prev) => prev.filter((t) => t.id !== txId));
      // refresh customer totals
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Customer not found.</p>
        <Link href="/customers"><Button>Back to Customers</Button></Link>
      </div>
    );
  }

  const totalJama  = customer.totalJama  ?? 0;
  const totalWapsi = customer.totalWapsi ?? 0;
  const netUdhaar  = customer.totalUdhaar ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/customers">
              <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Customers
              </button>
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-bold text-gray-900 leading-tight">{customer.name}</p>
                {customer.phone && (
                  <p className="text-xs text-gray-400">{customer.phone}</p>
                )}
              </div>
            </div>
          </div>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
                <DialogDescription>
                  Jama (diya) ya Wapsi (liya) record karein — {customer.name}
                </DialogDescription>
              </DialogHeader>
              <AddTransactionForm
                customers={[customer]}
                defaultCustomerId={customer.id}
                onSuccess={() => { setAddOpen(false); fetchAll(); }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Customer Info + Balance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Profile card */}
          <div className="md:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-lg p-6 space-y-3">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{customer.name}</h2>
              {customer.phone && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                  <Phone className="h-3.5 w-3.5" /> {customer.phone}
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                  <MapPin className="h-3.5 w-3.5" /> {customer.address}
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">Customer since</p>
              <p className="text-sm font-medium text-gray-700">
                {new Date(customer.createdAt).toLocaleDateString("en-PK", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Balance cards */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 flex flex-col gap-1">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-2">
                <ArrowUpCircle className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Jama (Diya)</p>
              <p className="text-2xl font-bold text-red-600">Rs. {totalJama.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 flex flex-col gap-1">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-2">
                <ArrowDownCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Wapsi (Liya)</p>
              <p className="text-2xl font-bold text-green-600">Rs. {totalWapsi.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 flex flex-col gap-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${netUdhaar > 0 ? "bg-orange-100" : "bg-blue-100"}`}>
                <Receipt className={`h-5 w-5 ${netUdhaar > 0 ? "text-orange-500" : "text-blue-500"}`} />
              </div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Net Udhaar</p>
              <p className={`text-2xl font-bold ${netUdhaar > 0 ? "text-orange-600" : "text-green-600"}`}>
                Rs. {Math.abs(netUdhaar).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">
                {netUdhaar > 0 ? "Baaki hai" : netUdhaar < 0 ? "Zyada diya" : "Saaf ✓"}
              </p>
            </div>
          </div>
        </div>

        {/* Ledger table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Khata</h2>
            <span className="text-sm text-gray-500">{transactions.length} entries</span>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Receipt className="h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-400">Koi transaction nahi. Pehla entry karein.</p>
              <Button variant="outline" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4" /> Add Transaction
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Jama</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Wapsi</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${tx.type === "jama" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {tx.type === "jama" ? <ArrowUpCircle className="h-3 w-3" /> : <ArrowDownCircle className="h-3 w-3" />}
                          {tx.type === "jama" ? "Jama" : "Wapsi"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">
                        {tx.description ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-red-600">
                        {tx.type === "jama" ? `Rs. ${tx.amount.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">
                        {tx.type === "wapsi" ? `Rs. ${tx.amount.toLocaleString()}` : "—"}
                      </td>
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
                {/* Footer row */}
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-sm font-bold text-gray-700">Total</td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-red-600">
                      Rs. {totalJama.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-green-600">
                      Rs. {totalWapsi.toLocaleString()}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-200/50 bg-white/80 backdrop-blur-sm mt-8">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">© {new Date().getFullYear()} Digi Khata.</p>
        </div>
      </footer>

      {/* Edit Dialog */}
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
              onSuccess={() => { setEditTx(null); fetchAll(); }}
              onCancel={() => setEditTx(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
