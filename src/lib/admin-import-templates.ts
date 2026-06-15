import * as XLSX from "xlsx";

export const IMPORT_TEMPLATE_TYPES = [
  "supplier-packages-esim",
  "supplier-packages-physical-sim",
  "supplier-prices",
  "sim-inventory-esim",
  "sim-inventory-physical-sim",
] as const;

export type ImportTemplateType = (typeof IMPORT_TEMPLATE_TYPES)[number];

export const IMPORT_TEMPLATE_LABELS: Record<ImportTemplateType, string> = {
  "supplier-packages-esim": "Gói cước eSIM",
  "supplier-packages-physical-sim": "Gói cước SIM vật lý",
  "supplier-prices": "Giá vốn NCC",
  "sim-inventory-esim": "Kho eSIM",
  "sim-inventory-physical-sim": "Kho SIM vật lý",
};

/** Cột sheet import gói cước NCC — khớp BE `import-template.builder.ts` */
export const SUPPLIER_PACKAGES_IMPORT_HEADERS = [
  "STT",
  "Mã gói cước",
  "Tên gói cước",
  "Loại gói cước",
  "Loại dữ liệu (GB)",
  "Số ngày",
  "Quốc gia",
  "Giá bán",
  "Giá nhập",
  "Mô tả",
] as const;

/** Cột sheet import — khớp BE `import-template.builder.ts` */
export const SUPPLIER_PRICE_IMPORT_HEADERS = [
  "package_slug",
  "package_id",
  "cost_price",
  "supplier_package_code",
  "supplier_package_name",
  "available_quantity",
] as const;

export const SIM_INVENTORY_ESIM_HEADERS = [
  "iccid",
  "esim_code",
  "qr_code_url",
  "activation_code",
  "smdp_address",
  "note",
] as const;

export const SIM_INVENTORY_PHYSICAL_HEADERS = [
  "iccid",
  "serial_number",
  "note",
] as const;

interface TemplateDefinition {
  filename: string;
  sheetName: string;
  headers: readonly string[];
  sampleRows: Array<Array<string | number>>;
  notes: Array<[string, string]>;
}

