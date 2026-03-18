# 🚀 DocuMind AI – Mistral Native Document Intelligence

AI-powered document intelligence platform using **Mistral OCR + LLM extraction** to dynamically analyze and extract structured data from PDFs and images.

---

## ✨ Features

- 📄 PDF & Image Support (JPG, PNG)
- 🔍 Official Mistral OCR (`mistral-ocr-latest`)
- 🧠 Dynamic Field Extraction (No Hardcoding)
- 🏷 Automatic Document Type Detection
- 📊 Structured JSON Output
- 🎨 Premium SaaS UI
- ⚡ Production-ready Error Handling
- ☁ Deployable on Render

---

## 🧠 Architecture
Upload → Mistral OCR → Extract Text → Mistral Chat → Structured JSON

---

## 🏗 Tech Stack

- Node.js (ESM)
- Express.js
- Multer
- @mistralai/mistralai SDK
- TailwindCSS (UI)
- Mistral AI API

---

## 📦 Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/akshaivijayan/documind-mistral-native.git
cd Document_Extractor_Mistral
- Make sure to create a .env file and add the mistral api key (MISTRAL_API_KEY= )
