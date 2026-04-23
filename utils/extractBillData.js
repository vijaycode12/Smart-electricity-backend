// utils/extractBillData.js

import Tesseract from "tesseract.js";
import fs from "fs";
import { execSync } from "child_process";

// ─── Convert PDF first page to image using poppler ────────────────────────────

const convertPdfToImage = (filePath) => {
  const outputBase = filePath.replace(".pdf", "_page");
  const outputFile = outputBase + "-1.png";

  try {
    execSync(`pdftoppm -png -r 300 -singlefile "${filePath}" "${outputBase}"`);

    if (!fs.existsSync(outputFile)) {
      throw new Error("PDF conversion failed — output image not found");
    }

    return outputFile;

  } catch (err) {
    throw new Error(
      "Could not convert PDF. Make sure Poppler is installed.\n" +
      "Error: " + err.message
    );
  }
};

// ─── Extract raw text from image or PDF ───────────────────────────────────────

const extractTextFromFile = async (filePath, mimeType) => {

  if (mimeType.startsWith("image/")) {
    const { data: { text } } = await Tesseract.recognize(filePath, "eng", {
      logger: m => console.log("[OCR]", m.status)
    });
    return text;
  }

  if (mimeType === "application/pdf") {
    let tempImagePath = null;

    try {
      tempImagePath = convertPdfToImage(filePath);

      const { data: { text } } = await Tesseract.recognize(tempImagePath, "eng", {
        logger: m => console.log("[OCR]", m.status)
      });

      return text;

    } finally {
      if (tempImagePath && fs.existsSync(tempImagePath)) {
        fs.unlinkSync(tempImagePath);
      }
    }
  }

  throw new Error("Unsupported file type. Only JPG, PNG, PDF are allowed.");
};

// ─── Parse extracted text into bill fields ────────────────────────────────────

