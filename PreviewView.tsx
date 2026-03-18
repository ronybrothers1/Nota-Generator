import { forwardRef } from 'react';
import { InvoiceData } from '../types';
import { formatRp, formatDate } from '../utils/format';

interface PreviewViewProps {
  data: InvoiceData;
}

export const PreviewView = forwardRef<HTMLDivElement, PreviewViewProps>(({ data }, ref) => {
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
    <div
      ref={ref}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden print:shadow-none print:border-none print:rounded-none"
      style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
    >
      {/* ── Dark header ── */}
      <div
        className="relative bg-slate-900 text-white px-8 py-8 overflow-hidden"
        style={{
          WebkitPrintColorAdjust: 'exact',
          // @ts-ignore
          colorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        {/* Decorative blob */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 -translate-y-1/2 translate-x-1/3"
          style={{ background: '#2563eb', filter: 'blur(60px)' }}
        />
        <div className="relative z-10 flex flex-row items-start justify-between gap-5 flex-wrap">
          {/* Company info */}
          <div className="flex items-center gap-4 min-w-0">
            {data.logo && (
              <div className="bg-white p-2 rounded-xl shadow-sm shrink-0">
                <img src={data.logo} alt="Logo" className="w-14 h-14 object-contain" />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xl font-extrabold tracking-tight text-white truncate max-w-[300px]">
                {data.companyName || 'Nama Perusahaan'}
              </div>
              {data.companyAddress && (
                <div className="text-xs text-slate-300 mt-0.5 truncate max-w-[300px]">{data.companyAddress}</div>
              )}
              {data.companyContact && (
                <div className="text-xs text-slate-300 truncate max-w-[300px]">{data.companyContact}</div>
              )}
            </div>
          </div>

          {/* NOTA badge */}
          <div className="text-right shrink-0">
            <div className="text-3xl font-extrabold text-blue-400 tracking-widest uppercase">NOTA</div>
            <div className="text-xs text-slate-300 mt-1">
              No: <span className="text-white font-semibold">{data.notaNumber || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-8 py-7 text-[13px] text-slate-900 bg-white">
        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-7 p-5 bg-slate-50 rounded-xl border border-slate-100">
          <MetaRow label="Tanggal" value={formatDate(data.transactionDate)} />
          <MetaRow label="Pelanggan" value={data.customerName || '—'} />
          <MetaRow label="Metode Pembayaran" value={data.paymentMethod || '—'} />
          {data.customerAddress && (
            <MetaRow label="Alamat Pelanggan" value={data.customerAddress} />
          )}
        </div>

        {/* Items table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-7">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr>
                {['No', 'Barang / Jasa', 'Qty', 'Satuan', 'Harga Satuan', 'Total'].map((h, i) => (
                  <th
                    key={h}
                    className="bg-slate-100 p-3 text-[10.5px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200"
                    style={{
                      textAlign: i === 0 ? 'center' : i >= 4 ? 'right' : i === 2 ? 'center' : 'left',
                      width: i === 0 ? 36 : i === 2 ? 48 : i === 3 ? 80 : i === 4 ? 110 : i === 5 ? 110 : undefined,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => {
                const qty = Number(item.qty) || 0;
                const price = Number(item.price) || 0;
                const lineTotal = qty * price;
                return (
                  <tr
                    key={item.id}
                    className={i % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}
                  >
                    <td className="p-3 text-center text-slate-500 border-b border-slate-100">{i + 1}</td>
                    <td className="p-3 border-b border-slate-100 font-medium text-slate-900">
                      {item.name || '—'}
                    </td>
                    <td className="p-3 text-center border-b border-slate-100 text-slate-700">{qty}</td>
                    <td className="p-3 border-b border-slate-100 text-slate-500">{item.unit || '—'}</td>
                    <td className="p-3 text-right border-b border-slate-100 text-slate-700">{formatRp(price)}</td>
                    <td className="p-3 text-right border-b border-slate-100 font-semibold text-slate-900">
                      {formatRp(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer: signatures + totals */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mt-6">
          {/* Signatures */}
          <div className="flex gap-10">
            <SignatureBox label="Pelanggan" />
            <SignatureBox label={`Kasir: ${data.cashierName || '—'}`} />
          </div>

          {/* Totals */}
          <div className="min-w-[240px] w-full sm:w-auto bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
            <TotalRow label="Subtotal" value={formatRp(subtotal)} />
            {discountRate > 0 && (
              <TotalRow
                label={`Diskon (${discountRate}%)`}
                value={`− ${formatRp(discountAmt)}`}
                valueClass="text-red-500"
              />
            )}
            {taxRate > 0 && (
              <TotalRow label={`Pajak (${taxRate}%)`} value={formatRp(taxAmt)} />
            )}
            <div className="flex justify-between items-center px-4 py-3 bg-blue-700 text-white">
              <span className="font-extrabold text-[15px]">Total</span>
              <span className="font-extrabold text-[15px]">{formatRp(total)}</span>
            </div>
          </div>
        </div>

        {/* LUNAS stamp — sits below signatures, not overlapping */}
        <div className="flex justify-start mt-2 ml-2">
          <div
            className="inline-flex items-center justify-center px-6 py-2 border-[3px] border-double border-red-500/60 rounded-lg -rotate-[12deg]"
            aria-label="Lunas"
            style={{ mixBlendMode: 'multiply' }}
          >
            <span className="text-2xl font-black text-red-500/60 tracking-[0.25em] uppercase select-none">
              LUNAS
            </span>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-[11px] text-slate-400 mt-8 pt-5 border-t border-dashed border-slate-200">
          Terima kasih atas kepercayaan Anda! &middot; Barang yang sudah dibeli tidak dapat dikembalikan.
        </div>
      </div>
    </div>
  );
});
PreviewView.displayName = 'PreviewView';

/* ── Small helper components ── */

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-[12.5px]">
      <span className="text-slate-500 font-medium min-w-[140px] shrink-0">{label}</span>
      <span className="font-semibold text-slate-900 break-words">{value}</span>
    </div>
  );
}

function SignatureBox({ label }: { label: string }) {
  return (
    <div className="text-center min-w-[110px]">
      <div className="h-14" />
      <div className="border-t border-slate-400 mb-1" />
      <div className="text-[11px] text-slate-500 font-medium">{label}</div>
    </div>
  );
}

function TotalRow({
  label,
  value,
  valueClass = 'text-slate-900',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center px-4 py-2.5 text-[12.5px] border-b border-slate-200 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}
