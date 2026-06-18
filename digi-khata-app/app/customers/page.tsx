"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddCustomerForm } from "@/components/forms/add-customer-form";
import { EditCustomerForm } from "@/components/forms/edit-customer-form";
import type { Customer } from "@/types/customer";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error("Failed to fetch");
      const data: Customer[] = await res.json();
      setCustomers(data);
    } catch {
      toast.error("Could not load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      toast.success("Customer deleted");
    } catch {
      toast.error("Could not delete customer");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-zinc-700" />
            <h1 className="text-2xl font-semibold text-zinc-900">Customers</h1>
            {!loading && (
              <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                {customers.length}
              </span>
            )}
          </div>

          {/* Add Customer Dialog */}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Customer</DialogTitle>
                <DialogDescription>
                  Fill in the details below to add a new customer.
                </DialogDescription>
              </DialogHeader>
              <AddCustomerForm
                onSuccess={() => {
                  setAddOpen(false);
                  fetchCustomers();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Customer Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-zinc-600">
              All Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              </div>
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-zinc-400">
                <Users className="h-10 w-10" />
                <p className="text-sm">No customers yet. Add your first one.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-zinc-200 bg-zinc-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-zinc-500">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-zinc-500">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-zinc-500">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-zinc-500">
                        Added
                      </th>
                      <th className="px-6 py-3 text-right font-medium text-zinc-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {customers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-zinc-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-zinc-900">
                          {customer.name}
                        </td>
                        <td className="px-6 py-4 text-zinc-500">
                          {customer.phone ?? (
                            <span className="text-zinc-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-zinc-500">
                          {customer.address ?? (
                            <span className="text-zinc-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-zinc-400">
                          {new Date(customer.createdAt).toLocaleDateString(
                            "en-PK",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit */}
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Edit customer"
                              onClick={() => setEditCustomer(customer)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Delete customer"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              disabled={deletingId === customer.id}
                              onClick={() => handleDelete(customer.id)}
                            >
                              {deletingId === customer.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog — controlled outside the table to avoid re-mounts */}
      <Dialog open={!!editCustomer} onOpenChange={(open) => !open && setEditCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update the customer&apos;s details below.
            </DialogDescription>
          </DialogHeader>
          {editCustomer && (
            <EditCustomerForm
              customer={editCustomer}
              onSuccess={() => {
                setEditCustomer(null);
                fetchCustomers();
              }}
              onCancel={() => setEditCustomer(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