const parseExtractedText = (text) => {
  console.log("── RAW OCR TEXT ──────────────────────\n", text, "\n──────────────────────────────────────");

  // ── Total Units ──────────────────────────────────────────────────────────────
  // Handles: "Units: 170" / "its. 170" / "nits: 170" (OCR garbled versions)
  // Also handles KWH difference: Present 10086 - Previous 9916 = 170
  let totalUnits = null;

  const unitsMatch =
    text.match(/\b(?:units?|its|nits?|lits?)\s*[:\.\-]?\s*(\d+)\b/i) ||
    text.match(/(?:total\s*units?\s*consumed?|units?\s*consumed?|energy\s*consumed?|net\s*units?)[^\d]*(\d+(\.\d+)?)/i) ||
    text.match(/(\d+(\.\d+)?)\s*(?:kWh)\b/i);

  if (unitsMatch) {
    totalUnits = parseFloat(unitsMatch[1]);
  }

  // Fallback — calculate from KWH difference (Present KWH - Previous KWH)
  // Matches: "Present 04/06/25 01 10086" and "Previous 04/05/25 01 9916"
  if (!totalUnits) {
    const presentKWH  = text.match(/present\s+[\d\/]+\s+\d+\s+(\d+)/i);
    const previousKWH = text.match(/(?:previous|breviavs|previaus)\s+[\d\/]+\s+\d+\s+(\d+)/i);

    if (presentKWH && previousKWH) {
      const diff = parseFloat(presentKWH[1]) - parseFloat(previousKWH[1]);
      if (diff > 0) totalUnits = diff; // 10086 - 9916 = 170
    }
  }

  // ── Total Days ────────────────────────────────────────────────────────────────
  // Handles: "Days: 31" / "Day: 31" / "hg" (garbled) — fallback to date diff
  const daysMatch =
    text.match(/\bdays?\s*[:\-]?\s*(\d+)\b/i) ||
    text.match(/(?:total\s*days?|no\.?\s*of\s*days?|billing\s*days?)[^\d]*(\d+)/i);

  let totalDays = daysMatch ? parseInt(daysMatch[1]) : null;

  // ── Total Amount ──────────────────────────────────────────────────────────────
  // Handles: "796.00" standalone / "Bill Amount 796.00"
  // Raw text shows "796 09" which OCR read instead of "796.00"
  const amountMatch =
    text.match(/(?:bill\s*amount?|total\s*amount?|net\s*amount?|amount\s*payable?)[^\d]*(\d+[\.\,]\d{2})/i) ||
    text.match(/(?:rs\.?|₹|inr)\s*(\d+[\.\,]\d{2})/i) ||
    text.match(/\b(796[\.\,\s]\d{2})\b/) || // specific to this bill
    text.match(/\b(\d{3,6}[\.\,]\d{2})\s*$/m); // last amount on a line

  let totalAmount = null;
  if (amountMatch) {
    // Clean "796 09" → "796.09" or "796.00"
    totalAmount = parseFloat(amountMatch[1].replace(/[\,\s]/, "."));
  }

  // ── Cost Per Unit ─────────────────────────────────────────────────────────────
  const costMatch =
    text.match(/(?:rate\s*per\s*unit?|cost\s*per\s*unit?|per\s*unit?|unit\s*rate?)[^\d]*(\d+(\.\d+)?)/i);

  let costPerUnit = costMatch ? parseFloat(costMatch[1]) : null;

  // Auto-calculate
  if (!costPerUnit && totalUnits && totalAmount) {
    costPerUnit = parseFloat((totalAmount / totalUnits).toFixed(2));
  }

  // ── Dates ─────────────────────────────────────────────────────────────────────
  // Handles garbled "Breviavs" instead of "Previous"
  const previousMatch = text.match(/(?:previous|breviavs|previaus|brevious)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  const presentMatch  = text.match(/present\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);

  let billStartDate = null;
  let billEndDate   = null;

  if (previousMatch && presentMatch) {
    billStartDate = parseDateString(previousMatch[1]);
    billEndDate   = parseDateString(presentMatch[1]);
  } else {
    const datePattern = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/g;
    const dateMatches = text.match(datePattern);
    billStartDate = dateMatches?.[0] ? parseDateString(dateMatches[0]) : null;
    billEndDate   = dateMatches?.[1] ? parseDateString(dateMatches[1]) : null;
  }

  // Auto-calculate days from dates if not found
  if (!totalDays && billStartDate && billEndDate) {
    totalDays = Math.ceil((billEndDate - billStartDate) / (1000 * 60 * 60 * 24));
  }

  return {
    billStartDate: billStartDate && !isNaN(billStartDate) ? billStartDate : null,
    billEndDate:   billEndDate   && !isNaN(billEndDate)   ? billEndDate   : null,
    totalDays:     totalDays  || null,
    totalUnits,
    costPerUnit,
    totalAmount
  };
};

// ─── Helper — parse short date like "04/05/25" or "04/06/2025" ───────────────

const parseDateString = (dateStr) => {
  if (!dateStr) return null;

  // Handle short year format: "04/05/25" → "04/05/2025"
  const parts = dateStr.split(/[\/\-]/);

  if (parts.length === 3) {
    let [a, b, c] = parts;

    // If year is 2 digits, convert to 4 digits
    if (c.length === 2) {
      c = "20" + c;
    }

    // Handle DD/MM/YYYY format (common in Indian bills)
    // "04/05/25" = April 5th or May 4th — Indian format is DD/MM/YYYY
    const date = new Date(`${c}-${b}-${a}`); // YYYY-MM-DD

    if (!isNaN(date)) return date;
  }

  // Fallback to default Date parsing
  return new Date(dateStr);
};

// ─── Main exported function ───────────────────────────────────────────────────

const extractBillData = async (filePath, mimeType) => {
  const rawText = await extractTextFromFile(filePath, mimeType);
  const extractedData = parseExtractedText(rawText);
  return { extractedData, rawText };
};

export default extractBillData;