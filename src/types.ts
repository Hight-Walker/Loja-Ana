export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  images?: string[];
  category: string;
  isBestSeller?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  address?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  role: 'admin' | 'user' | 'dev';
}

export type OrderStatus = 'Pendente' | 'Pago' | 'Processando' | 'Enviado' | 'Entregue' | 'Cancelado';
export type PaymentMethod = 'Cartão de Crédito' | 'Boleto' | 'Pix';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  date: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  trackingCode?: string;
}

export interface StoreConfig {
  name: string;
  logo: string;
  homepageBackground?: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  instagram?: string;
  freeShippingEnabled?: boolean;
  freeShippingMinAmount?: number;
  collections?: string[];
  maintenance?: {
    enabled: boolean;
    time?: string;
    reason?: string;
  };
  pixKey?: string;
  whatsappNumber?: string;
}

export interface AnalyticsData {
  totalSales: number;
  totalRevenue: number;
  productSales: Record<string, number>;
}
