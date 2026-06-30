"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { AddCustomerForm } from "@/components/forms/add-customer-form";
import { EditCustomerForm } from "@/components/forms/edit-customer-form";
import type { Customer } from "@/types/customer";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [loading, setLoading]       = useState(true);
  const [addOpen, setAddOpen]       = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId]   = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error();
      setCustomers(await res.json());
    } catch {
      toast.error("Could not load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setConfirmId(null);
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      toast.success("Customer deleted");
    } catch {
      toast.error("Could not delete customer");
    } finally {
      setDeletingId(null);
    }
  };

  const confirmCustomer = customers.find((c) => c.id === confirmId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
          {/* Title */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Back to Home — desktop only, mobile uses bottom nav */}
            <Link href="/" className="hidden md:flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mr-1">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
            <div className="hidden md:block h-4 w-px bg-gray-200 mr-1" />
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-800 truncate">Customers</span>
           
          </div>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex-shrink-0">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Customer</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>Fill in the details to add a customer.</DialogDescription>
              </DialogHeader>
              <AddCustomerForm onSuccess={() => { setAddOpen(false); fetchCustomers(); }} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            {/* Desktop skeleton */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Address</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Udhaar</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Added</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><div className="flex justify-end"><Skeleton className="h-4 w-20" /></div></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><div className="flex justify-end gap-2"><Skeleton className="w-8 h-8 rounded" /><Skeleton className="w-8 h-8 rounded" /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile skeleton */}
            <div className="block md:hidden divide-y divide-gray-50">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="w-8 h-8 rounded" />
                      <Skeleton className="w-8 h-8 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Users className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">No customers yet</h3>
            <p className="text-sm text-gray-500">Add your first customer to get started.</p>
            <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add Customer</Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">All Customers</h2>
              <span className="text-sm text-gray-500">{customers.length}</span>
            </div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Udhaar</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Added</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                      onClick={() => router.push(`/customers/${customer.id}`)}
                    >
                      {/* Avatar + Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-700">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 hover:text-blue-600">
                            {customer.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {customer.phone ?? <span className="text-gray-300">—</span>}
                      </td>

                      <td className="px-6 py-4 text-gray-500 max-w-[200px] truncate">
                        {customer.address ?? <span className="text-gray-300">—</span>}
                      </td>

                      {/* Udhaar balance */}
                      <td className="px-6 py-4 text-right">
                        {(customer.totalUdhaar ?? 0) > 0 ? (
                          <span className="font-bold text-orange-600">
                            Rs. {(customer.totalUdhaar ?? 0).toLocaleString()}
                          </span>
                        ) : (customer.totalUdhaar ?? 0) < 0 ? (
                          <span className="font-bold text-green-600">
                            Rs. {Math.abs(customer.totalUdhaar ?? 0).toLocaleString()}
                            <span className="text-xs font-normal ml-1 text-gray-400">overpaid</span>
                          </span>
                        ) : (
                          <span className="text-xs text-green-600 font-medium">Saaf ✓</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(customer.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>

                      {/* Actions — stop row click from firing */}
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => setEditCustomer(customer)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="text-red-400 hover:text-red-600 hover:bg-red-50"
                            disabled={deletingId === customer.id}
                            onClick={() => setConfirmId(customer.id)}
                          >
                            {deletingId === customer.id
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-gray-100">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-4 hover:bg-blue-50/40 active:bg-blue-100/40 transition-colors cursor-pointer space-y-3"
                  onClick={() => router.push(`/customers/${customer.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-700">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {customer.name}
                      </span>
                    </div>
                    {/* Udhaar balance */}
                    <div className="text-right">
                      {(customer.totalUdhaar ?? 0) > 0 ? (
                        <span className="font-bold text-orange-600 text-sm">
                          Rs. {(customer.totalUdhaar ?? 0).toLocaleString()}
                        </span>
                      ) : (customer.totalUdhaar ?? 0) < 0 ? (
                        <span className="font-bold text-green-600 text-sm">
                          Rs. {Math.abs(customer.totalUdhaar ?? 0).toLocaleString()}
                          <span className="text-[10px] font-normal block text-gray-400">overpaid</span>
                        </span>
                      ) : (
                        <span className="text-xs text-green-600 font-semibold">Saaf ✓</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                    <div className="space-y-0.5">
                      {customer.phone && <p>📞 {customer.phone}</p>}
                      {customer.address && <p className="max-w-[200px] truncate">📍 {customer.address}</p>}
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8"
                        onClick={() => setEditCustomer(customer)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                        disabled={deletingId === customer.id}
                        onClick={() => setConfirmId(customer.id)}
                      >
                        {deletingId === customer.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="hidden md:block border-t border-gray-200/50 bg-white/80 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">© {new Date().getFullYear()} Digi Khata.</p>
        </div>
      </footer>

      {/* Edit Dialog */}
      <Dialog open={!!editCustomer} onOpenChange={(o) => !o && setEditCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update the customer details.</DialogDescription>
          </DialogHeader>
          {editCustomer && (
            <EditCustomerForm
              customer={editCustomer}
              onSuccess={() => { setEditCustomer(null); fetchCustomers(); }}
              onCancel={() => setEditCustomer(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Customer?</DialogTitle>
            <DialogDescription>
              Permanently delete <strong>{confirmCustomer?.name}</strong>? All their transactions will also be deleted. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setConfirmId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!!deletingId}
              onClick={() => confirmId && handleDelete(confirmId)}
            >
              {deletingId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Yes, Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
