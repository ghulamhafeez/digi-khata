"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Customer } from "@/types/customer";
import type { Transaction } from "@/types/transaction";

const schema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      message: "Amount must be a positive number",
    }),
  type: z.enum(["jama", "wapsi"]),
  description: z.string().max(255).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface EditTransactionFormProps {
  transaction: Transaction;
  customers: Customer[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditTransactionForm({
  transaction,
  customers,
  onSuccess,
  onCancel,
}: EditTransactionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerId: transaction.customerId,
      amount: String(transaction.amount),
      type: transaction.type,
      description: transaction.description ?? "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, amount: Number(data.amount) }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Something went wrong");
      }

      toast.success("Transaction updated");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update transaction");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="edit-customerId">
          Customer <span className="text-red-500">*</span>
        </Label>
        <Select id="edit-customerId" {...register("customerId")}>
          <option value="">Select customer </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        {errors.customerId && (
          <p className="text-xs text-red-500">{errors.customerId.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Type <span className="text-red-500">*</span></Label>
        <div className="grid grid-cols-2 gap-2">
          <label className="cursor-pointer">
            <input type="radio" value="jama" {...register("type")} className="sr-only peer" />
            <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 py-3 text-sm font-medium text-gray-600 transition-all peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-700">
              <span className="text-lg">↑</span> Jama (Diya)
            </div>
          </label>
          <label className="cursor-pointer">
            <input type="radio" value="wapsi" {...register("type")} className="sr-only peer" />
            <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 py-3 text-sm font-medium text-gray-600 transition-all peer-checked:border-green-500 peer-checked:bg-green-50 peer-checked:text-green-700">
              <span className="text-lg">↓</span> Wapsi (Liya)
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-amount">
          Amount (Rs.) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="edit-amount"
          type="number"
          min="1"
          step="any"
          {...register("amount")}
          aria-invalid={!!errors.amount}
        />
        {errors.amount && (
          <p className="text-xs text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-description">Description</Label>
        <Input id="edit-description" {...register("description")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" size="lg"   variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
