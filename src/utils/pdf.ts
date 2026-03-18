import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (container: HTMLElement, filename: string) => {
  try {
    // Save current scroll position
    const currentScrollY = window.scrollY;
    window.scrollTo(0, 0);
    
    // Wait for browser to apply scroll
    await new Promise(r => setTimeout(r, 50));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Restore scroll position
    window.scrollTo(0, currentScrollY);

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = 210;
    const pageH = 297;
    const margin = 10;
    const usableW = pageW - margin * 2;
    const imgH = (canvas.height * usableW) / canvas.width;

    if (imgH <= pageH - margin * 2) {
      pdf.addImage(imgData, 'JPEG', margin, margin, usableW, imgH);
    } else {
      let yOffset = 0;
      const sliceH = pageH - margin * 2;
      while (yOffset < imgH) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, margin - yOffset, usableW, imgH);
        yOffset += sliceH;
      }
    }

    pdf.save(`${filename}.pdf`);
    return true;
  } catch (err) {
    console.error('PDF Generation Error:', err);
    return false;
  }
};
