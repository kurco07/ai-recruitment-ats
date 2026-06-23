import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generateOfferPdf({
  candidateName,
  candidateEmail,
  jobTitle,
  salaryOffered,
  startDate,
  companyName = "TalentAI",
}) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([612, 842]);
  const { width, height } = page.getSize();
  const margin = 60;

  function text(txt, x, y, opts = {}) {
    const f = opts.bold ? bold : font;
    const size = opts.size || 11;
    const color = opts.color || rgb(0.1, 0.1, 0.1);
    page.drawText(txt, { x, y, size, font: f, color });
    return y - (size + 4);
  }

  function line(y) {
    page.drawLine({
      start: { x: margin, y },
      end: { x: width - margin, y },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
  }

  function wrapText(txt, x, y, maxWidth, opts = {}) {
    const f = opts.bold ? bold : font;
    const size = opts.size || 10;
    const color = opts.color || rgb(0.2, 0.2, 0.2);
    const words = txt.split(" ");
    let lineText = "";
    for (const word of words) {
      const testLine = lineText ? lineText + " " + word : word;
      const tw = f.widthOfTextAtSize(testLine, size);
      if (tw > maxWidth && lineText) {
        page.drawText(lineText, { x, y, size, font: f, color });
        y -= size + 4;
        lineText = word;
      } else {
        lineText = testLine;
      }
    }
    if (lineText) {
      page.drawText(lineText, { x, y, size, font: f, color });
      y -= size + 4;
    }
    return y;
  }

  let y = height - margin;

  y = text("CONTRATO DE TRABAJO", margin, y, { bold: true, size: 20 });
  y -= 6;
  y = text(`Entre ${companyName} y ${candidateName}`, margin, y, { size: 12, color: rgb(0.4, 0.4, 0.4) });
  line(y -= 8);
  y -= 12;

  y = text("1. PARTES", margin, y, { bold: true, size: 13 });
  y = text(`- ${companyName}, en adelante "La Empresa".`, margin, y);
  y = text(`- ${candidateName}, en adelante "El Candidato".`, margin, y);
  y -= 8;

  y = text("2. OBJETO DEL CONTRATO", margin, y, { bold: true, size: 13 });
  y = text(`La Empresa contrata al Candidato para ocupar el puesto de ${jobTitle}.`, margin, y);
  const startDateStr = startDate || "[Fecha de inicio por definir]";
  y = text(`La fecha de inicio estimada es: ${startDateStr}.`, margin, y);
  y -= 8;

  y = text("3. REMUNERACIÓN", margin, y, { bold: true, size: 13 });
  const salaryStr = salaryOffered
    ? `$${Number(salaryOffered).toLocaleString("es-US")} anuales`
    : "[Salario por definir]";
  y = text(`La remuneración ofrecida es de ${salaryStr}.`, margin, y);
  y -= 8;

  y = text("4. JORNADA LABORAL", margin, y, { bold: true, size: 13 });
  y = text("La jornada laboral será de tiempo completo, de lunes a viernes.", margin, y);
  y = text("El horario específico será acordado entre ambas partes.", margin, y);
  y -= 8;

  y = text("5. LUGAR DE TRABAJO", margin, y, { bold: true, size: 13 });
  y = text("El lugar de trabajo será definido por La Empresa, pudiendo ser presencial, remoto o híbrido.", margin, y);
  y -= 8;

  y = text("6. PERÍODO DE PRUEBA", margin, y, { bold: true, size: 13 });
  y = text("Se establece un período de prueba de 3 meses, durante el cual cualquiera de las partes", margin, y);
  y = text("podrá rescindir el contrato sin previo aviso.", margin, y);
  y -= 8;

  y = text("7. CONFIDENCIALIDAD", margin, y, { bold: true, size: 13 });
  y = wrapText(
    "El Candidato se compromete a mantener la más estricta confidencialidad sobre toda la información, datos y documentación de La Empresa a la que tenga acceso durante la relación laboral.",
    margin, y, width - margin * 2
  );
  y -= 8;

  y = text("8. PROPIEDAD INTELECTUAL", margin, y, { bold: true, size: 13 });
  y = wrapText(
    "Todos los trabajos, inventos, desarrollos y creaciones realizados por El Candidato durante su relación laboral serán propiedad exclusiva de La Empresa.",
    margin, y, width - margin * 2
  );
  y -= 8;

  y = text("9. PROTECCIÓN DE DATOS", margin, y, { bold: true, size: 13 });
  y = wrapText(
    "Ambas partes se comprometen a cumplir con la normativa vigente de protección de datos personales.",
    margin, y, width - margin * 2
  );
  y -= 8;

  if (y < 200) {
    page = doc.addPage([612, 842]);
    y = height - margin;
  }

  y = text("10. FIRMAS", margin, y, { bold: true, size: 13 });
  y -= 20;

  line(y);
  y -= 6;
  y = text(`Firma de La Empresa: ${companyName}`, margin, y, { size: 11, color: rgb(0.3, 0.3, 0.3) });
  y -= 30;

  line(y);
  y -= 6;
  y = text(`Firma del Candidato: ${candidateName}`, margin, y, { size: 11, color: rgb(0.3, 0.3, 0.3) });
  y -= 30;

  const today = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  line(y);
  y -= 6;
  y = text(`Fecha: ${today}`, margin, y, { size: 11, color: rgb(0.3, 0.3, 0.3) });

  const pdfBytes = await doc.save();
  return pdfBytes;
}
