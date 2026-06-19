export type TransactionType = "jama" | "wapsi";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description: string | null;
  customerId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    phone: string | null;
  };
}
