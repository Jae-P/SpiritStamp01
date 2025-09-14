// Navigation
document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.target;
      document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
      document.getElementById(target).classList.add("active");
    });
  });
  
  // Utilities
  function generateTicketID() {
    return "SPIRIT-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
  }
  
  function saveToArchive(item) {
    let archive = JSON.parse(localStorage.getItem("spiritArchive") || "[]");
    archive.push(item);
    localStorage.setItem("spiritArchive", JSON.stringify(archive));
  }
  
  // Text Stamping
  const { jsPDF } = window.jspdf;
  document.getElementById("stampTextBtn").addEventListener("click", () => {
    const text = document.getElementById("textInput").value;
    const title = document.getElementById("workTitleText").value || "Untitled Work";
    const creator = document.getElementById("creatorNameText").value || "Anonymous";
    if (!text) return alert("Write something first!");
    const ticketID = generateTicketID();
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Spirit Stamp Ticket: ${ticketID}`, 10, 20);
    doc.text(`Title: ${title}`, 10, 30);
    doc.text(`Creator: ${creator}`, 10, 40);
    doc.text("----", 10, 50);
    doc.text(text, 10, 60, { maxWidth: 180 });
    const pdfBlob = doc.output("blob");
    saveToArchive({ type: "text", title, creator, ticketID, blob: pdfBlob });
    const url = URL.createObjectURL(pdfBlob);
    document.getElementById("textResult").innerHTML = `<a href="${url}" download="${title}.pdf">Download your Spirit Stamp PDF</a>`;
  });
  
  // File Upload
  document.getElementById("stampFileBtn").addEventListener("click", () => {
    const fileInput = document.getElementById("fileInput");
    const title = document.getElementById("workTitleFile").value || fileInput.files[0]?.name || "Untitled File";
    const creator = document.getElementById("creatorNameFile").value || "Anonymous";
    if (!fileInput.files.length) return alert("Select a file first!");
    const file = fileInput.files[0];
    const ticketID = generateTicketID();
    saveToArchive({ type: "file", title, creator, ticketID, blob: file });
    document.getElementById("fileResult").innerHTML = `<p>File stamped with Ticket ID: ${ticketID}</p>`;
  });
  
  // Archive Refresh
  document.getElementById("refreshArchiveBtn").addEventListener("click", () => {
    const archive = JSON.parse(localStorage.getItem("spiritArchive") || "[]");
    const list = document.getElementById("archiveList");
    list.innerHTML = "";
    archive.forEach(item => {
      const li = document.createElement("li");
      li.textContent = `[${item.type}] ${item.title} by ${item.creator} — Ticket: ${item.ticketID}`;
      list.appendChild(li);
    });
  });
  
  // Media Recorder
  let mediaRecorder, mediaChunks = [], mediaType;
  
  function startRecording(type) {
    mediaType = type;
    navigator.mediaDevices.getUserMedia({ audio: true, video: type === "video" }).then(stream => {
      mediaChunks = [];
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = e => mediaChunks.push(e.data);
      mediaRecorder.onstop = () => finalizeRecording(stream);
      mediaRecorder.start();
      document.getElementById("stopRecBtn").disabled = false;
      document.getElementById("cancelRecBtn").disabled = false;
    }).catch(err => alert("Error accessing camera/microphone: " + err));
  }
  
  function finalizeRecording(stream) {
    const blob = new Blob(mediaChunks, { type: mediaType === "video" ? "video/webm" : "audio/wav" });
    const title = document.getElementById("workTitleMedia").value || "Untitled Recording";
    const creator = document.getElementById("creatorNameMedia").value || "Anonymous";
    const ticketID = generateTicketID();
    saveToArchive({ type: mediaType, title, creator, ticketID, blob });
    const url = URL.createObjectURL(blob);
    if (mediaType === "video") document.getElementById("preview").src = url;
    else document.getElementById("audioPreview").src = url;
    document.getElementById("mediaResult").innerHTML = `<p>Recording stamped! Ticket ID: ${ticketID}</p>`;
    stream.getTracks().forEach(t => t.stop());
    document.getElementById("stopRecBtn").disabled = true;
    document.getElementById("cancelRecBtn").disabled = true;
  }
  
  document.getElementById("startAudioRecBtn").addEventListener("click", () => startRecording("audio"));
  document.getElementById("startVideoRecBtn").addEventListener("click", () => startRecording("video"));
  document.getElementById("stopRecBtn").addEventListener("click", () => mediaRecorder.stop());
  document.getElementById("cancelRecBtn").addEventListener("click", () => {
    mediaRecorder.stop();
    mediaChunks = [];
    document.getElementById("stopRecBtn").disabled = true;
    document.getElementById("cancelRecBtn").disabled = true;
  });
  
  // Local Save (text only)
  document.getElementById("saveLocalBtn").addEventListener("click", () => {
    const text = document.getElementById("textInput").value;
    const title = document.getElementById("workTitleText").value || "Untitled Work";
    const creator = document.getElementById("creatorNameText").value || "Anonymous";
    const ticketID = generateTicketID();
    saveToArchive({ type: "text-local", title, creator, ticketID, blob: text });
    alert(`Saved locally with Ticket ID: ${ticketID}`);
  });
  