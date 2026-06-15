import { mongoIdString } from "../admin-utils";
import { COUNTRIES } from "../constants";
import type {
  ChannelPricing,
  Order,
  OrderItem,
  OrderStatus,
  PackagePricingRow,
  PackageSearchResult,
  PackageType,
  SimType,
  Supplier,
  SupplierPackage,
  User,
  UserRole,
  VnEsim,
} from "../types";

type MongoDoc = Record<string, unknown> & { _id?: string | { toString(): string } };

function idOf(doc: MongoDoc | string | null | undefined): string {
  return mongoIdString(doc);
}

export function mapSimTypeFromApi(value?: string): SimType {
  return value === "physical_sim" ? "physical" : "esim";
}

export function mapSimTypeToApi(value?: string): string {
  if (value === "physical") return "physical_sim";
  if (value === "esim") return "esim";
  return value || "";
}

export function mapPackageTypeFromApi(value?: string): PackageType {
  switch (value) {
    case "daily_data":
      return "daily";
    case "data_only":
    case "data_call":
      return "total";
    case "unlimited":
      return "unlimited";
    default:
      return "total";
  }
}

export function mapPackageTypeToApi(value?: string): string {
  switch (value) {
    case "daily":
      return "daily_data";
    case "total":
      return "data_only";
    case "unlimited":
      return "unlimited";
    default:
      return value || "";
  }
}

export function mapSortToApi(sort?: string): string {
  switch (sort) {
    case "days_asc":
      return "duration_asc";
    case "days_desc":
      return "duration_desc";
    default:
      return sort || "price_asc";
  }
}

export function mapOrderStatusFromApi(status?: string): OrderStatus {
  switch (status) {
    case "waiting_payment_confirmation":
      return "payment_review";
    case "pending_payment":
    case "paid":
    case "processing":
    case "completed":
    case "cancelled":
    case "refunded":
      return status;
    default:
      return "pending_payment";
  }
}

export function mapOrderStatusToApi(status?: string): string {
  if (status === "payment_review") return "waiting_payment_confirmation";
  return status || "pending_payment";
}

export function mapRoleFromApi(role?: string): UserRole {
  switch (role) {
    case "customer":
    case "agent":
    case "collaborator":
    case "staff":
    case "admin":
      return role;
    default:
      return "customer";
  }
}

export function countryNameToCode(name?: string): string | undefined {
  if (!name) return undefined;
  const found = COUNTRIES.find((c) => c.name === name);
  return found?.code;
}

export function mapBackendUser(
  user: MongoDoc & { fullName?: string; name?: string }
): Omit<User, "password"> {
  return {
    id: idOf(user),
    email: String(user.email || ""),
    name: String(user.fullName || user.name || ""),
    phone: user.phone ? String(user.phone) : undefined,
    role: mapRoleFromApi(String(user.role || "customer")),
  };
}

function countryNamesFromPackage(pkg: MongoDoc): string[] {
  const countries = pkg.countryIds as MongoDoc[] | undefined;
  if (!Array.isArray(countries) || countries.length === 0) return [];
  return countries
    .map((c) => {
      if (typeof c === "string") return "";
      return String(c.nameVi || c.name || "").trim();
    })
    .filter(Boolean);
}

function firstCountryName(pkg: MongoDoc): string {
  const names = countryNamesFromPackage(pkg);
  if (names.length > 0) return names[0];
  return String(pkg.regionName || "");
}

function firstCountryCode(pkg: MongoDoc): string {
  const countries = pkg.countryIds as MongoDoc[] | undefined;
  if (Array.isArray(countries) && countries.length > 0) {
    return String(countries[0].code || "");
  }
  return "";
}

export function mapPackageFromApi(
  pkg: MongoDoc,
  supplierId?: string,
  costPrice = 0
): SupplierPackage {
  const countryNames = countryNamesFromPackage(pkg);
  return {
    id: idOf(pkg),
    supplierId: supplierId || "",
    country: firstCountryName(pkg),
    countryCode: firstCountryCode(pkg),
    countryLabel: countryNames.join(", "),
    region: String(pkg.regionName || ""),
    name: String(pkg.name || ""),
    packageType: mapPackageTypeFromApi(String(pkg.packageType || "")),
    dataGb:
      pkg.packageType === "unlimited"
        ? null
        : typeof pkg.dataAmountGb === "number"
          ? pkg.dataAmountGb
          : null,
    days: Number(pkg.durationDays || 0),
    simType: mapSimTypeFromApi(String(pkg.simType || "")),
    costPrice,
    active: String(pkg.status || "active") === "active",
  };
}

