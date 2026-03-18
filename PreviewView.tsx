import { forwardRef } from 'react';
import { InvoiceData } from '../types';
import { formatRp, formatDate } from '../utils/format';

interface PreviewViewProps {
  data: InvoiceData;
}

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  ink:       '#0F1923',
  inkMid:    '#3D4F5C',
  inkLight:  '#7A8F9E',
  accent:    '#1A56DB',
  accentDark:'#1240A8',
  accentBg:  '#EEF3FF',
  gold:      '#B8832A',
  border:    '#DDE3EA',
  rowAlt:    '#F7F9FC',
  white:     '#FFFFFF',
  danger:    '#C8312A',
  headBg:    '#0D1B2A',
};

// ─── Style objects (all inline — Tailwind-free for html2canvas reliability) ─
const S: Record<string, React.CSSProperties> = {
  // Root page — fixed A4-ish width
  page: {
    width: '794px',
    backgroundColor: C.white,
    fontFamily: '"Plus Jakarta Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '13px',
    color: C.ink,
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    background: `linear-gradient(140deg, ${C.headBg} 0%, #122640 55%, #0D3461 100%)`,
    padding: '30px 40px 26px',
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    top: '-70px', right: '-50px',
    width: '230px', height: '230px',
    borderRadius: '50%',
    background: C.accent,
    opacity: 0.2,
    filter: 'blur(50px)',
  },
  orb2: {
    position: 'absolute',
    bottom: '-40px', left: '35%',
    width: '160px', height: '160px',
    borderRadius: '50%',
    background: '#3B82F6',
    opacity: 0.12,
    filter: 'blur(35px)',
  },
  headerInner: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '20px',
  },
  logoBox: {
    width: '58px', height: '58px',
    backgroundColor: C.white,
    borderRadius: '12px',
    padding: '6px',
    boxSizing: 'border-box',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  companyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  companyName: {
    color: C.white,
    fontSize: '19px',
    fontWeight: 800,
    letterSpacing: '-0.3px',
    lineHeight: 1.2,
    margin: 0,
    padding: 0,
  },
  companyMeta: {
    color: 'rgba(255,255,255,0.50)',
    fontSize: '11px',
    marginTop: '4px',
    lineHeight: 1.5,
  },
  notaBadge: {
    textAlign: 'right',
    flexShrink: 0,
  },
  notaWord: {
    color: '#60A5FA',
    fontSize: '30px',
    fontWeight: 900,
    letterSpacing: '7px',
    textTransform: 'uppercase',
    lineHeight: 1,
    margin: 0,
    padding: 0,
  },
  notaNumLine: {
    color: 'rgba(255,255,255,0.50)',
    fontSize: '11px',
    marginTop: '6px',
    letterSpacing: '0.3px',
  },
  notaNumVal: {
    color: C.white,
    fontWeight: 700,
  },

  // Accent stripe
  stripe: {
    height: '4px',
    background: `linear-gradient(90deg, ${C.accent} 0%, #60A5FA 50%, ${C.accent} 100%)`,
  },

  // ── Body ──────────────────────────────────────────────────
  body: {
    padding: '26px 40px 30px',
  },

  // Meta info grid
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    border: `1.5px solid ${C.border}`,
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '22px',
  },
  metaCell: {
    padding: '10px 15px',
    borderBottom: `1px solid ${C.border}`,
    borderRight: `1px solid ${C.border}`,
    boxSizing: 'border-box',
  },
  metaLabel: {
    color: C.inkLight,
    fontSize: '9.5px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.7px',
    marginBottom: '2px',
  },
  metaValue: {
    color: C.ink,
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: 1.3,
  },

  // Section label
  sectionLabel: {
    fontSize: '9.5px',
    fontWeight: 800,
    color: C.inkLight,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '9px',
  },

  // Items table
  tableWrap: {
    border: `1.5px solid ${C.border}`,
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '22px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },
  thead: {
    backgroundColor: C.headBg,
  },
  th: {
    padding: '9px 13px',
    fontSize: '9.5px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'rgba(255,255,255,0.60)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '10px 13px',
    borderBottom: `1px solid ${C.border}`,
    fontSize: '12px',
    verticalAlign: 'middle',
    lineHeight: 1.4,
  },
  tdLast: {
    borderBottom: 'none',
  },

  // Footer
  footerArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '24px',
  },

  // Signatures
  sigWrap: { display: 'flex', gap: '28px', alignItems: 'flex-end' },
  sigBox: { textAlign: 'center', width: '108px' },
  sigSpace: { height: '50px' },
  sigLine: { borderTop: `1.5px solid ${C.inkMid}`, marginBottom: '5px' },
  sigLabel: { fontSize: '10.5px', color: C.inkMid, fontWeight: 600, lineHeight: 1.4 },
  sigName: { fontWeight: 800, color: C.ink },

  // LUNAS stamp
  stampWrap: { marginBottom: '14px' },
  stamp: {
    display: 'inline-block',
    border: `2.5px solid ${C.gold}`,
    borderRadius: '6px',
    padding: '5px 13px',
    transform: 'rotate(-14deg)',
  },
  stampText: {
    fontSize: '20px',
    fontWeight: 900,
    color: C.gold,
    letterSpacing: '5px',
    textTransform: 'uppercase',
    lineHeight: 1,
    opacity: 0.88,
  },

  // Totals box
  totalsBox: {
    width: '256px',
    flexShrink: 0,
    border: `1.5px solid ${C.border}`,
    borderRadius: '10px',
    overflow: 'hidden',
  },
  totalsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '9px 15px',
    borderBottom: `1px solid ${C.border}`,
    fontSize: '12px',
  },
  totalsLabel: { color: C.inkLight },
  totalsVal: { fontWeight: 600, color: C.ink },
  totalsFinal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '11px 15px',
    background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
  },
  totalsFinalLabel: { color: C.white, fontSize: '14px', fontWeight: 800 },
  totalsFinalVal: { color: C.white, fontSize: '15px', fontWeight: 900 },

  // Note
  note: {
    marginTop: '26px',
    paddingTop: '14px',
    borderTop: `1.5px dashed ${C.border}`,
    textAlign: 'center',
    color: C.inkLight,
    fontSize: '10px',
    lineHeight: 1.7,
  },

  // Bottom-right corner decoration
  cornerTri: {
    position: 'absolute',
    bottom: 0, right: 0,
    width: '100px', height: '100px',
    background: `linear-gradient(135deg, transparent 50%, ${C.accentBg} 50%)`,
    pointerEvents: 'none',
  },
  cornerDot: {
    position: 'absolute',
    bottom: '13px', right: '13px',
    width: '7px', height: '7px',
    borderRadius: '50%',
    backgroundColor: C.accent,
    opacity: 0.35,
    pointerEvents: 'none',
  },
};

