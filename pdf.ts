import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures an HTML element and exports it as a crisp, properly-scaled A4 PDF.
 *
 * Strategy:
 *  1. Temporarily pin the element to 794 px wide in the DOM so html2canvas
 *     always gets a consistent layout regardless of the viewport.
 *  2. Render at 2× scale for retina-quality output.
 *  3. Map the canvas to mm and place on A4 page(s) with equal margins.
 *  4. For tall content, slice the canvas and add extra pages cleanly.
 */
export const generatePDF = async (
  container: HTMLElement,
  filename: string
): Promise<boolean> => {
  // ── 1. Snapshot the element's original inline style ──────────────────────
  const prevStyle = {
    width:     container.style.width,
    minWidth:  container.style.minWidth,
    maxWidth:  container.style.maxWidth,
    position:  container.style.position,
    left:      container.style.left,
    top:       container.style.top,
  };

  // Force a known render width so html2canvas measures the layout correctly.
  // 794 px ≈ A4 at 96 dpi (210 mm × 3.7795 px/mm).
  container.style.width    = '794px';
  container.style.minWidth = '794px';
  container.style.maxWidth = '794px';

  // Small yield so the browser can reflow
  await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(container, {
      scale:           2,          // 2× → ~192 dpi equivalent
      useCORS:         true,
      allowTaint:      true,
      backgroundColor: '#ffffff',
      logging:         false,
      // Render from the element's own origin, ignoring page scroll
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      windowWidth:  794,
      // Give html2canvas the exact pixel width to avoid off-by-one rounding
      width:  container.offsetWidth,
      height: container.offsetHeight,
    });
  } finally {
    // ── 2. Restore original style (always, even if capture fails) ───────────
    container.style.width    = prevStyle.width;
    container.style.minWidth = prevStyle.minWidth;
    container.style.maxWidth = prevStyle.maxWidth;
    container.style.position = prevStyle.position;
    container.style.left     = prevStyle.left;
    container.style.top      = prevStyle.top;
  }

  try {
    // ── 3. Build the PDF ────────────────────────────────────────────────────
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

    const PAGE_W_MM  = 210;
    const PAGE_H_MM  = 297;
    const MARGIN_MM  = 8;
    const USABLE_W   = PAGE_W_MM - MARGIN_MM * 2;   // 194 mm
    const USABLE_H   = PAGE_H_MM - MARGIN_MM * 2;   // 281 mm

    // Scale factor: how many mm per canvas pixel
    const mmPerPx = USABLE_W / canvas.width;

    // Total rendered height in mm
    const totalH_MM = canvas.height * mmPerPx;

    if (totalH_MM <= USABLE_H) {
      // ─ Single page ────────────────────────────────────────────────────────
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.96),
        'JPEG',
        MARGIN_MM,
        MARGIN_MM,
        USABLE_W,
        totalH_MM,
      );
    } else {
      // ─ Multi-page: slice the canvas row by row ─────────────────────────
      // How many canvas pixels fit into one usable page height
      const pageH_Px = Math.floor(USABLE_H / mmPerPx);

      let yPx    = 0;
      let pageNo = 0;

      while (yPx < canvas.height) {
        const sliceH_Px = Math.min(pageH_Px, canvas.height - yPx);

        const slice    = document.createElement('canvas');
        slice.width    = canvas.width;
        slice.height   = sliceH_Px;
        const ctx      = slice.getContext('2d')!;
        ctx.fillStyle  = '#ffffff';
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, -yPx);

        const sliceH_MM = sliceH_Px * mmPerPx;

        if (pageNo > 0) pdf.addPage();
        pdf.addImage(
          slice.toDataURL('image/jpeg', 0.96),
          'JPEG',
          MARGIN_MM,
          MARGIN_MM,
          USABLE_W,
          sliceH_MM,
        );

        yPx    += sliceH_Px;
        pageNo += 1;
      }
    }

    pdf.save(`${sanitize(filename)}.pdf`);
    return true;

  } catch (err) {
    console.error('[generatePDF]', err);
    return false;
  }
};

function sanitize(name: string): string {
  return (name || 'nota')
    .replace(/[^a-zA-Z0-9\-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80) || 'nota';
}
