import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Mistral } from "@mistralai/mistralai";

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 25 * 1024 * 1024 }
});

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");


const client = new Mistral(process.env.MISTRAL_API_KEY);

function safeDelete(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch {}
}

app.post("/upload", upload.single("file"), async (req, res) => {

    let filePath;

    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "No file uploaded."
            });
        }

        filePath = req.file.path;

        // -------------------------------
        // STEP 1: Upload for OCR
        // -------------------------------
        const fileBuffer = fs.readFileSync(filePath);

        const uploadedFile = await client.files.upload({
            file: {
                fileName: req.file.originalname,
                content: fileBuffer
            },
            purpose: "ocr"
        });

        // -------------------------------
        // STEP 2: OCR PROCESSING
        // -------------------------------
        const ocrResponse = await client.ocr.process({
            model: "mistral-ocr-latest",
            document: {
                type: "file",
                fileId: uploadedFile.id
            }
        });

        // Extract text from pages
        let fullText = "";

        if (ocrResponse.pages && ocrResponse.pages.length > 0) {
            ocrResponse.pages.forEach(page => {
                if (page.markdown) {
                    fullText += page.markdown + "\n\n";
                } else if (page.text) {
                    fullText += page.text + "\n\n";
                }
            });
        }

        if (!fullText.trim()) {
            safeDelete(filePath);
            return res.status(400).json({
                success: false,
                error: "No readable text found in document."
            });
        }

        // -------------------------------
        // STEP 3: AI STRUCTURED EXTRACTION
        // -------------------------------
        const chatResponse = await client.chat.complete({
            model: "mistral-small-latest",
            messages: [
                {
                    role: "system",
                    content: `
You are an intelligent document analysis AI.

1. Identify document type.
2. Extract important structured fields dynamically.
3. Return ONLY valid JSON.
4. No explanations.

Format:
{
  "document_type": "",
  "confidence": "",
  "extracted_fields": {}
}
`
                },
                {
                    role: "user",
                    content: fullText
                }
            ],
            temperature: 0.1
        });

        let structured = chatResponse.choices[0].message.content;

        structured = structured.replace(/```json|```/g, "").trim();
        structured = JSON.parse(structured);

        safeDelete(filePath);

        return res.json({
            success: true,
            ai_result: structured
        });

    } catch (error) {

        console.error("Processing Error:", error);

        if (filePath) safeDelete(filePath);

        return res.status(500).json({
            success: false,
            error: error.message || "Document processing failed."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});