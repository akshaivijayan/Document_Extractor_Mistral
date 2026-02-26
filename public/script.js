const fileInput = document.getElementById("fileInput");
const uploadUI = document.getElementById("uploadUI");
const previewBox = document.getElementById("previewBox");
const pdfPreview = document.getElementById("pdfPreview");
const imagePreview = document.getElementById("imagePreview");
const scanLine = document.getElementById("scanLine");
const resultContainer = document.getElementById("resultContainer");
const loadingState = document.getElementById("loadingState");
const statusIndicator = document.getElementById("statusIndicator");

fileInput.addEventListener("change", handleUpload);

async function handleUpload() {

    const file = fileInput.files[0];
    if (!file) return;

    previewFile(file);

    scanLine.classList.remove("hidden");
    loadingState.classList.remove("hidden");
    resultContainer.innerHTML = "";
    statusIndicator.innerHTML = `<i class="fas fa-spinner fa-spin text-blue-600"></i>`;

    const formData = new FormData();
    formData.append("file", file);

    try {

        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!data.success) throw new Error(data.error);

        renderStructuredResult(data.ai_result);

        statusIndicator.innerHTML = `<i class="fas fa-check-circle text-green-500"></i>`;

    } catch (err) {

        statusIndicator.innerHTML = `<i class="fas fa-exclamation-circle text-red-500"></i>`;
        resultContainer.innerHTML = `<p class="text-red-500">${err.message}</p>`;

    } finally {

        scanLine.classList.add("hidden");
        loadingState.classList.add("hidden");
    }
}

function previewFile(file) {
    uploadUI.classList.add("hidden");
    previewBox.classList.remove("hidden");

    const url = URL.createObjectURL(file);

    if (file.type === "application/pdf") {
        pdfPreview.src = url;
        pdfPreview.classList.remove("hidden");
        imagePreview.classList.add("hidden");
    } else {
        imagePreview.src = url;
        imagePreview.classList.remove("hidden");
        pdfPreview.classList.add("hidden");
    }
}

function renderStructuredResult(result) {

    resultContainer.innerHTML = "";

    // Document Type
    resultContainer.innerHTML += `
        <div class="bg-slate-50 p-4 rounded-xl border">
            <p class="text-xs text-slate-400 font-bold">DOCUMENT TYPE</p>
            <p class="text-lg font-semibold">${result.document_type}</p>
        </div>
    `;

    // Confidence
    resultContainer.innerHTML += `
        <div class="bg-blue-50 p-4 rounded-xl border">
            <p class="text-xs text-slate-400 font-bold">CONFIDENCE</p>
            <p class="text-lg font-semibold text-blue-600">${result.confidence}</p>
        </div>
    `;

    // Dynamic Fields
    for (const key in result.extracted_fields) {
        resultContainer.innerHTML += `
            <div class="bg-white border p-4 rounded-xl shadow-sm flex justify-between items-center mt-2">
                <div>
                    <p class="text-xs text-slate-400 font-bold">${formatKey(key)}</p>
                    <p class="font-medium">${result.extracted_fields[key]}</p>
                </div>
                <button onclick="copyText('${result.extracted_fields[key]}')" 
                    class="text-slate-400 hover:text-blue-600">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `;
    }
}

function formatKey(key) {
    return key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

function copyText(text) {
    navigator.clipboard.writeText(text);
}