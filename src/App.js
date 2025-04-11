import React, { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

export default function PdfEditor() {
  const [pdfFile, setPdfFile] = useState(null);
  const [editedPdfUrl, setEditedPdfUrl] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [code, setCode] = useState("SQU");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => {
        const uint8Array = new Uint8Array(reader.result);
        setPdfFile(uint8Array);
        setEditedPdfUrl(URL.createObjectURL(new Blob([uint8Array], { type: "application/pdf" })));
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const addTextToPdf = async () => {
    if (!pdfFile) return;

    const pdfDoc = await PDFDocument.load(pdfFile);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      page.drawText(`${quantity} ${code} - HS`, {
        x: width - 100,
        y: height - 160,
        size: 10,
        font,
        color: rgb(1, 0, 0),
      });
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setEditedPdfUrl(url);
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Cetak Resi Costume</h1>

      <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-4" />

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="flex flex-col">
          <label htmlFor="quantity" className="text-sm mb-1 font-bold">Jumlah:</label>
          <input
            id="quantity"
            type="number"
            value={quantity}
            min="1"
            onChange={(e) => setQuantity(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="code" className="text-sm mb-1 font-bold">Kode Produk:</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="px-2 py-1 border rounded"
          />
        </div>
      </div>

      <button
        onClick={addTextToPdf}
        className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 mt-2"
      >
        Cetak Resi
      </button>

      {editedPdfUrl && (
        <>
          <a
            href={editedPdfUrl}
            download="edited.pdf"
            className="mt-4 text-blue-600 underline"
          >
            Download PDF yang sudah diedit
          </a>

          <div className="w-full h-[600px] mt-6 border shadow-lg">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer fileUrl={editedPdfUrl} />
            </Worker>
          </div>
        </>
      )}
    </div>
  );
}
