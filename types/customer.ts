export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  // computed on API responses that include transaction aggregates
  totalJama?: number;
  totalWapsi?: number;
  totalUdhaar?: number; // totalJama - totalWapsi (net outstanding)
}
