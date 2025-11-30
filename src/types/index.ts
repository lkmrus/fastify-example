export interface User {
  id: number;
  email: string;
  balance: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  created_at: Date;
}

export interface Purchase {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  price_at_purchase: string;
  total_amount: string;
  created_at: Date;
}

export interface PurchaseWithDetails extends Purchase {
  user_email?: string;
  product_name?: string;
}

export interface CreatePurchaseResponse {
  success: boolean;
  purchase_id: number;
  new_balance: string;
  product_name: string;
  total_paid: string;
}

