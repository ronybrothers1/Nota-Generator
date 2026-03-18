import { useState, useRef, useEffect } from 'react';
import { FormView } from './components/FormView';
import { PreviewView } from './components/PreviewView';
import { InvoiceData } from './types';
import { generatePDF } from './utils/pdf';
import { Download, Printer, ArrowLeft, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Button } from './components/ui/Button';
import { cn } from './utils/cn';
import { useReactToPrint } from 'react-to-print';

const STORAGE_KEY = 'nota_draft_v1';

const defaultData: InvoiceData = {
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
};

export default function App() {
  const [data, setData] = useState<InvoiceData>(defaultData);
  const [view, setView] = useState<'form' | 'preview'>('form');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftDate, setDraftDate] = useState<string>('');
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkDraft();
  }, []);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg({ text, type });
  };

  const checkDraft = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setHasDraft(true);
        const d = new Date(parsed.savedAt);
        setDraftDate(`${d.toLocaleDateString('id-ID')} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`);
      } catch {
        setHasDraft(false);
      }
    } else {
      setHasDraft(false);
    }
  };

  const saveDraft = () => {
    try {
      const toSave = { ...data, savedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
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
      const parsed = JSON.parse(raw);
      setData(parsed);
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
    setData({ ...defaultData, items: [{ id: crypto.randomUUID(), name: '', unit: '', qty: 1, price: 0 }] });
    showToast('Form berhasil direset.', 'info');
  };

  const validate = () => {
    if (!data.companyName.trim()) { showToast('Harap isi Nama Perusahaan', 'error'); return false; }
    if (!data.notaNumber.trim()) { showToast('Harap isi Nomor Nota', 'error'); return false; }
    if (!data.transactionDate) { showToast('Harap isi Tanggal Transaksi', 'error'); return false; }
    if (!data.customerName.trim()) { showToast('Harap isi Nama Pelanggan', 'error'); return false; }
    if (!data.cashierName.trim()) { showToast('Harap isi Nama Kasir', 'error'); return false; }

    if (data.items.length === 0) {
      showToast('Tambahkan minimal satu item.', 'error'); return false;
    }

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      const qty = parseFloat(item.qty as string) || 0;
      const price = parseFloat(item.price as string) || 0;
      
      if (!item.name.trim()) { showToast(`Nama barang/jasa pada item #${i + 1} harus diisi.`, 'error'); return false; }
      if (qty < 1) { showToast(`Jumlah item #${i + 1} harus minimal 1.`, 'error'); return false; }
      if (price < 0) { showToast(`Harga item #${i + 1} tidak valid.`, 'error'); return false; }
    }

    const tax = parseFloat(data.taxRate as string) || 0;
    const disc = parseFloat(data.discountRate as string) || 0;

    if (tax < 0 || tax > 100) { showToast('Pajak harus antara 0–100%.', 'error'); return false; }
    if (disc < 0 || disc > 100) { showToast('Diskon harus antara 0–100%.', 'error'); return false; }

    return true;
  };

  const handlePreview = () => {
    if (validate()) {
      setView('preview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const reactToPrintFn = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: data.notaNumber ? `Nota_${data.notaNumber}` : 'Nota',
  });

  const handlePrint = () => {
    if (view === 'form' && !validate()) return;
    if (view === 'form') {
      setView('preview');
      setTimeout(() => reactToPrintFn(() => receiptRef.current), 300);
    } else {
      reactToPrintFn(() => receiptRef.current);
    }
  };

  const handleDownload = async () => {
    if (view === 'form' && !validate()) return;
    
    setIsPdfGenerating(true);
    showToast('Membuat PDF, harap tunggu...', 'info');
    
    if (view === 'form') {
      setView('preview');
      // Wait for React to render the PreviewView and attach the ref
      await new Promise(r => setTimeout(r, 800));
    }

    if (!receiptRef.current) {
      showToast('Terjadi kesalahan sistem (Ref null). Coba lagi.', 'error');
      setIsPdfGenerating(false);
      return;
    }

    try {
      const filename = data.notaNumber.trim().replace(/[^a-zA-Z0-9-_]/g, '_') || 'nota';
      const success = await generatePDF(receiptRef.current, filename);
      
      if (success) {
        showToast('PDF berhasil diunduh!', 'success');
      } else {
        showToast('Gagal membuat PDF. Menggunakan mode Print...', 'error');
        setTimeout(() => reactToPrintFn(() => receiptRef.current), 1000);
      }
    } catch (error) {
      console.error(error);
      showToast('Gagal membuat PDF. Menggunakan mode Print...', 'error');
      setTimeout(() => reactToPrintFn(() => receiptRef.current), 1000);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16">
      {/* Topbar */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-700 to-sky-500 rounded-md flex items-center justify-center text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <div className="text-[15px] font-bold text-slate-900 tracking-tight">Nota Generator</div>
            <div className="text-[11px] text-slate-500">Buat nota profesional dengan mudah</div>
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
          />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3 justify-end print:hidden">
              <Button variant="ghost" onClick={() => setView('form')}>
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </Button>
              <Button variant="sky" onClick={handlePrint}>
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </Button>
              <Button variant="success" onClick={handleDownload} disabled={isPdfGenerating}>
                <Download className="w-4 h-4" />
                <span>{isPdfGenerating ? 'Memproses...' : 'Download PDF'}</span>
              </Button>
            </div>
            <div className="overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="w-[794px] mx-auto shadow-sm">
                <PreviewView data={data} ref={receiptRef} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* App Footer */}
      <footer className="text-center py-8 text-sm text-slate-500 print:hidden">
        Dikembangkan oleh Imam Sahroni Darmawan
      </footer>

      {/* Toast */}
      <div
        className={cn(
          'fixed bottom-6 right-6 px-4 py-3 rounded-xl text-[13px] font-medium shadow-lg max-w-xs z-[999] transition-all duration-300 flex items-center gap-2',
          toastMsg ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0',
          toastMsg?.type === 'error' ? 'bg-red-500 text-white' : 
          toastMsg?.type === 'success' ? 'bg-emerald-500 text-white' : 
          'bg-slate-900 text-white'
        )}
      >
        {toastMsg?.type === 'error' && <AlertCircle className="w-4 h-4" />}
        {toastMsg?.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
        {toastMsg?.type === 'info' && <Info className="w-4 h-4" />}
        {toastMsg?.text}
      </div>
    </div>
  );
}