export function mapSearchResultFromApi(item: MongoDoc): PackageSearchResult {
  const pkg = (item.package || item) as MongoDoc;
  const salePrice = Number(item.salePrice ?? 0);
  const tiers = (item.tiers as MongoDoc[] | undefined) || [];
  const channel = String(item.channel || "anonymous");

  const priceTiers = tiers.map((t) => ({
    qty: Number(t.minQuantity || 1),
    price: Number(t.salePrice || 0),
  }));

  const supplier: Supplier = {
    id: "channel",
    name:
      channel === "agent"
        ? "Giá đại lý"
        : channel === "collaborator"
          ? "Giá CTV"
          : String(pkg.networkOperator || "Mifigo"),
    code: channel.toUpperCase(),
    active: true,
  };

  const pricing: ChannelPricing = {
    id: `pricing-${idOf(pkg)}`,
    packageId: idOf(pkg),
    retailPrice: salePrice,
    agentTier1Qty: priceTiers[0]?.qty ?? 1,
    agentTier1Price: priceTiers[0]?.price ?? salePrice,
    agentTier2Qty: priceTiers[1]?.qty ?? 1,
    agentTier2Price: priceTiers[1]?.price ?? salePrice,
    agentTier3Qty: priceTiers[2]?.qty ?? 1,
    agentTier3Price: priceTiers[2]?.price ?? salePrice,
  };

  return {
    package: mapPackageFromApi(pkg),
    supplier,
    pricing,
    unitPrice: salePrice,
    priceTiers: priceTiers.length > 1 ? priceTiers : undefined,
  };
}

export function mapAdminPackageListItem(item: MongoDoc): PackagePricingRow {
  const pkg = (item.package || item) as MongoDoc;
  const supplierRaw = item.supplierId;
  const supplierId =
    supplierRaw == null
      ? null
      : typeof supplierRaw === "object"
        ? idOf(supplierRaw as MongoDoc)
        : String(supplierRaw);
  const mapped = mapPackageFromApi(
    pkg,
    supplierId || undefined,
    Number(item.costPrice || 0)
  );

  return {
    packageId: idOf(pkg),
    name: mapped.name,
    country: mapped.country,
    simType: mapped.simType,
    packageType: mapped.packageType,
    dataGb: mapped.dataGb,
    days: mapped.days,
    salePrice: item.salePrice != null ? Number(item.salePrice) : null,
    costPrice: item.costPrice != null ? Number(item.costPrice) : null,
    profit: item.profit != null ? Number(item.profit) : null,
    supplierId,
    channel: String(item.channel || "anonymous"),
    tiers: ((item.tiers as MongoDoc[] | undefined) || []).map((t) => ({
      minQuantity: Number(t.minQuantity || 1),
      maxQuantity:
        t.maxQuantity != null && t.maxQuantity !== ""
          ? Number(t.maxQuantity)
          : null,
      salePrice: Number(t.salePrice || 0),
    })),
  };
}

/** Admin list item từ GET /admin/packages — unwrap `package` nested object */
export function mapSystemPackageRow(item: MongoDoc) {
  const pkg = (item.package || item) as MongoDoc;
  const countryNames = countryNamesFromPackage(pkg);
  return {
    id: idOf(pkg),
    name: String(pkg.name || ""),
    slug: String(pkg.slug || ""),
    simType: String(pkg.simType || ""),
    packageType: String(pkg.packageType || ""),
    status: String(pkg.status || "active"),
    durationDays: Number(pkg.durationDays || 0),
    dataAmountGb:
      pkg.dataAmountGb != null && pkg.dataAmountGb !== ""
        ? Number(pkg.dataAmountGb)
        : null,
    countryNames,
    countryLabel: countryNames.join(", "),
  };
}

export function mapSupplierFromApi(doc: MongoDoc): Supplier {
  return {
    id: idOf(doc),
    name: String(doc.name || ""),
    code: String(doc.code || ""),
    note: doc.note ? String(doc.note) : undefined,
    active: doc.isActive !== false,
  };
}

export function mapSupplierPriceRow(
  priceDoc: MongoDoc,
  pkgDoc: MongoDoc
): SupplierPackage {
  const supplier = priceDoc.supplierId as MongoDoc | undefined;
  return mapPackageFromApi(
    pkgDoc,
    supplier ? idOf(supplier) : idOf(priceDoc.supplierId as MongoDoc),
    Number(priceDoc.costPrice || 0)
  );
}

export function mapSaleRulesToPricing(
  packageId: string,
  rules: MongoDoc[]
): ChannelPricing {
  const retail =
    rules.find((r) => r.channel === "retail" || r.channel === "anonymous") ||
    rules[0];
  const agent = rules.find((r) => r.channel === "agent");

  const retailTiers = (retail?.tiers as MongoDoc[] | undefined) || [];
  const agentTiers = (agent?.tiers as MongoDoc[] | undefined) || [];

  return {
    id: idOf(retail || { _id: `pricing-${packageId}` }),
    agentRuleId: agent ? idOf(agent) : null,
    packageId,
    retailPrice: Number(retailTiers[0]?.salePrice || 0),
    agentTier1Qty: Number(agentTiers[0]?.minQuantity || 1),
    agentTier1Price: Number(agentTiers[0]?.salePrice || 0),
    agentTier2Qty: Number(agentTiers[1]?.minQuantity || 1),
    agentTier2Price: Number(agentTiers[1]?.salePrice || 0),
    agentTier3Qty: Number(agentTiers[2]?.minQuantity || 1),
    agentTier3Price: Number(agentTiers[2]?.salePrice || 0),
  };
}