const TEMPLATE_DEFINITIONS: Record<ImportTemplateType, TemplateDefinition> = {
  "supplier-packages-esim": {
    filename: "supplier-packages-esim-template.xlsx",
    sheetName: "Goi cuoc eSIM",
    headers: SUPPLIER_PACKAGES_IMPORT_HEADERS,
    sampleRows: [
      [
        1,
        "JP-5GB-7D",
        "eSIM Nhật Bản 5GB 7 ngày",
        "data_only",
        "5",
        7,
        "JP, Nhật Bản",
        150000,
        95000,
        "eSIM Nhật 5GB dùng trong 7 ngày",
      ],
      [
        2,
        "KR-10GB-15D",
        "eSIM Hàn Quốc 10GB 15 ngày",
        "data_only",
        "10GB",
        15,
        "KR",
        220000,
        110000,
        "eSIM Hàn Quốc phù hợp du lịch 2 tuần",
      ],
    ],
    notes: [
      ["Mã gói cước", "Bắt buộc. Mã gói bên NCC — dùng map gói cước. Nếu chưa có trong DB sẽ tạo mới."],
      ["Tên gói cước", "Bắt buộc. Tên hiển thị gói cước."],
      ["Loại gói cước", "Bắt buộc. data_only | data_call | unlimited | daily_data"],
      ["Loại dữ liệu (GB)", "Số GB (vd: 5, 10GB). Unlimited để 0 hoặc Unlimited."],
      ["Số ngày", "Bắt buộc. Số ngày sử dụng."],
      ["Quốc gia", "Bắt buộc. Nhiều quốc gia ngăn cách dấu phẩy. Mã (JP), slug hoặc tên."],
      ["Giá bán", "Bắt buộc. Giá bán VND (kênh anonymous)."],
      ["Giá nhập", "Bắt buộc. Giá vốn NCC VND."],
      ["Mô tả", "Mô tả gói cước (tuỳ chọn)."],
      ["", "Chọn loại SIM eSIM và nhà cung cấp trên form trước khi import."],
    ],
  },
  "supplier-packages-physical-sim": {
    filename: "supplier-packages-physical-sim-template.xlsx",
    sheetName: "Goi cuoc SIM vat ly",
    headers: SUPPLIER_PACKAGES_IMPORT_HEADERS,
    sampleRows: [
      [
        1,
        "SG-20G-30D",
        "SIM Singapore 20GB 30 ngày",
        "data_only",
        "20",
        30,
        "SG, Singapore",
        350000,
        180000,
        "SIM vật lý giao tại sân bay",
      ],
      [
        2,
        "HK-3GB-DAY",
        "SIM Hong Kong 3GB/ngày",
        "daily_data",
        "3",
        7,
        "HK",
        280000,
        150000,
        "Data theo ngày, phù hợp city tour",
      ],
    ],
    notes: [
      ["Mã gói cước", "Bắt buộc. Mã gói bên NCC — dùng map gói cước. Nếu chưa có trong DB sẽ tạo mới."],
      ["Tên gói cước", "Bắt buộc. Tên hiển thị gói cước."],
      ["Loại gói cước", "Bắt buộc. data_only | data_call | unlimited | daily_data"],
      ["Loại dữ liệu (GB)", "Số GB (vd: 5, 10GB). Unlimited để 0 hoặc Unlimited."],
      ["Số ngày", "Bắt buộc. Số ngày sử dụng."],
      ["Quốc gia", "Bắt buộc. Nhiều quốc gia ngăn cách dấu phẩy. Mã (JP), slug hoặc tên."],
      ["Giá bán", "Bắt buộc. Giá bán VND (kênh anonymous)."],
      ["Giá nhập", "Bắt buộc. Giá vốn NCC VND."],
      ["Mô tả", "Mô tả gói cước (tuỳ chọn)."],
      ["", "Chọn loại SIM vật lý và nhà cung cấp trên form trước khi import."],
    ],
  },
  "supplier-prices": {
    filename: "supplier-prices-template.xlsx",
    sheetName: "Gia von NCC",
    headers: SUPPLIER_PRICE_IMPORT_HEADERS,
    sampleRows: [
      ["esim-nhat-5gb-7-ngay", "", 95000, "JP-5GB-7D", "Japan 5GB 7 days", 100],
      ["esim-han-10gb-15-ngay", "", 120000, "KR-10GB-15D", "Korea 10GB 15 days", 50],
    ],
    notes: [
      ["package_slug", "Bắt buộc nếu không chọn gói trên form. Dùng slug gói trong admin."],
      ["package_id", "Hoặc MongoDB ObjectId thay cho package_slug (một trong hai)."],
      ["cost_price", "Bắt buộc. Giá vốn VND."],
      ["supplier_package_code", "Mã gói bên NCC (tuỳ chọn)."],
      ["supplier_package_name", "Tên gói bên NCC (tuỳ chọn)."],
      ["available_quantity", "Số lượng tồn NCC báo cáo (tuỳ chọn)."],
      ["", "Chọn nhà cung cấp trên form trước khi import."],
    ],
  },
  "sim-inventory-esim": {
    filename: "sim-inventory-esim-template.xlsx",
    sheetName: "Kho eSIM",
    headers: SIM_INVENTORY_ESIM_HEADERS,
    sampleRows: [
      [
        "8986000000000000001",
        "LPA:1$rsp.example.com$ABC123",
        "https://example.com/qr/esim-001.png",
        "ABC123",
        "rsp.example.com",
        "eSIM mẫu 1",
      ],
      ["8986000000000000002", "LPA:1$rsp.example.com$DEF456", "", "DEF456", "rsp.example.com", ""],
    ],
    notes: [
      ["iccid", "Bắt buộc. Mã ICCID duy nhất."],
      ["esim_code", "Bắt buộc. Mã kích hoạt / LPA."],
      ["qr_code_url", "URL ảnh QR (tuỳ chọn)."],
      ["activation_code", "Mã kích hoạt (tuỳ chọn)."],
      ["smdp_address", "SM-DP+ address (tuỳ chọn)."],
      ["note", "Ghi chú nội bộ (tuỳ chọn)."],
      ["", "Chọn gói cước và NCC trên form trước khi import."],
    ],
  },
  "sim-inventory-physical-sim": {
    filename: "sim-inventory-physical-sim-template.xlsx",
    sheetName: "Kho SIM vat ly",
    headers: SIM_INVENTORY_PHYSICAL_HEADERS,
    sampleRows: [
      ["8986000000000000101", "SN-PHYS-001", "SIM vật lý mẫu 1"],
      ["8986000000000000102", "SN-PHYS-002", ""],
    ],
    notes: [
      ["iccid", "Bắt buộc. Mã ICCID duy nhất."],
      ["serial_number", "Bắt buộc với SIM vật lý."],
      ["note", "Ghi chú nội bộ (tuỳ chọn)."],
      ["", "Chọn gói cước và NCC trên form trước khi import."],
    ],
  },
};

export function simTypeToImportTemplate(
  simType: "esim" | "physical_sim"
): ImportTemplateType {
  return simType === "physical_sim"
    ? "sim-inventory-physical-sim"
    : "sim-inventory-esim";
}

export function simTypeToSupplierPackagesTemplate(
  simType: "esim" | "physical_sim"
): ImportTemplateType {
  return simType === "physical_sim"
    ? "supplier-packages-physical-sim"
    : "supplier-packages-esim";
}

function buildWorkbook(def: TemplateDefinition): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  const dataSheet = XLSX.utils.aoa_to_sheet([
    [...def.headers],
    ...def.sampleRows,
  ]);
  XLSX.utils.book_append_sheet(workbook, dataSheet, def.sheetName);

  const noteSheet = XLSX.utils.aoa_to_sheet([
    ["Cot", "Ghi chu"],
    ...def.notes,
  ]);
  XLSX.utils.book_append_sheet(workbook, noteSheet, "Huong dan");

  return workbook;
}

/** Tạo và tải file .xlsx mẫu trên trình duyệt — không gọi API. */
export function downloadImportTemplate(templateType: ImportTemplateType): void {
  const def = TEMPLATE_DEFINITIONS[templateType];
  const workbook = buildWorkbook(def);
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = def.filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
