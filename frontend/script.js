let baseResponse = "";
let severityLevel = "";
let uploadedReportExplanation = "";

const API_BASE = "http://127.0.0.1:8000";

/* ----------- Analyze Symptoms ----------- */
async function analyze() {
    const symptoms = document.getElementById("symptoms").value;
    if (!symptoms) return alert("Please enter symptoms.");

    try {
        const res = await fetch(`${API_BASE}/analyze`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ symptoms })
        });

        const data = await res.json();
        baseResponse = data.response;
        severityLevel = data.severity_level;

        const badge = document.getElementById("severityBadge");
        badge.innerText = `Severity: ${severityLevel}`;
        badge.className = `badge ${severityLevel.toLowerCase()}`;

        document.getElementById("analysisResponse").innerText = baseResponse;
        document.getElementById("analysisResult").style.display = "block";
        document.getElementById("chatSection").style.display = "block";
    } catch (err) {
        console.error("Error analyzing symptoms:", err);
    }
}

/* ----------- Follow-up Chat ----------- */
async function sendFollowUp() {
    const input = document.getElementById("followupInput");
    const question = input.value;
    if (!question) return;

    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += `<div class="msg-user">You: ${question}</div>`;
    input.value = "";

    const res = await fetch(`${API_BASE}/followup`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            base_response: baseResponse,
            severity_level: severityLevel,
            user_question: question
        })
    });

    const data = await res.json();
    chatBox.innerHTML += `<div class="msg-bot"><b>Assistant:</b> ${data.answer}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

/* ----------- Download Symptom Report ----------- */
async function downloadReport() {
    const symptoms = document.getElementById("symptoms").value;

    const res = await fetch("http://127.0.0.1:8000/download-report", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ symptoms })
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "health_report.pdf";
    a.click();
}

/* ----------- Upload Medical Report ----------- */
async function uploadReport() {
    const fileInput = document.getElementById("reportFile");
    const file = fileInput.files[0];
    if (!file) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/explain-report`, {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    uploadedReportExplanation = data.explanation;
    document.getElementById("reportExplanation").innerText = data.explanation;
    document.getElementById("reportResult").style.display = "block";
}

/* ----------- Download Explained Report ----------- */
async function downloadExplainedReport() {
    const res = await fetch("http://127.0.0.1:8000/download-explained-report", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ explanation: uploadedReportExplanation })
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "medical_report_explanation.pdf";
    a.click();
}