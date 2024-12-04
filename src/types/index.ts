export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export interface App {
  id: string;
  name: string;
  price: number;
  createdAt: Date;
}

export interface RechargeCode {
  id: string;
  code: string;
  appId: string;
  isUsed: boolean;
  createdAt: Date;
}

export interface OrderItem {
  id: string;
  appId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  createdAt: Date;
  status: 'pending' | 'completed' | 'cancelled';
  rechargeCodes: string[];
  paymentId?: string;
  paymentStatus: 'pending' | 'approved' | 'rejected';
}