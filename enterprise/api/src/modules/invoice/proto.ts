//模型结构体定义
export type InvoiceModel = {
  id?: number;
  title: string;
  tax_number: string;
  invoice_type: number;
  company_address?: string;
  company_phone?: string;
  bank_name?: string;
  bank_account?: string;
  entity_id: number;
  is_default: number;
  status: number;
  create_time?: number;
  update_time?: number;
};

export type InvoiceQueryModel = {
  page: number;
  page_size: number;
  entity_id: number;
  invoice_type?: number;
  keyword?: string;
  status?: number;
};

export type InvoiceUpdateModel = {
  id: number;
  title?: string;
  tax_number?: string;
  invoice_type?: number;
  company_address?: string;
  company_phone?: string;
  bank_name?: string;
  bank_account?: string;
  is_default?: number;
};

export type InvoiceDetailModel = {
  id: number;
  title: string;
  tax_number: string;
  invoice_type: number;
  invoice_type_name: string;
  company_address: string;
  company_phone: string;
  bank_name: string;
  bank_account: string;
  entity_id: number;
  is_default: number;
  status: number;
  create_time: string;
  update_time: string;
};

export type SetDefaultInvoiceModel = {
  id: number;
  entity_id: number;
};