export type UserRole = "guest" | "customer" | "agent" | "admin";

export type SimType = "esim" | "physical";

export type PackageType = "daily" | "total" | "unlimited";

export type OrderStatus =
  | "pending_payment"
  | "payment_review"
  | "paid"
  | "processing"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "unpaid"
  | "pending_review"
  | "paid"
  | "failed"
  | "refunded";

export type VnEsimStatus = "available" | "reserved" | "sold";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  note?: string;
  active: boolean;
}

export interface SupplierPackage {
  id: string;
  /** MongoDB Package `_id` (distinct from supplier-price row `id`) */
  packageMongoId?: string;
  supplierId: string;
  country: string;
  countryCode: string;
  region: string;
  name: string;
  packageType: PackageType;
  dataGb: number | null;
  days: number;
  simType: SimType;
  costPrice: number;
  active: boolean;
}

export interface ChannelPricing {
  id: string;
  packageId: string;
  retailPrice: number;
  agentTier1Qty: number;
  agentTier1Price: number;
  agentTier2Qty: number;
  agentTier2Price: number;
  agentTier3Qty: number;
  agentTier3Price: number;
}

export interface OrderItem {
  packageId: string;
  packageName: string;
  country: string;
  simType: SimType;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  code: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  channel?: string;
  paymentNote?: string;
  paymentProof?: string;
  proofImageUrl?: string;
  billNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VnEsim {
  id: string;
  iccid?: string;
  phoneNumber?: string;
  serial?: string;
  qrPayload?: string;
  activationCode?: string;
  planName?: string;
  status: VnEsimStatus;
  orderId?: string;
  notes?: string;
  importedAt: string;
}

export interface AppStore {
  users: User[];
  suppliers: Supplier[];
  packages: SupplierPackage[];
  pricing: ChannelPricing[];
  orders: Order[];
  vnEsims: VnEsim[];
  settings: {
    bankAccount: string;
    companyName: string;
    hotline: string;
  };
}

export interface PackageSearchFilters {
  country?: string;
  region?: string;
  packageType?: PackageType | "";
  dataGb?: number | "unlimited" | "";
  days?: number | "";
  simType?: SimType | "";
  q?: string;
  minPrice?: number;
  maxPrice?: number;
}

export type PackageSort =
  | "price_asc"
  | "price_desc"
  | "days_asc"
  | "days_desc"
  | "data_asc"
  | "data_desc";

export interface PackageSearchResult {
  package: SupplierPackage;
  supplier: Supplier;
  pricing: ChannelPricing;
  unitPrice: number;
  priceTiers?: {
    qty: number;
    price: number;
  }[];
  isBestCost?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  priceBounds?: { min: number; max: number };
}
