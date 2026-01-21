const WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbwqgrp-WPmhpaXaaEZVDPNfLTZyqvJEcxIqa3nTNY62BK5Ip8DT20dQE-bXphTAtkMz/exec';

let userData = {};
let cropper;

/* ================= SESSION GUARD ================= */
document.addEventListener('DOMContentLoaded', () => {
  const session = localStorage.getItem('sikawan_session');
  const loginTime = localStorage.getItem('loginTime');

  if (!session || !loginTime) return location.href = 'login.html';
  if ((Date.now() - new Date(loginTime)) / 60000 > 60) {
    localStorage.clear();
    return location.href = 'login.html';
  }

  userData = JSON.parse(session);
  userData.id_pegawai ||= userData.id || null;

  initSidebar();
  renderDashboard();
  initUploadFoto();
});

/* ================= SIDEBAR UX FIX ================= */
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const links = document.querySelectorAll('#sidebar-menu a');
  const pages = document.querySelectorAll('.page-content');

  hamburger.onclick = () => sidebar.classList.toggle('show');

  links.forEach(link => {
    link.onclick = e => {
      e.preventDefault();
      const page = link.dataset.page;

      pages.forEach(p => p.style.display = 'none');
      document.getElementById(`page-${page}`).style.display = 'block';

      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      sidebar.classList.remove('show'); // ✅ AUTO CLOSE
    };
  });

  document.getElementById('content').onclick = () =>
    sidebar.classList.remove('show');

  links[0].click();
}

/* ================= DASHBOARD ================= */
function renderDashboard() {
  document.getElementById('nama-pegawai').textContent = userData.nama_pegawai || '-';

  document.getElementById('info-pegawai').innerHTML = `
    <div>Sub Bidang: ${userData.sub_bidang || '-'}</div>
    <div>Status: ${userData.status_kepegawaian || '-'}</div>
  `;

  setFoto('foto-pegawai', userData.foto_url);
}

/* ================= FOTO + CROP ================= */
function initUploadFoto() {
  const input = document.getElementById('input-foto');
  const btn = document.getElementById('btn-edit-foto');

  btn.onclick = () => input.click();

  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => openCrop(reader.result);
    reader.readAsDataURL(file);
  };
}

function openCrop(src) {
  const img = document.createElement('img');
  img.src = src;

  cropper = new Cropper(img, { aspectRatio: 1 });

  document.body.appendChild(img);

  setTimeout(() => {
    const canvas = cropper.getCroppedCanvas({ width: 400, height: 400 });
    cropper.destroy();
    img.remove();
    uploadFoto(canvas.toDataURL());
  }, 300);
}

function uploadFoto(base64) {
  const fd = new FormData();
  fd.append('action', 'uploadFoto');
  fd.append('id_pegawai', userData.id_pegawai);
  fd.append('base64', base64);

  fetch(WEB_APP_URL, { method: 'POST', body: fd })
    .then(r => r.json())
    .then(r => {
      if (!r.success) return;
      userData.foto_url = r.foto_url;
      localStorage.setItem('sikawan_session', JSON.stringify(userData));
      setFoto('foto-pegawai', r.foto_url);
    });
}

/* ================= HELPER ================= */
function setFoto(id, url) {
  document.getElementById(id).src =
    url ? `${url}?t=${Date.now()}` : 'https://via.placeholder.com/120';
}

/* ================= LOGOUT ================= */
document.getElementById('logout-button').onclick = () => {
  localStorage.clear();
  location.href = 'login.html';
};
