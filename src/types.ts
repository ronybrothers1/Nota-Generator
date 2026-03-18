export interface InvoiceItem {
  id: string;
  name: string;
  unit: string;
  qty: number | string;
  price: number | string;
}

export interface InvoiceData {
  companyName: string;
  companyAddress: string;
  companyContact: string;
  logo: string;
  notaNumber: string;
  transactionDate: string;
  paymentMethod: string;
  customerName: string;
  customerAddress: string;
  cashierName: string;
  taxRate: number | string;
  discountRate: number | string;
  items: InvoiceItem[];
}
