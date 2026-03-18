import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (container: HTMLElement, filename: string) => {
  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = 210;
    const pageH = 297;
    const margin = 10;
    const usableW = pageW - margin * 2;
    const imgH = (canvas.height * usableW) / canvas.width;

    if (imgH <= pageH - margin * 2) {
      pdf.addImage(imgData, 'PNG', margin, margin, usableW, imgH);
    } else {
      let yOffset = 0;
      const sliceH = pageH - margin * 2;
      while (yOffset < imgH) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, margin - yOffset, usableW, imgH);
        yOffset += sliceH;
      }
    }

    pdf.save(`${filename}.pdf`);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