// ──────────────────────────────────────────────────────────────────────────

export const PreviewView = forwardRef<HTMLDivElement, PreviewViewProps>(({ data }, ref) => {
  const subtotal     = data.items.reduce((a, item) => a + (Number(item.qty) || 0) * (Number(item.price) || 0), 0);
  const discountRate = Number(data.discountRate) || 0;
  const taxRate      = Number(data.taxRate) || 0;
  const discountAmt  = subtotal * (discountRate / 100);
  const afterDisc    = subtotal - discountAmt;
  const taxAmt       = afterDisc * (taxRate / 100);
  const total        = afterDisc + taxAmt;

  const meta = [
    { label: 'Tanggal Transaksi',  value: formatDate(data.transactionDate) },
    { label: 'Nama Pelanggan',     value: data.customerName    || '—' },
    { label: 'Metode Pembayaran',  value: data.paymentMethod   || '—' },
    { label: 'Alamat Pelanggan',   value: data.customerAddress || '—' },
  ];

  return (
    <div ref={ref} style={S.page}>

      {/* ═══ HEADER ═══════════════════════════════════════════ */}
      <div style={S.header}>
        <div style={S.orb1} />
        <div style={S.orb2} />

        <div style={S.headerInner}>
          {/* Company side */}
          <div style={S.companyRow}>
            {data.logo && (
              <div style={S.logoBox}>
                <img src={data.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )}
            <div>
              <p style={S.companyName}>{data.companyName || 'Nama Perusahaan'}</p>
              <p style={S.companyMeta}>
                {[data.companyAddress, data.companyContact].filter(Boolean).join('  ·  ') || ' '}
              </p>
            </div>
          </div>

          {/* NOTA side */}
          <div style={S.notaBadge}>
            <p style={S.notaWord}>NOTA</p>
            <p style={S.notaNumLine}>
              No: <span style={S.notaNumVal}>{data.notaNumber || '—'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Accent stripe */}
      <div style={S.stripe} />

      {/* ═══ BODY ═════════════════════════════════════════════ */}
      <div style={S.body}>

        {/* Meta grid — 2×2 */}
        <div style={S.metaGrid}>
          {meta.map((m, i) => {
            const isBottom = i >= 2;
            const isRight  = i % 2 === 1;
            return (
              <div
                key={m.label}
                style={{
                  ...S.metaCell,
                  ...(isBottom ? { borderBottom: 'none' } : {}),
                  ...(isRight  ? { borderRight: 'none'  } : {}),
                }}
              >
                <div style={S.metaLabel}>{m.label}</div>
                <div style={S.metaValue}>{m.value}</div>
              </div>
            );
          })}
        </div>

        {/* Section label */}
        <div style={S.sectionLabel}>Rincian Barang / Jasa</div>

        {/* Items table */}
        <div style={S.tableWrap}>
          <table style={S.table}>
            <colgroup>
              <col style={{ width: '30px' }} />
              <col />
              <col style={{ width: '44px' }} />
              <col style={{ width: '64px' }} />
              <col style={{ width: '118px' }} />
              <col style={{ width: '118px' }} />
            </colgroup>
            <thead style={S.thead}>
              <tr>
                <th style={{ ...S.th, textAlign: 'center'  }}>#</th>
                <th style={{ ...S.th, textAlign: 'left'   }}>Nama Barang / Jasa</th>
                <th style={{ ...S.th, textAlign: 'center'  }}>Qty</th>
                <th style={{ ...S.th, textAlign: 'left'   }}>Satuan</th>
                <th style={{ ...S.th, textAlign: 'right'  }}>Harga Satuan</th>
                <th style={{ ...S.th, textAlign: 'right'  }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => {
                const qty       = Number(item.qty)   || 0;
                const price     = Number(item.price) || 0;
                const lineTotal = qty * price;
                const isLast    = i === data.items.length - 1;
                const rowBg     = i % 2 === 1 ? C.rowAlt : C.white;

                return (
                  <tr key={item.id} style={{ backgroundColor: rowBg }}>
                    <td style={{ ...S.td, ...(isLast ? S.tdLast : {}), textAlign: 'center', color: C.inkLight, fontSize: '11px', fontWeight: 600 }}>
                      {i + 1}
                    </td>
                    <td style={{ ...S.td, ...(isLast ? S.tdLast : {}), fontWeight: 600, color: C.ink }}>
                      {item.name || '—'}
                    </td>
                    <td style={{ ...S.td, ...(isLast ? S.tdLast : {}), textAlign: 'center', fontWeight: 600 }}>
                      {qty}
                    </td>
                    <td style={{ ...S.td, ...(isLast ? S.tdLast : {}), color: C.inkLight, fontSize: '11.5px' }}>
                      {item.unit || '—'}
                    </td>
                    <td style={{ ...S.td, ...(isLast ? S.tdLast : {}), textAlign: 'right', color: C.inkMid }}>
                      {formatRp(price)}
                    </td>
                    <td style={{ ...S.td, ...(isLast ? S.tdLast : {}), textAlign: 'right', fontWeight: 700, color: C.ink }}>
                      {formatRp(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ─ Footer: stamp+sigs left | totals right ─ */}
        <div style={S.footerArea}>

          {/* Left */}
          <div>
            <div style={S.stampWrap}>
              <div style={S.stamp}>
                <div style={S.stampText}>LUNAS</div>
              </div>
            </div>
            <div style={S.sigWrap}>
              <div style={S.sigBox}>
                <div style={S.sigSpace} />
                <div style={S.sigLine} />
                <div style={S.sigLabel}>Pelanggan</div>
              </div>
              <div style={S.sigBox}>
                <div style={S.sigSpace} />
                <div style={S.sigLine} />
                <div style={S.sigLabel}>
                  Kasir<br />
                  <span style={S.sigName}>{data.cashierName || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: totals */}
          <div style={S.totalsBox}>
            <div style={S.totalsRow}>
              <span style={S.totalsLabel}>Subtotal</span>
              <span style={S.totalsVal}>{formatRp(subtotal)}</span>
            </div>
            {discountRate > 0 && (
              <div style={S.totalsRow}>
                <span style={S.totalsLabel}>Diskon ({discountRate}%)</span>
                <span style={{ ...S.totalsVal, color: C.danger }}>− {formatRp(discountAmt)}</span>
              </div>
            )}
            {taxRate > 0 && (
              <div style={S.totalsRow}>
                <span style={S.totalsLabel}>Pajak ({taxRate}%)</span>
                <span style={S.totalsVal}>{formatRp(taxAmt)}</span>
              </div>
            )}
            <div style={S.totalsFinal}>
              <span style={S.totalsFinalLabel}>Total</span>
              <span style={S.totalsFinalVal}>{formatRp(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div style={S.note}>
          ✦&nbsp; Terima kasih atas kepercayaan Anda &nbsp;✦<br />
          Simpan nota ini sebagai bukti transaksi yang sah.&nbsp;&nbsp;Barang yang sudah dibeli tidak dapat dikembalikan.
        </div>
      </div>

      {/* Corner decoration */}
      <div style={S.cornerTri} />
      <div style={S.cornerDot} />
    </div>
  );
});

PreviewView.displayName = 'PreviewView';
