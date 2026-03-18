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

  const stampSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 224 96" width="224" height="96">
      <rect x="2" y="2" width="220" height="92" rx="8" fill="none" stroke="#C53030" stroke-width="3" />
      <rect x="8" y="8" width="208" height="80" rx="4" fill="none" stroke="#C53030" stroke-width="1.5" />
      <text x="112" y="50" font-family="Times New Roman, Georgia, serif" font-size="38" font-weight="900" fill="#C53030" text-anchor="middle" letter-spacing="2">LUNAS</text>
      <line x1="22" y1="64" x2="202" y2="64" stroke="#C53030" stroke-width="1.5" />
      <text x="112" y="80" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="bold" fill="#C53030" text-anchor="middle" letter-spacing="2">TGL: ${formatDate(data.transactionDate)}</text>
    </svg>
  `;
  const stampUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(stampSvg)}`;

  return (
    <div ref={ref} className="bg-[#ffffff] text-[#2D3748] border border-[#EDF2F7] rounded-none sm:rounded-2xl relative print:shadow-none print:border-none print:rounded-none overflow-hidden font-['Roboto']" style={{ '--default-border-color': '#EDF2F7' } as any}>
      
      {/* Watermark Logo (Optional) */}
      {data.logo && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <img src={data.logo} alt="Watermark" className="w-[70%] h-[70%] object-contain grayscale opacity-10" />
        </div>
      )}

      <div className="p-12 text-[13px] text-[#2D3748] font-sans relative z-10">
        
        {/* 1. Tata Letak: Grid Dua Kolom di Header */}
        <div className="flex flex-row items-start justify-between border-b-2 border-[#EDF2F7] pb-8">
          {/* Kiri: Identitas Usaha */}
          <div className="flex items-start gap-5 max-w-[60%]">
            {data.logo && (
              <img src={data.logo} alt="Logo" className="w-20 h-20 object-contain" />
            )}
            <div className="flex flex-col font-['Inter']">
              <h1 className="text-2xl font-black tracking-tight text-[#1A365D] uppercase">{data.companyName || 'NAMA PERUSAHAAN'}</h1>
              {/* Alokasi Ruang Legalitas (NPWP) */}
              {data.companyNpwp && <p className="text-[#718096] mt-1 font-medium text-xs">NPWP: <span className="font-['Roboto']">{data.companyNpwp}</span></p>}
              <p className="text-[#4A5568] mt-1 leading-relaxed whitespace-pre-wrap text-sm font-['Roboto']">{data.companyAddress}</p>
              <p className="text-[#4A5568] mt-1 font-medium text-sm font-['Roboto']">{data.companyContact}</p>
            </div>
          </div>
          
          {/* Kanan: Detail Dokumen */}
          <div className="text-right flex flex-col items-end font-['Inter']">
            {/* Skala Tipografi: Judul dokumen utama terbesar */}
            <h2 className="text-5xl font-black text-[#1A365D] tracking-tighter uppercase mb-4">NOTA</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-right items-center">
              {/* Sistem Kontras Bobot Font: Regular untuk label, Bold untuk nilai */}
              <span className="text-[#718096] font-normal text-xs uppercase tracking-wider">No. Nota</span>
              <span className="font-bold text-[#2D3748] text-sm font-['Roboto']">{data.notaNumber || '-'}</span>
              
              <span className="text-[#718096] font-normal text-xs uppercase tracking-wider">Tanggal Terbit</span>
              <span className="font-bold text-[#2D3748] text-sm font-['Roboto']">{formatDate(data.transactionDate)}</span>
            </div>
          </div>
        </div>

        {/* Isolasi Area Tagihan: Ruang kosong (whitespace) yang cukup tegas */}
        <div className="flex flex-row justify-between mt-10 mb-10">
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-normal text-[#718096] uppercase tracking-wider mb-1 font-['Inter']">Ditagihkan Kepada:</h3>
            <p className="text-lg font-bold text-[#2D3748] font-['Inter']">{data.customerName || '-'}</p>
            <p className="text-[#4A5568] max-w-[280px] leading-relaxed font-['Roboto'] text-sm">{data.customerAddress || '-'}</p>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <h3 className="text-xs font-normal text-[#718096] uppercase tracking-wider mb-1 font-['Inter']">Metode Pembayaran:</h3>
            <p className="text-lg font-bold text-[#2D3748] font-['Inter']">{data.paymentMethod || '-'}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-10">
          <table className="w-full border-collapse text-[13px] font-['Roboto']">
            <thead>
              {/* Implementasi Warna: Header tabel menggunakan warna aksen (Navy Blue) */}
              <tr className="bg-[#EDF2F7] border-y-2 border-[#1A365D]">
                {/* Standar Perataan Kolom */}
                <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-[#1A365D] w-12 font-['Inter']">No</th>
                <th className="py-3 px-4 text-left text-xs font-bold uppercase tracking-wider text-[#1A365D] font-['Inter']">Deskripsi Barang / Jasa</th>
                <th className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider text-[#1A365D] w-20 font-['Inter']">Qty</th>
                <th className="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider text-[#1A365D] w-24 font-['Inter']">Satuan</th>
                <th className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider text-[#1A365D] w-36 font-['Inter']">Harga Satuan</th>
                <th className="py-3 px-4 text-right text-xs font-bold uppercase tracking-wider text-[#1A365D] w-36 font-['Inter']">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => {
                const qty = parseFloat(item.qty as string) || 0;
                const price = parseFloat(item.price as string) || 0;
                return (
                  /* Pemisah Baris (Rule Lines): Garis horizontal tipis abu-abu terang */
                  <tr key={item.id} className="border-b border-[#EDF2F7]">
                    <td className="py-4 px-4 text-[#4A5568]">{i + 1}</td>
                    <td className="py-4 px-4 text-[#2D3748] font-medium">{item.name || '-'}</td>
                    {/* Tabular Figures untuk angka */}
                    <td className="py-4 px-4 text-[#2D3748] text-right tabular-nums">{qty}</td>
                    <td className="py-4 px-4 text-[#718096] text-center">{item.unit || '-'}</td>
                    <td className="py-4 px-4 text-[#2D3748] text-right tabular-nums">{formatRp(price)}</td>
                    <td className="py-4 px-4 text-[#2D3748] text-right font-bold tabular-nums">{formatRp(qty * price)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="flex flex-row justify-between items-start gap-8 relative">
          
          {/* Signatures & Stamp */}
          <div className="flex gap-16 justify-start w-auto relative z-10 pt-8">
            
            {/* Desain Stempel Digital: Menyerupai stempel tinta basah (Carmine Red) */}
            <div 
              className="absolute top-0 left-12 w-56 h-24 pointer-events-none z-0 opacity-90"
              style={{ transform: 'rotate(-10deg)' }}
            >
              <img src={stampUrl} alt="LUNAS" className="w-full h-full object-contain" />
            </div>

            <div className="text-center min-w-[140px] relative z-10 font-['Inter']">
              <div className="h-20"></div>
              <div className="border-t border-[#2D3748] mb-2"></div>
              <div className="text-xs text-[#718096] font-normal uppercase tracking-wider">Pelanggan</div>
            </div>
            <div className="text-center min-w-[140px] relative z-10 font-['Inter']">
              <div className="h-20"></div>
              <div className="border-t border-[#2D3748] mb-2"></div>
              <div className="text-xs text-[#718096] font-normal uppercase tracking-wider">Kasir: <span className="font-bold text-[#2D3748]">{data.cashierName || '-'}</span></div>
            </div>
          </div>

          {/* Totals */}
          <div className="min-w-[320px] w-auto font-['Roboto']">
            <div className="flex flex-col gap-3 px-4 pb-4">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#718096] font-normal font-['Inter']">Subtotal</span>
                <span className="font-bold text-[#2D3748] tabular-nums">{formatRp(subtotal)}</span>
              </div>
              {discountRate > 0 && (
                <div className="flex justify-between text-[14px] text-[#C53030]">
                  <span className="font-normal font-['Inter']">Diskon ({discountRate}%)</span>
                  <span className="font-bold tabular-nums">- {formatRp(discountAmt)}</span>
                </div>
              )}
              {taxRate > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#718096] font-normal font-['Inter']">Pajak ({taxRate}%)</span>
                  <span className="font-bold text-[#2D3748] tabular-nums">{formatRp(taxAmt)}</span>
                </div>
              )}
            </div>
            {/* Skala Tipografi: Nilai nominal TOTAL mendapat penekanan ukuran paling besar kedua */}
            <div className="bg-[#1A365D] p-5 rounded-lg flex justify-between items-center text-[#ffffff] font-['Inter'] shadow-sm">
              <span className="text-[15px] font-bold uppercase tracking-wider">Total</span>
              <span className="text-[24px] font-black tabular-nums">{formatRp(total)}</span>
            </div>
          </div>
        </div>

        {/* Koreksi Teks Footer */}
        <div className="text-center text-xs text-[#718096] mt-20 pt-6 border-t border-[#EDF2F7] font-['Roboto']">
          <p className="font-medium text-[#2D3748] mb-1">Terima kasih atas kepercayaan Anda berbisnis dengan kami.</p>
          <p>Barang yang sudah dibeli tidak dapat dikembalikan kecuali terdapat perjanjian khusus sebelumnya.</p>
        </div>
      </div>
    </div>
  );
});
PreviewView.displayName = 'PreviewView';
