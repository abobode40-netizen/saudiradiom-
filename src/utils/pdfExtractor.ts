/**
 * PDF Extractor and Local Storage Manager for Rafiq Al-Thanawiya
 * Handles extracting text, metadata, and pages from uploaded PDF books
 * and persisting them reliably in IndexedDB for offline access.
 */

export interface ExtractedPdfData {
  fileName: string;
  fileSizeFormatted: string;
  pageCount: number;
  extractedText: string;
  objectUrl: string;
  previewPages: { pageNumber: number; textSnippet: string }[];
}

/**
 * Extracts text and metadata from a user-uploaded PDF file
 */
export async function extractPdfContent(file: File): Promise<ExtractedPdfData> {
  const objectUrl = URL.createObjectURL(file);
  const arrayBuffer = await file.arrayBuffer();

  const fileSizeFormatted =
    file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} ميجابايت`
      : `${Math.round(file.size / 1024)} كيلوبايت`;

  let pageCount = 1;
  let fullText = "";
  const previewPages: { pageNumber: number; textSnippet: string }[] = [];

  try {
    // Dynamically import pdfjs-dist so it does not block initial load
    const pdfjsLib = await import("pdfjs-dist");

    if (typeof window !== "undefined") {
      try {
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "3.11.174"}/pdf.worker.min.js`;
        }
      } catch (e) {
        console.warn("Could not set PDF.js workerSrc CDN:", e);
      }
    }

    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
    });
    const pdfDoc = await loadingTask.promise;
    pageCount = pdfDoc.numPages;

    // Extract text from up to 80 pages to provide full rich context for NotebookLM & AI summarization
    const pagesToScan = Math.min(pageCount, 80);

    for (let i = 1; i <= pagesToScan; i++) {
      try {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || "")
          .join(" ")
          .trim();

        if (pageText) {
          fullText += `\n--- [صفحة ${i}] ---\n` + pageText;
          if (previewPages.length < 10) {
            previewPages.push({
              pageNumber: i,
              textSnippet: pageText.slice(0, 200) + (pageText.length > 200 ? "..." : ""),
            });
          }
        }
      } catch (pageErr) {
        console.warn(`Error extracting text from page ${i}:`, pageErr);
      }
    }
  } catch (err) {
    console.warn("PDF.js text parsing encountered an issue (e.g. scanned image PDF):", err);
    // Fallback: file is still accessible via objectUrl
    fullText = `تم إدراج ملف الكتاب (${file.name}) بنجاح. المحتوى الرقمي متاح للمطالعة والتوليد الذكي.`;
    previewPages.push({
      pageNumber: 1,
      textSnippet: `كتاب PDF: ${file.name} - الحجم: ${fileSizeFormatted}`,
    });
  }

  return {
    fileName: file.name,
    fileSizeFormatted,
    pageCount: Math.max(1, pageCount),
    extractedText: fullText.trim(),
    objectUrl,
    previewPages,
  };
}

// Simple IndexedDB wrapper to store uploaded user PDFs persistently
const DB_NAME = "rafiq_external_books_db";
const STORE_NAME = "uploaded_pdf_books";

function openBooksDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveUploadedPdfBook(book: any, file?: File): Promise<void> {
  try {
    const db = await openBooksDB();
    let fileBlob: Blob | undefined = undefined;
    if (file) {
      fileBlob = file;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const record = {
        ...book,
        fileBlob,
        savedAt: new Date().toISOString(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Could not save PDF to IndexedDB, fallback to localStorage meta:", err);
    try {
      const savedList = JSON.parse(localStorage.getItem("rafiq_custom_books_meta") || "[]");
      const updated = [book, ...savedList.filter((b: any) => b.id !== book.id)];
      localStorage.setItem("rafiq_custom_books_meta", JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}

export async function loadSavedPdfBooks(): Promise<any[]> {
  try {
    const db = await openBooksDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const records = req.result || [];
        const reconstructed = records.map((rec: any) => {
          let pdfUrl = rec.pdfUrl;
          if (rec.fileBlob && typeof window !== "undefined") {
            try {
              pdfUrl = URL.createObjectURL(rec.fileBlob);
            } catch {
              // ignore
            }
          }
          return {
            ...rec,
            pdfUrl,
          };
        });
        resolve(reconstructed);
      };
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    try {
      return JSON.parse(localStorage.getItem("rafiq_custom_books_meta") || "[]");
    } catch {
      return [];
    }
  }
}

export async function deleteSavedPdfBook(bookId: string): Promise<void> {
  try {
    const db = await openBooksDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(bookId);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    try {
      const savedList = JSON.parse(localStorage.getItem("rafiq_custom_books_meta") || "[]");
      const updated = savedList.filter((b: any) => b.id !== bookId);
      localStorage.setItem("rafiq_custom_books_meta", JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
}
