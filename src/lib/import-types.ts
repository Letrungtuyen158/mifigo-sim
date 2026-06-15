export type ImportSimType = "esim" | "physical_sim";

export type ImportBatchStatus = "processing" | "completed" | "failed";

export type ImportBatchType = "supplier_packages" | "supplier_price" | "sim_inventory";

export interface ImportRowError {
  row: number;
  message: string;
}

export interface ImportBatch {
  _id?: string;
  id?: string;
  type: ImportBatchType | string;
  simType?: ImportSimType;
  fileName: string;
  supplierId?: string;
  uploadedBy?: string | { _id?: string; fullName?: string; email?: string };
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: ImportRowError[];
  status: ImportBatchStatus | string;
  createdAt: string;
  updatedAt?: string;
}
