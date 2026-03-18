import { forwardRef } from 'react';
import { InvoiceData } from '../types';
import { formatRp, formatDate } from '../utils/format';

interface PreviewViewProps {
  data: InvoiceData;
}

export const PreviewView = forwardRef<HTMLDivElement, PreviewViewProps>(({ data }, ref) => {
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
    <div ref={ref} className="bg-white border border-slate-200 rounded-2xl overflow-hidden relative print:shadow-none print:border-none">
      {/* Header with Background */}
      <div className="relative bg-slate-900 text-white p-8 sm:p-10 overflow-hidden print:color-adjust-exact" style={{ WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' } as any}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-5">
          <div className="flex items-center gap-4">
            {data.logo && (
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <img src={data.logo} alt="Logo" className="w-16 h-16 object-contain" />
              </div>
            )}
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-white">{data.companyName || 'Nama Perusahaan'}</div>
              <div className="text-sm text-slate-300 mt-1">{data.companyAddress}</div>
              <div className="text-sm text-slate-300">{data.companyContact}</div>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-3xl font-extrabold text-blue-400 tracking-tight uppercase">NOTA</div>
            <div className="text-sm text-slate-300 mt-1">No: <span className="text-white font-semibold">{data.notaNumber || '-'}</span></div>
          </div>
        </div>
      </div>

      <div className="p-8 sm:p-10 text-[13px] text-slate-900 font-sans relative z-10 bg-white">
        {/* Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 p-5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 text-[13px]">
              <span className="text-slate-500 font-medium min-w-[130px]">Tanggal</span>
              <span className="font-semibold text-slate-900">{formatDate(data.transactionDate)}</span>
            </div>
            <div className="flex gap-2 text-[13px]">
              <span className="text-slate-500 font-medium min-w-[130px]">Metode Pembayaran</span>
              <span className="font-semibold text-slate-900">{data.paymentMethod || '-'}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 text-[13px]">
              <span className="text-slate-500 font-medium min-w-[130px]">Pelanggan</span>
              <span className="font-semibold text-slate-900">{data.customerName || '-'}</span>
            </div>
            <div className="flex gap-2 text-[13px]">
              <span className="text-slate-500 font-medium min-w-[130px]">Alamat Pelanggan</span>
              <span className="font-semibold text-slate-900">{data.customerAddress || '-'}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="bg-slate-100 p-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 w-10">No</th>
                <th className="bg-slate-100 p-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">Barang / Jasa</th>
                <th className="bg-slate-100 p-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 w-16">Qty</th>
                <th className="bg-slate-100 p-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 w-24">Satuan</th>
                <th className="bg-slate-100 p-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 w-32">Harga Satuan</th>
                <th className="bg-slate-100 p-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 w-32">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => {
                const qty = parseFloat(item.qty as string) || 0;
                const price = parseFloat(item.price as string) || 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 border-b border-slate-100 text-slate-900">{i + 1}</td>
                    <td className="p-3 border-b border-slate-100 text-slate-900 font-medium">{item.name || '-'}</td>
                    <td className="p-3 border-b border-slate-100 text-slate-900 text-center">{qty}</td>
                    <td className="p-3 border-b border-slate-100 text-slate-500">{item.unit || '-'}</td>
                    <td className="p-3 border-b border-slate-100 text-slate-900 text-right">{formatRp(price)}</td>
                    <td className="p-3 border-b border-slate-100 text-slate-900 text-right font-semibold">{formatRp(qty * price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-8 mt-8 relative">
          
          {/* Stamp */}
          <div className="absolute -top-10 left-4 sm:left-12 w-48 h-16 border-[4px] border-double border-red-600/70 rounded-lg flex items-center justify-center -rotate-[15deg] pointer-events-none mix-blend-multiply z-0">
            <div className="text-3xl font-bold text-red-600/70 uppercase tracking-widest font-serif">LUNAS</div>
          </div>

          <div className="flex gap-12 justify-center sm:justify-start w-full sm:w-auto relative z-10">
            <div className="text-center min-w-[120px]">
              <div className="border-t border-slate-400 mt-16 mb-2"></div>
              <div className="text-xs text-slate-500 font-medium">Pelanggan</div>
            </div>
            <div className="text-center min-w-[120px]">
              <div className="border-t border-slate-400 mt-16 mb-2"></div>
              <div className="text-xs text-slate-500 font-medium">Kasir: {data.cashierName || '-'}</div>
            </div>
          </div>

          <div className="min-w-[260px] w-full sm:w-auto bg-slate-50 p-5 rounded-xl border border-slate-100 relative z-10">
            <div className="flex justify-between py-2 border-b border-slate-200 text-[13px]">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold">{formatRp(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 text-[13px] text-red-500">
              <span className="text-red-500">Diskon ({discountRate}%)</span>
              <span className="font-semibold">- {formatRp(discountAmt)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200 text-[13px]">
              <span className="text-slate-500">Pajak ({taxRate}%)</span>
              <span className="font-semibold">{formatRp(taxAmt)}</span>
            </div>
            <div className="flex justify-between pt-3 mt-1 text-[16px] font-extrabold text-blue-700">
              <span>Total</span>
              <span>{formatRp(total)}</span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 mt-10 pt-6 border-t border-dashed border-slate-200">
          Terima kasih atas kepercayaan Anda! &middot; Barang yang sudah dibeli tidak dapat dikembalikan.
        </div>
      </div>
    </div>
  );
});
PreviewView.displayName = 'PreviewView';
