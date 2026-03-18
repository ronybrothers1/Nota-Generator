import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (container: HTMLElement, filename: string): Promise<boolean> => {
  try {
    // Temporarily force the element to have a known width for consistent rendering
    const originalStyle = container.getAttribute('style') || '';
    container.style.width = '794px';
    container.style.maxWidth = '794px';

    const canvas = await html2canvas(container, {
      scale: 2,           // 2x for retina-like quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      // Scroll to top so nothing is clipped
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
    });

    // Restore original style
    container.setAttribute('style', originalStyle);

    const imgData = canvas.toDataURL('image/jpeg', 0.97);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const marginMm = 8;
    const usableWidthMm = pageWidthMm - marginMm * 2;

    // Calculate rendered image height in mm
    const imgHeightMm = (canvas.height * usableWidthMm) / canvas.width;

    if (imgHeightMm <= pageHeightMm - marginMm * 2) {
      // Single page
      pdf.addImage(imgData, 'JPEG', marginMm, marginMm, usableWidthMm, imgHeightMm);
    } else {
      // Multi-page: slice the canvas image
      const usableHeightMm = pageHeightMm - marginMm * 2;
      const canvasWidthPx = canvas.width;
      const canvasHeightPx = canvas.height;

      // How many canvas pixels correspond to one usable page height
      const pageHeightPx = Math.floor((usableHeightMm / imgHeightMm) * canvasHeightPx);

      let yOffsetPx = 0;
      let pageIndex = 0;

      while (yOffsetPx < canvasHeightPx) {
        const sliceHeightPx = Math.min(pageHeightPx, canvasHeightPx - yOffsetPx);

        // Create a temporary canvas for this slice
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvasWidthPx;
        sliceCanvas.height = sliceHeightPx;
        const ctx = sliceCanvas.getContext('2d');
        if (!ctx) break;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidthPx, sliceHeightPx);
        ctx.drawImage(canvas, 0, -yOffsetPx);

        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.97);
        const sliceHeightMm = (sliceHeightPx / canvasHeightPx) * imgHeightMm;

        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(sliceData, 'JPEG', marginMm, marginMm, usableWidthMm, sliceHeightMm);

        yOffsetPx += sliceHeightPx;
        pageIndex++;
      }
    }

    pdf.save(`${sanitizeFilename(filename)}.pdf`);
    return true;
  } catch (err) {
    console.error('[generatePDF] Error:', err);
    return false;
  }
};

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9\-_]/g, '_').replace(/_+/g, '_').slice(0, 100) || 'nota';
}
