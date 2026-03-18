export interface InvoiceItem {
  id: string;
  name: string;
  unit: string;
  /** Allow string during editing so empty input doesn't snap to 0 */
  qty: number | string;
  price: number | string;
}

export interface InvoiceData {
  companyName: string;
  companyAddress: string;
  companyContact: string;
  /** Base64 data URL of the company logo */
  logo: string;
  notaNumber: string;
  /** ISO date string: YYYY-MM-DD */
  transactionDate: string;
  paymentMethod: string;
  customerName: string;
  customerAddress: string;
  cashierName: string;
  /** 0–100 */
  taxRate: number | string;
  /** 0–100 */
  discountRate: number | string;
  items: InvoiceItem[];
}
