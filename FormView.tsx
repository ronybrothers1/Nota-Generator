import { ChangeEvent, useRef, Dispatch, SetStateAction } from 'react';
import { InvoiceData, InvoiceItem } from '../types';
import { Card, CardHeader, CardBody } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Button } from './ui/Button';
import { formatRp } from '../utils/format';
import {
  Building2,
  FileText,
  ListOrdered,
  UploadCloud,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Eye,
  Printer,
  Download,
  RefreshCw,
  X,
} from 'lucide-react';

interface FormViewProps {
  data: InvoiceData;
  setData: Dispatch<SetStateAction<InvoiceData>>;
  hasDraft: boolean;
  draftDate: string;
  onRestoreDraft: () => void;
  onClearDraft: () => void;
  onSaveDraft: () => void;
  onReset: () => void;
  onPreview: () => void;
  onPrint: () => void;
  onDownload: () => void;
  isPdfGenerating?: boolean;
}

export const FormView = ({
  data,
  setData,
  hasDraft,
  draftDate,
  onRestoreDraft,
  onClearDraft,
  onSaveDraft,
  onReset,
  onPreview,
  onPrint,
  onDownload,
  isPdfGenerating = false,
}: FormViewProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateData = <K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file logo maksimal 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        updateData('logo', ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  const removeLogo = () => {
    updateData('logo', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generateNotaNumber = () => {
    const seq = parseInt(localStorage.getItem('nota_seq') || '0', 10) + 1;
    localStorage.setItem('nota_seq', seq.toString());
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    updateData('notaNumber', `INV/${y}/${m}/${String(seq).padStart(3, '0')}`);
  };

  const addItem = () => {
    setData((prev) => ({
      ...prev,
      items: [...prev.items, { id: crypto.randomUUID(), name: '', unit: '', qty: 1, price: 0 }],
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const removeItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const subtotal = data.items.reduce((acc, item) => {
    return acc + (Number(item.qty) || 0) * (Number(item.price) || 0);
  }, 0);
  const discountRate = Number(data.discountRate) || 0;
  const taxRate = Number(data.taxRate) || 0;
  const discountAmt = subtotal * (discountRate / 100);
  const afterDisc = subtotal - discountAmt;
  const taxAmt = afterDisc * (taxRate / 100);
  const total = afterDisc + taxAmt;

  return (
    <div className="space-y-5">
      {/* Draft Status Banner */}
      {hasDraft && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-blue-700">
          <div className="flex items-center gap-2 font-medium">
            <Save className="w-4 h-4 shrink-0" />
            <span>Draft tersimpan — {draftDate}</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <Button variant="outline-dashed" size="sm" onClick={onRestoreDraft} className="flex-1 sm:flex-none">
              Pulihkan
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearDraft} className="flex-1 sm:flex-none">
              Hapus
            </Button>
          </div>
        </div>
      )}

      {/* ── Company Info ── */}
      <Card>
        <CardHeader>
          <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-slate-900">Informasi Perusahaan</h2>
            <p className="text-xs text-slate-500">Logo dan detail bisnis Anda</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Logo uploader */}
            <div className="shrink-0 relative group">
              <div
                className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                aria-label="Upload logo perusahaan"
              >
                {data.logo ? (
                  <img src={data.logo} alt="Logo perusahaan" className="w-full h-full object-contain p-1" />
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] text-slate-500 text-center leading-tight px-2">Upload Logo</span>
                    <span className="text-[9px] text-slate-400">Maks. 2MB</span>
                  </>
                )}
              </div>
              {/* Remove logo button */}
              {data.logo && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeLogo(); }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                  aria-label="Hapus logo"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png,image/jpeg,image/jpg,image/gif,image/svg+xml,image/webp"
              onChange={handleLogoUpload}
            />

            <div className="flex-1 space-y-4 min-w-0">
              <div className="space-y-1.5">
                <Label htmlFor="companyName">
                  Nama Perusahaan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  value={data.companyName}
                  onChange={(e) => updateData('companyName', e.target.value)}
                  placeholder="Contoh: CV. Maju Jaya"
                  maxLength={100}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="companyAddress">Alamat</Label>
                  <Input
                    id="companyAddress"
                    value={data.companyAddress}
                    onChange={(e) => updateData('companyAddress', e.target.value)}
                    placeholder="Jl. Sudirman No.1, Jakarta"
                    maxLength={200}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="companyContact">Telepon / Email</Label>
                  <Input
                    id="companyContact"
                    value={data.companyContact}
                    onChange={(e) => updateData('companyContact', e.target.value)}
                    placeholder="+62 812-3456-7890"
                    maxLength={100}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Transaction Info ── */}
      <Card>
        <CardHeader>
          <div className="w-8 h-8 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-slate-900">Detail Transaksi</h2>
            <p className="text-xs text-slate-500">Nomor nota, tanggal, dan pelanggan</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Nota number */}
            <div className="space-y-1.5">
              <Label htmlFor="notaNumber">
                No. Nota <span className="text-red-500">*</span>
              </Label>
              <Input
                id="notaNumber"
                value={data.notaNumber}
                onChange={(e) => updateData('notaNumber', e.target.value)}
                placeholder="INV/2025/001"
                maxLength={50}
              />
              <button
                type="button"
                onClick={generateNotaNumber}
                className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 hover:underline mt-1"
              >
                <RefreshCw className="w-3 h-3" /> Generate otomatis
              </button>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="transactionDate">
                Tanggal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="transactionDate"
                type="date"
                value={data.transactionDate}
                onChange={(e) => updateData('transactionDate', e.target.value)}
              />
            </div>

            {/* Payment method — fixed select styling */}
            <div className="space-y-1.5">
              <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
              <div className="relative">
                <select
                  id="paymentMethod"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-md text-sm text-slate-900 bg-white transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none pr-8 cursor-pointer"
                  value={data.paymentMethod}
                  onChange={(e) => updateData('paymentMethod', e.target.value)}
                >
                  <option value="Tunai">Tunai</option>
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="Kartu Kredit">Kartu Kredit</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
                {/* Custom chevron icon */}
                <svg
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Customer name */}
            <div className="space-y-1.5">
              <Label htmlFor="customerName">
                Nama Pelanggan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerName"
                value={data.customerName}
                onChange={(e) => updateData('customerName', e.target.value)}
                placeholder="Budi Santoso"
                maxLength={100}
              />
            </div>

            {/* Customer address */}
            <div className="space-y-1.5">
              <Label htmlFor="customerAddress">Alamat Pelanggan</Label>
              <Input
                id="customerAddress"
                value={data.customerAddress}
                onChange={(e) => updateData('customerAddress', e.target.value)}
                placeholder="Jl. Kebon Jeruk, Jakarta"
                maxLength={200}
              />
            </div>

            {/* Cashier */}
            <div className="space-y-1.5">
              <Label htmlFor="cashierName">
                Nama Kasir <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cashierName"
                value={data.cashierName}
                onChange={(e) => updateData('cashierName', e.target.value)}
                placeholder="Siti Aminah"
                maxLength={100}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Items ── */}
      <Card>
        <CardHeader>
          <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ListOrdered className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-slate-900">Rincian Barang / Jasa</h2>
            <p className="text-xs text-slate-500">Tambahkan item ke dalam nota</p>
          </div>
        </CardHeader>
        <CardBody>
          {/* Scrollable table wrapper */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <tr>
                    <th className="p-3 w-8 text-center">#</th>
                    <th className="p-3">Nama Barang / Jasa</th>
                    <th className="p-3 w-20 text-center">Qty</th>
                    <th className="p-3 w-24">Satuan</th>
                    <th className="p-3 w-36 text-right">Harga Satuan</th>
                    <th className="p-3 w-32 text-right">Subtotal</th>
                    <th className="p-3 w-12 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, index) => {
                    const lineTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);
                    return (
                      <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors">
                        <td className="p-2 text-center text-slate-400 text-xs font-medium">{index + 1}</td>
                        <td className="p-2">
                          <input
                            className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 outline-none transition-all text-sm"
                            placeholder="Nama barang atau jasa"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            maxLength={200}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 outline-none transition-all text-center text-sm"
                            value={item.qty}
                            onChange={(e) => updateItem(item.id, 'qty', e.target.value === '' ? '' : e.target.value)}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 outline-none transition-all text-sm"
                            placeholder="pcs, box..."
                            value={item.unit}
                            onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                            maxLength={30}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 outline-none transition-all text-right text-sm"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, 'price', e.target.value === '' ? '' : e.target.value)}
                          />
                        </td>
                        <td className="p-2 text-right text-sm font-semibold text-slate-700 whitespace-nowrap">
                          {formatRp(lineTotal)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            disabled={data.items.length <= 1}
                            className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label={`Hapus item ${index + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Button variant="outline-dashed" className="w-full mt-4" onClick={addItem} type="button">
            <Plus className="w-4 h-4" /> Tambah Barang / Jasa
          </Button>

          {/* Totals */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-6 pt-6 border-t border-slate-200">
            {/* Tax & Discount */}
            <div className="flex gap-4 w-full md:w-auto">
              <div className="space-y-1.5 flex-1 md:w-32">
                <Label htmlFor="discountRate">Diskon (%)</Label>
                <Input
                  id="discountRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={data.discountRate}
                  onChange={(e) => updateData('discountRate', e.target.value === '' ? '' : e.target.value)}
                />
              </div>
              <div className="space-y-1.5 flex-1 md:w-32">
                <Label htmlFor="taxRate">Pajak (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={data.taxRate}
                  onChange={(e) => updateData('taxRate', e.target.value === '' ? '' : e.target.value)}
                />
              </div>
            </div>

            {/* Summary box */}
            <div className="w-full md:w-72 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex justify-between items-center px-4 py-2.5 text-[13px] border-b border-slate-200">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-900">{formatRp(subtotal)}</span>
              </div>
              {discountRate > 0 && (
                <div className="flex justify-between items-center px-4 py-2.5 text-[13px] border-b border-slate-200">
                  <span className="text-slate-500">Diskon ({discountRate}%)</span>
                  <span className="font-semibold text-red-500">− {formatRp(discountAmt)}</span>
                </div>
              )}
              {taxRate > 0 && (
                <div className="flex justify-between items-center px-4 py-2.5 text-[13px] border-b border-slate-200">
                  <span className="text-slate-500">Pajak ({taxRate}%)</span>
                  <span className="font-semibold text-slate-900">{formatRp(taxAmt)}</span>
                </div>
              )}
              <div className="flex justify-between items-center px-4 py-3 text-[14px] bg-blue-700 text-white font-bold">
                <span>Total</span>
                <span>{formatRp(total)}</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Action Bar ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <Button variant="ghost" onClick={onReset} type="button" size="sm" className="flex-1 sm:flex-none sm:min-w-0">
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button variant="ghost" onClick={onSaveDraft} type="button" size="sm" className="flex-1 sm:flex-none sm:min-w-0">
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Simpan Draft</span>
          </Button>
          <Button variant="sky" onClick={onPrint} type="button" size="sm" className="flex-1 sm:flex-none">
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </Button>
          <Button variant="success" onClick={onDownload} type="button" size="sm" disabled={isPdfGenerating} className="flex-1 sm:flex-none">
            <Download className="w-4 h-4" />
            <span>{isPdfGenerating ? 'Memproses...' : 'Download PDF'}</span>
          </Button>
          <Button variant="primary" onClick={onPreview} type="button" className="w-full sm:w-auto sm:flex-none">
            <Eye className="w-4 h-4" />
            <span>Pratinjau Nota</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
