import { useState, useRef, useEffect, useCallback } from 'react';
import { FormView } from './components/FormView';
import { PreviewView } from './components/PreviewView';
import { InvoiceData } from './types';
import { generatePDF } from './utils/pdf';
import { Download, Printer, ArrowLeft, CheckCircle2, AlertCircle, Info, FileText } from 'lucide-react';
import { Button } from './components/ui/Button';
import { cn } from './utils/cn';

const STORAGE_KEY = 'nota_draft_v1';

const makeDefaultData = (): InvoiceData => ({
  companyName: '',
  companyAddress: '',
  companyContact: '',
  logo: '',
  notaNumber: '',
  transactionDate: new Date().toISOString().slice(0, 10),
  paymentMethod: 'Tunai',
  customerName: '',
  customerAddress: '',
  cashierName: '',
  taxRate: 0,
  discountRate: 0,
  items: [{ id: crypto.randomUUID(), name: '', unit: '', qty: 1, price: 0 }],
});

type ToastType = 'success' | 'error' | 'info';

export default function App() {
  const [data, setData] = useState<InvoiceData>(makeDefaultData);
  const [view, setView] = useState<'form' | 'preview'>('form');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: ToastType } | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftDate, setDraftDate] = useState<string>('');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkDraft();
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  const showToast = useCallback((text: string, type: ToastType = 'info') => {
    setToastMsg({ text, type });
  }, []);

  const checkDraft = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { setHasDraft(false); return; }
    try {
      const parsed = JSON.parse(raw);
      setHasDraft(true);
      const d = new Date(parsed.savedAt);
      setDraftDate(
        `${d.toLocaleDateString('id-ID')} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
      );
    } catch {
      setHasDraft(false);
    }
  };

  const saveDraft = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
      showToast('Draft tersimpan!', 'success');
      checkDraft();
    } catch {
      showToast('Gagal menyimpan draft.', 'error');
    }
  };

  const restoreDraft = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const { savedAt: _savedAt, ...parsed } = JSON.parse(raw);
      setData(parsed as InvoiceData);
      showToast('Draft dipulihkan!', 'success');
    } catch {
      showToast('Gagal memulihkan draft.', 'error');
    }
  };

  const clearDraft = () => {
    if (!confirm('Hapus draft tersimpan?')) return;
    localStorage.removeItem(STORAGE_KEY);
    checkDraft();
    showToast('Draft dihapus.', 'info');
  };

  const resetForm = () => {
    if (!confirm('Reset semua data? Tindakan ini tidak bisa dibatalkan.')) return;
    setData(makeDefaultData());
    showToast('Form berhasil direset.', 'info');
  };

  const validate = (): boolean => {
    if (!data.companyName.trim()) { showToast('Harap isi Nama Perusahaan', 'error'); return false; }
    if (!data.notaNumber.trim()) { showToast('Harap isi Nomor Nota', 'error'); return false; }
    if (!data.transactionDate) { showToast('Harap isi Tanggal Transaksi', 'error'); return false; }
    if (!data.customerName.trim()) { showToast('Harap isi Nama Pelanggan', 'error'); return false; }
    if (!data.cashierName.trim()) { showToast('Harap isi Nama Kasir', 'error'); return false; }
    if (data.items.length === 0) { showToast('Tambahkan minimal satu item.', 'error'); return false; }

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      if (!item.name.trim()) { showToast(`Nama barang/jasa pada item #${i + 1} harus diisi.`, 'error'); return false; }
      if (Number(item.qty) < 1) { showToast(`Jumlah item #${i + 1} harus minimal 1.`, 'error'); return false; }
      if (Number(item.price) < 0) { showToast(`Harga item #${i + 1} tidak valid.`, 'error'); return false; }
    }

    const tax = Number(data.taxRate);
    const disc = Number(data.discountRate);
    if (isNaN(tax) || tax < 0 || tax > 100) { showToast('Pajak harus antara 0–100%.', 'error'); return false; }
    if (isNaN(disc) || disc < 0 || disc > 100) { showToast('Diskon harus antara 0–100%.', 'error'); return false; }

    return true;
  };

  const handlePreview = () => {
    if (validate()) {
      setView('preview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrint = () => {
    if (!validate()) return;
    if (view === 'form') {
      setView('preview');
      // Give React time to render the preview before printing
      setTimeout(() => window.print(), 400);
    } else {
      window.print();
    }
  };

  const handleDownload = async () => {
    if (!validate()) return;
    if (isPdfGenerating) return;

    setIsPdfGenerating(true);
    showToast('Membuat PDF, harap tunggu...', 'info');

    // Switch to preview first if needed
    if (view === 'form') {
      setView('preview');
      // Wait for React to render + fonts to load
      await new Promise(r => setTimeout(r, 600));
    }

    // Retry a few times waiting for ref to attach
    let attempts = 0;
    while (!receiptRef.current && attempts < 10) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }

    if (!receiptRef.current) {
      showToast('Terjadi kesalahan: elemen tidak ditemukan. Coba lagi.', 'error');
      setIsPdfGenerating(false);
      return;
    }

    const filename = data.notaNumber.trim().replace(/[^a-zA-Z0-9\-_]/g, '_') || 'nota';
    const success = await generatePDF(receiptRef.current, filename);

    if (success) {
      showToast('PDF berhasil diunduh!', 'success');
    } else {
      showToast('Gagal membuat PDF. Coba gunakan tombol Print.', 'error');
    }
    setIsPdfGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16">
      {/* Topbar */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-700 to-sky-500 rounded-md flex items-center justify-center text-white shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight">Nota Generator</div>
            <div className="text-[11px] text-slate-500 leading-tight hidden sm:block">Buat nota profesional dengan mudah</div>
          </div>
        </div>
        <div className="bg-blue-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">PRO</div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {view === 'form' ? (
          <FormView
            data={data}
            setData={setData}
            hasDraft={hasDraft}
            draftDate={draftDate}
            onRestoreDraft={restoreDraft}
            onClearDraft={clearDraft}
            onSaveDraft={saveDraft}
            onReset={resetForm}
            onPreview={handlePreview}
            onPrint={handlePrint}
            onDownload={handleDownload}
            isPdfGenerating={isPdfGenerating}
          />
        ) : (
          <div className="space-y-4">
            {/* Preview action bar */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-between print:hidden bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm">
              <Button variant="ghost" onClick={() => setView('form')} size="sm">
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Form</span>
              </Button>
              <div className="flex gap-2 sm:gap-3">
                <Button variant="sky" onClick={handlePrint} size="sm">
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                </Button>
                <Button variant="success" onClick={handleDownload} disabled={isPdfGenerating} size="sm">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">{isPdfGenerating ? 'Memproses...' : 'Download PDF'}</span>
                </Button>
              </div>
            </div>

            {/* Preview container — scrollable on small screens */}
            <div className="overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="w-[794px] mx-auto shadow-lg rounded-2xl">
                <PreviewView data={data} ref={receiptRef} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-slate-400 print:hidden">
        Dikembangkan oleh Imam Sahroni Darmawan
      </footer>

      {/* Toast */}
      <div
        aria-live="polite"
        className={cn(
          'fixed bottom-6 right-4 sm:right-6 px-4 py-3 rounded-xl text-[13px] font-medium shadow-xl max-w-[calc(100vw-2rem)] sm:max-w-xs z-[999] flex items-center gap-2 transition-all duration-300',
          toastMsg ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none',
          toastMsg?.type === 'error' ? 'bg-red-500 text-white' :
          toastMsg?.type === 'success' ? 'bg-emerald-500 text-white' :
          'bg-slate-900 text-white'
        )}
      >
        {toastMsg?.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
        {toastMsg?.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
        {toastMsg?.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
        <span>{toastMsg?.text}</span>
      </div>
    </div>
  );
}
