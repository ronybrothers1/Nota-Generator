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
  RefreshCw
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
}: FormViewProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateData = (key: keyof InvoiceData, value: any) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        updateData('logo', ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
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

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
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
    const qty = parseFloat(item.qty as string) || 0;
    const price = parseFloat(item.price as string) || 0;
    return acc + (qty * price);
  }, 0);
  const discountRate = parseFloat(data.discountRate as string) || 0;
  const taxRate = parseFloat(data.taxRate as string) || 0;
  
  const discountAmt = subtotal * (discountRate / 100);
  const afterDisc = subtotal - discountAmt;
  const taxAmt = afterDisc * (taxRate / 100);
  const total = afterDisc + taxAmt;

  return (
    <div className="space-y-6">
      {/* Draft Status */}
      {hasDraft && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-blue-700">
          <div className="flex items-center gap-2 font-medium">
            <Save className="w-4 h-4" />
            <span>Draft tersimpan — {draftDate}</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline-dashed" size="sm" onClick={onRestoreDraft} className="flex-1 sm:flex-none">Pulihkan</Button>
            <Button variant="ghost" size="sm" onClick={onClearDraft} className="flex-1 sm:flex-none">Hapus</Button>
          </div>
        </div>
      )}

      {/* Company Info */}
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
            <div 
              className="w-24 h-24 shrink-0 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors overflow-hidden relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {data.logo ? (
                <>
                  <img src={data.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-medium">
                    Ganti
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5 text-slate-400" />
                  <span className="text-[10px] text-slate-500 text-center leading-tight px-2">Upload Logo</span>
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
            
            <div className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <Label>Nama Perusahaan <span className="text-red-500">*</span></Label>
                <Input 
                  value={data.companyName} 
                  onChange={(e) => updateData('companyName', e.target.value)} 
                  placeholder="Contoh: CV. Maju Jaya" 
                  maxLength={100}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Alamat</Label>
                  <Input 
                    value={data.companyAddress} 
                    onChange={(e) => updateData('companyAddress', e.target.value)} 
                    placeholder="Jl. Sudirman No.1, Jakarta" 
                    maxLength={200}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Telepon / Email</Label>
                  <Input 
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

      {/* Transaction Info */}
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
            <div className="space-y-1.5">
              <Label>No. Nota <span className="text-red-500">*</span></Label>
              <Input 
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
            <div className="space-y-1.5">
              <Label>Tanggal <span className="text-red-500">*</span></Label>
              <Input 
                type="date" 
                value={data.transactionDate} 
                onChange={(e) => updateData('transactionDate', e.target.value)} 
              />
            </div>
            <div className="space-y-1.5">
              <Label>Metode Pembayaran</Label>
              <select 
                className="w-full px-3 py-2 border-2 border-slate-200 rounded-md text-sm text-slate-900 bg-white transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center] pr-8"
                value={data.paymentMethod}
                onChange={(e) => updateData('paymentMethod', e.target.value)}
              >
                <option value="Tunai">Tunai</option>
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="Kartu Kredit">Kartu Kredit</option>
                <option value="QRIS">QRIS</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Nama Pelanggan <span className="text-red-500">*</span></Label>
              <Input 
                value={data.customerName} 
                onChange={(e) => updateData('customerName', e.target.value)} 
                placeholder="Budi Santoso" 
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Alamat Pelanggan</Label>
              <Input 
                value={data.customerAddress} 
                onChange={(e) => updateData('customerAddress', e.target.value)} 
                placeholder="Jl. Kebon Jeruk, Jakarta" 
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nama Kasir <span className="text-red-500">*</span></Label>
              <Input 
                value={data.cashierName} 
                onChange={(e) => updateData('cashierName', e.target.value)} 
                placeholder="Siti Aminah" 
                maxLength={100}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Items */}
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
          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Nama Barang / Jasa</th>
                  <th className="p-3 w-24 text-center">Qty</th>
                  <th className="p-3 w-28">Satuan</th>
                  <th className="p-3 w-36 text-right">Harga Satuan</th>
                  <th className="p-3 w-16 text-center">Hapus</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-2 text-center text-slate-400 text-xs">{index + 1}</td>
                    <td className="p-2">
                      <input 
                        className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 outline-none transition-all"
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
                        className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 outline-none transition-all text-center"
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, 'qty', e.target.value === '' ? '' : e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 outline-none transition-all"
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
                        className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 outline-none transition-all text-right"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', e.target.value === '' ? '' : e.target.value)}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <Button 
                        variant="danger-ghost" 
                        size="sm" 
                        onClick={() => removeItem(item.id)}
                        disabled={data.items.length <= 1}
                        className="p-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <Button variant="outline-dashed" className="w-full mt-4" onClick={addItem}>
            <Plus className="w-4 h-4" /> Tambah Barang / Jasa
          </Button>

          {/* Totals Section */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mt-6 pt-6 border-t border-slate-200">
            <div className="flex gap-4 w-full md:w-auto">
              <div className="space-y-1.5 w-full md:w-32">
                <Label>Pajak (%)</Label>
                <Input 
                  type="number" 
                  min="0" max="100" 
                  value={data.taxRate} 
                  onChange={(e) => updateData('taxRate', e.target.value === '' ? '' : e.target.value)} 
                />
              </div>
              <div className="space-y-1.5 w-full md:w-32">
                <Label>Diskon (%)</Label>
                <Input 
                  type="number" 
                  min="0" max="100" 
                  value={data.discountRate} 
                  onChange={(e) => updateData('discountRate', e.target.value === '' ? '' : e.target.value)} 
                />
              </div>
            </div>

            <div className="w-full md:w-72 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
              <div className="flex justify-between items-center p-3 text-[13px] border-b border-slate-200">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold">{formatRp(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center p-3 text-[13px] border-b border-slate-200 text-red-500">
                <span className="text-slate-500">Diskon ({discountRate}%)</span>
                <span className="font-semibold">- {formatRp(discountAmt)}</span>
              </div>
              <div className="flex justify-between items-center p-3 text-[13px] border-b border-slate-200">
                <span className="text-slate-500">Pajak ({taxRate}%)</span>
                <span className="font-semibold">{formatRp(taxAmt)}</span>
              </div>
              <div className="flex justify-between items-center p-3 text-[14px] bg-blue-700 text-white font-bold">
                <span>Total</span>
                <span>{formatRp(total)}</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-end gap-3">
        <Button variant="ghost" onClick={onSaveDraft} className="flex-1 sm:flex-none">
          <Save className="w-4 h-4" /> Simpan Draft
        </Button>
        <Button variant="ghost" onClick={onReset} className="flex-1 sm:flex-none">
          <RotateCcw className="w-4 h-4" /> Reset
        </Button>
        <Button variant="primary" onClick={onPreview} className="flex-1 sm:flex-none">
          <Eye className="w-4 h-4" /> Pratinjau Nota
        </Button>
        <Button variant="sky" onClick={onPrint} className="flex-1 sm:flex-none">
          <Printer className="w-4 h-4" /> Print
        </Button>
        <Button variant="success" onClick={onDownload} className="flex-1 sm:flex-none">
          <Download className="w-4 h-4" /> Download PDF
        </Button>
      </div>
    </div>
  );
};
