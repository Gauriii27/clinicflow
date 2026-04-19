import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import signatureImg from '../assets/signature.png';

export const generatePrescriptionPDF = (prescription, patient) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // --- HEADER SECTION ---
  
  // Motto: || SHREE DHANWANTARI KRUPA ||
  doc.setFont('times', 'bolditalic');
  doc.setDrawColor(21, 128, 61); // Teal color matching theme
  doc.setFontSize(10);
  doc.setTextColor(21, 128, 61);
  doc.text('|| SHREE DHANWANTARI KRUPA ||', pageWidth / 2, 12, { align: 'center' });
  
  // Mobile Numbers (Top Right)
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Mob.: 9987045719', pageWidth - 15, 12, { align: 'right' });
  doc.text('9987045722', pageWidth - 15, 16, { align: 'right' });

  // Doctor Name (Bold & Large)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(30, 60, 120); // Deep Royal Blue for name
  doc.text('Dr. Eknath Hanumant Yewale', pageWidth / 2, 30, { align: 'center' });

  // Specialization & Reg No
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('B.A.M.S. (Mumbai), P.G.D.L.M.S. (Mumbai).', pageWidth / 2, 38, { align: 'center' });
  doc.text('Reg. No. I-38260-A-1', pageWidth / 2, 44, { align: 'center' });

  // Double Divider Line (Top of Address)
  doc.setDrawColor(120, 100, 70);
  doc.setLineWidth(0.5);
  doc.line(15, 52, pageWidth - 15, 52);

  // Address Row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Dhanwantari Clinic, P.R. Kadam Marg, Asalpha Village, Ghatkopar (W), Mumbai-400084', pageWidth / 2, 58, { align: 'center' });

  // Double Divider Line (Bottom of Address)
  doc.line(15, 62, pageWidth - 15, 62);

  // --- PATIENT INFO SECTION ---
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Date:', pageWidth - 45, 75);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('en-IN'), pageWidth - 32, 75);

  doc.setFont('helvetica', 'bold');
  doc.text('Patient Name:', 15, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(`${patient.first_name || 'Rahul'} ${patient.last_name || 'Unknown'}`, 45, 85);

  doc.setFont('helvetica', 'bold');
  doc.text('Age / Sex:', 15, 93);
  doc.setFont('helvetica', 'normal');
  doc.text(`${calculateAge(patient.date_of_birth)} / ${patient.gender?.toUpperCase() || '--'}`, 45, 93);

  doc.setFont('helvetica', 'bold');
  doc.text('Diagnosis:', 15, 101);
  doc.setFont('helvetica', 'normal');
  doc.text(prescription.diagnosis || 'General Checkup', 45, 101);

  // Rx Symbol
  doc.setFont('times', 'italic');
  doc.setFontSize(22);
  doc.text('Rx', 15, 115);

  // --- MEDICATIONS TABLE ---
  
  const tableRows = (prescription.medications || []).map((med, index) => [
    index + 1,
    med.medicine_name || med.name,
    med.dosage,
    med.frequency,
    med.duration
  ]);

  autoTable(doc, {
    startY: 120,
    head: [['#', 'Medicine Name', 'Dosage', 'Frequency', 'Duration']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [21, 128, 61], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 'auto', fontStyle: 'bold' }
    }
  });

  // --- FOOTER SECTION ---
  const finalY = (doc).lastAutoTable?.finalY || 150;

  if (prescription.instructions) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Physician Advice:', 15, finalY + 15);
    doc.setFont('helvetica', 'normal');
    const splitInstructions = doc.splitTextToSize(prescription.instructions, pageWidth - 30);
    doc.text(splitInstructions, 15, finalY + 22);
  }

  // Signature Area
  const signatureY = Math.max(finalY + 40, 250); // Keep it towards the bottom if possible
  
  try {
    if (signatureImg) {
      doc.addImage(signatureImg, 'PNG', pageWidth - 60, signatureY - 20, 40, 15);
    }
  } catch (err) {
    console.error('Signature skip:', err);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Doctor\'s Signature', pageWidth - 15, signatureY, { align: 'right' });
  doc.setLineWidth(0.2);
  doc.line(pageWidth - 65, signatureY - 5, pageWidth - 15, signatureY - 5);

  return doc;
};

// Helper to calculate age precisely
const calculateAge = (dob) => {
  if (!dob) return '--';
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? `${age} Yrs` : 'Child';
  } catch (e) {
    return '--';
  }
};

export const shareViaWhatsApp = (prescription, patient) => {
  const patientName = patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() : 'Patient';
  const medsSummary = (prescription.medications || [])
    .map(m => `• ${m.medicine_name || m.name}: ${m.dosage} (${m.frequency})`)
    .join('%0A');
    
  const message = `*Dhanwantari Clinic - Digital Script*%0A%0A*Patient:* ${patientName}%0A*Date:* ${new Date().toLocaleDateString()}%0A%0A*Rx Medications:*%0A${medsSummary}%0A%0A*Advisory:* ${prescription.instructions || 'Follow as directed'}%0A%0A_Generated via ClinicFlow Digital Portal_`;
  
  const phone = patient?.phone ? patient.phone.replace(/\D/g, '') : '';
  // Check for Indian number format
  const formattedPhone = phone.length === 10 ? '91' + phone : phone;
  const url = `https://wa.me/${formattedPhone}?text=${message}`;
  window.open(url, '_blank');
};