export function mapOrderFromApi(
  order: MongoDoc,
  items: MongoDoc[] = [],
  payment?: MongoDoc | null
): Order {
  const snapshot = (order.customerSnapshot || {}) as MongoDoc;
  const mappedItems: OrderItem[] = items.map((item) => {
    const snap = (item.packageSnapshot || {}) as MongoDoc;
    return {
      packageId: idOf(item.packageId as MongoDoc),
      packageName: String(snap.name || item.packageName || ""),
      country: Array.isArray(snap.countryNames)
        ? String(snap.countryNames[0] || "")
        : String(snap.countryNames || ""),
      simType: mapSimTypeFromApi(String(snap.simType || "")),
      quantity: Number(item.quantity || 1),
      unitPrice: Number(item.salePrice || 0),
      lineTotal: Number(item.totalSalePrice || 0),
    };
  });

  const bankTransfer = (payment?.bankTransfer || {}) as MongoDoc;
  const proofImageUrl = bankTransfer.proofImageUrl
    ? String(bankTransfer.proofImageUrl)
    : payment?.proofImageUrl
      ? String(payment.proofImageUrl)
      : undefined;
  const transactionCode = bankTransfer.transactionCode
    ? String(bankTransfer.transactionCode)
    : payment?.transactionCode
      ? String(payment.transactionCode)
      : undefined;

  return {
    id: idOf(order),
    code: String(order.orderCode || order.code || ""),
    userId: order.customerId ? idOf(order.customerId as MongoDoc) : undefined,
    customerName: String(snapshot.fullName || order.customerName || ""),
    customerPhone: String(snapshot.phone || order.customerPhone || ""),
    customerEmail: String(snapshot.email || order.customerEmail || ""),
    items: mappedItems,
    subtotal: Number(order.subtotal || order.totalAmount || 0),
    total: Number(order.totalAmount || order.total || 0),
    status: mapOrderStatusFromApi(String(order.status || "")),
    paymentStatus: order.paymentStatus
      ? (String(order.paymentStatus) as Order["paymentStatus"])
      : undefined,
    channel: order.channel ? String(order.channel) : undefined,
    paymentNote: order.note ? String(order.note) : undefined,
    paymentProof: transactionCode,
    proofImageUrl,
    billNote: order.staffNote ? String(order.staffNote) : undefined,
    createdAt: String(order.createdAt || new Date().toISOString()),
    updatedAt: String(order.updatedAt || new Date().toISOString()),
  };
}

export function mapOrderDetailFromApi(payload: {
  order: MongoDoc;
  items?: MongoDoc[];
  payment?: MongoDoc | null;
}) {
  return mapOrderFromApi(
    payload.order,
    payload.items || [],
    payload.payment || null
  );
}

export function mapVnEsimFromApi(doc: MongoDoc): VnEsim {
  return {
    id: idOf(doc),
    iccid: doc.iccid ? String(doc.iccid) : undefined,
    phoneNumber: doc.phoneNumber ? String(doc.phoneNumber) : undefined,
    serial: doc.serialNumber ? String(doc.serialNumber) : undefined,
    qrPayload: doc.qrCodeUrl ? String(doc.qrCodeUrl) : undefined,
    activationCode: doc.activationCode
      ? String(doc.activationCode)
      : doc.esimCode
        ? String(doc.esimCode)
        : undefined,
    planName: doc.packageId ? String((doc.packageId as MongoDoc).name || "") : undefined,
    status:
      doc.status === "sold"
        ? "sold"
        : doc.status === "reserved"
          ? "reserved"
          : "available",
    orderId: doc.orderId ? idOf(doc.orderId as MongoDoc) : undefined,
    notes: doc.note ? String(doc.note) : undefined,
    importedAt: String(doc.createdAt || new Date().toISOString()),
  };
}

export function buildBankSettings(payment?: MongoDoc | null): {
  bankAccount: string;
  companyName: string;
  hotline: string;
} {
  const bank = (payment?.bankTransfer || payment?.bankTransferInfo || {}) as MongoDoc;
  const bankName = String(bank.bankName || "Vietcombank");
  const accountName = String(bank.accountName || "CONG TY MIFIGO");
  const accountNumber = String(bank.accountNumber || "");
  const transferContent = String(bank.transferContent || "[Mã đơn]");

  return {
    companyName: "Mifigo SIM",
    hotline: "1900 xxxx",
    bankAccount: `${bankName}\nChủ TK: ${accountName}\nSTK: ${accountNumber}\nNội dung CK: ${transferContent}`,
  };
}

export function pricingToAgentTiers(pricing: ChannelPricing) {
  return [
    { minQuantity: pricing.agentTier1Qty, salePrice: pricing.agentTier1Price },
    { minQuantity: pricing.agentTier2Qty, salePrice: pricing.agentTier2Price },
    { minQuantity: pricing.agentTier3Qty, salePrice: pricing.agentTier3Price },
  ].filter((t) => t.salePrice > 0);
}

export function isMongoId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}
