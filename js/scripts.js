const canvas1 = document.getElementById("pdf-render1");
const canvas2 = document.getElementById("pdf-render2");
const ctx1 = canvas1.getContext("2d");
const ctx2 = canvas2.getContext("2d");

const image = document.getElementById("image-display");
const video = document.getElementById("video-display");

const pageNumEl = document.getElementById("page-num");
const pageCountEl = document.getElementById("page-count");
const timeEl = document.getElementById("time");

const qrCanvas = document.getElementById("qrcode");
const qr = new QRious({
  element: qrCanvas,
  size: 150,
  value: ""
});

let midiaList = [];
let currentIndex = 0;
let currentPage = 1;
let pdfDoc = null;

// Relógio
setInterval(() => {
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString("pt-BR");
}, 1000);

// Obter arquivos
async function carregarMidia() {
  const res = await fetch('/api/midia');
  const data = await res.json();

  if (data.length === 0) {
    alert("Nenhum arquivo encontrado na pasta.");
    return;
  }

  midiaList = data;
  iniciarExibicao();
}

function iniciarExibicao() {
  exibirAtual();
}

function exibirAtual() {
  esconderTodos();

  const file = midiaList[currentIndex];
  const ext = file.split('.').pop().toLowerCase();
  const fullURL = `http://localhost:3000/midia/${file}`;

  qr.value = fullURL;

  if (ext === 'pdf') {
    carregarPDF(`/midia/${file}`);
  } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
    image.src = `/midia/${file}`;
    image.style.display = "block";
    avancarDepois(15000);
  } else if (['mp4', 'webm'].includes(ext)) {
    video.src = `/midia/${file}`;
    video.style.display = "block";
    video.onended = () => proximaMidia();
  } else {
    proximaMidia();
  }
}

function esconderTodos() {
  canvas1.style.display = "none";
  canvas2.style.display = "none";
  image.style.display = "none";
  video.style.display = "none";
  video.pause();
  video.onended = null;
}

async function carregarPDF(url) {
  const loadingTask = pdfjsLib.getDocument(url);
  pdfDoc = await loadingTask.promise;

  currentPage = 1;
  renderizarPaginas();
}

async function renderizarPaginas() {
  const totalPages = pdfDoc.numPages;
  pageCountEl.textContent = totalPages;
  pageNumEl.textContent = currentPage;

  const page1 = await pdfDoc.getPage(currentPage);
  const viewport1 = page1.getViewport({ scale: 1.4 });
  canvas1.height = viewport1.height;
  canvas1.width = viewport1.width;
  await page1.render({ canvasContext: ctx1, viewport: viewport1 }).promise;
  canvas1.style.display = "block";

  if (currentPage + 1 <= totalPages) {
    const page2 = await pdfDoc.getPage(currentPage + 1);
    const viewport2 = page2.getViewport({ scale: 1.4 });
    canvas2.height = viewport2.height;
    canvas2.width = viewport2.width;
    await page2.render({ canvasContext: ctx2, viewport: viewport2 }).promise;
    canvas2.style.display = "block";
  } else {
    canvas2.style.display = "none";
  }

  setTimeout(() => {
    currentPage += 2;

    if (currentPage > totalPages) {
      proximaMidia();
    } else {
      renderizarPaginas();
    }
  }, 15000);
}

function avancarDepois(ms) {
  setTimeout(proximaMidia, ms);
}

function proximaMidia() {
  currentIndex = (currentIndex + 1) % midiaList.length;
  exibirAtual();
}

carregarMidia();
