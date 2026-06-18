export async function extractTextFromPdf(buffer) {
  const PDFParser = (await import("pdf2json")).default;

  return new Promise((resolve, reject) => {
    const parser = new PDFParser(null, 1);

    parser.on("pdfParser_dataReady", (data) => {
      try {
        const text = parser.getRawTextContent();
        resolve(text);
      } catch (err) {
        reject(err);
      }
    });

    parser.on("pdfParser_dataError", (err) => {
      reject(new Error(err.parserError || "Error al parsear PDF"));
    });

    parser.parseBuffer(buffer);
  });
}
