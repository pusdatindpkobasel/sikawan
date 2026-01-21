/* =====================================================
   SIKAWAN - SCRIPT.JS (STABLE & SAFE)
   ❗ TIDAK MERUSAK dashboard.html
===================================================== */

const WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbwqgrp-WPmhpaXaaEZVDPNfLTZyqvJEcxIqa3nTNY62BK5Ip8DT20dQE-bXphTAtkMz/exec';

let userData = {};
let profilLoaded = false;
let cropper = null;

/* ================= SESSION GUARD ================= */
document.addEventListener('DOMContentLoaded', () => {
  const session = localStorage.getItem('sikawan_session');
  const loginTime = localStorage.getItem('loginTime');

  if (!session || !loginTime) {
    location.href = 'login.html';
    return;
  }

  if ((Date.now() - new Date(loginTime)) / 60000 > 60) {
    localStorage.clear();
    location.href = 'login.html';
    return;
  }

  userData = JSON.parse(session);
  userData.id_pegawai =
    userData.id_pegawai || userData.idPegawai || userData.id || null;

  setupNavigation();
  renderDashboard();
  initUploadFoto();
});

/* ================= NAVIGATION (AMAN) ================= */
function setupNavigation() {
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');
  const links = document.querySelectorAll('#sidebar-menu a');
  const pages = document.querySelectorAll('.page-content');

  function showPage(page) {
    pages.forEach(p => (p.style.display = 'none'));

    const target = document.getElementById(`page-${page}`);
    if (target) target.style.display = 'block';

    links.forEach(l =>
      l.classList.toggle('active', l.dataset.page === page)
    );

    // auto close sidebar (mobile)
    sidebar.classList.remove('show');

    if (page === 'profil' && !profilLoaded) {
      loadProfilLengkap();
    }
  }

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showPage(link.dataset.page);
    });
  });

  // klik area konten → tutup sidebar (mobile UX)
  content.addEventListener('click', () => {
    sidebar.classList.remove('show');
  });

  showPage('beranda');
}

/* ================= DASHBOARD ================= */
function renderDashboard() {
  const namaEl = document.getElementById('nama-pegawai');
  const statusEl = document.getElementById('status-pegawai');
  const infoEl = document.getElementById('info-pegawai');

  if (!namaEl || !infoEl) return;

  namaEl.textContent = userData.nama_pegawai || '-';
  statusEl.textContent = 'AKTIF';

  infoEl.innerHTML = `
    <div class="row mb-1">
      <div class="col-4 fw-bold">Nama</div>
      <div class="col-8">${userData.nama_pegawai || '-'}</div>
    </div>
    <div class="row mb-1">
      <div class="col-4 fw-bold">Status</div>
      <div class="col-8">${userData.status_kepegawaian || '-'}</div>
    </div>
    <div class="row mb-1">
      <div class="col-4 fw-bold">Sub Bidang</div>
      <div class="col-8">${userData.sub_bidang || '-'}</div>
    </div>
    <div class="row mb-1">
      <div class="col-4 fw-bold">Role</div>
      <div class="col-8">${userData.role || '-'}</div>
    </div>
  `;

  setFoto('foto-pegawai', userData.foto_url);
}

/* ================= PROFIL LENGKAP ================= */
function loadProfilLengkap() {
  if (!userData.id_pegawai) return;

  fetch(
    `${WEB_APP_URL}?action=getProfilPegawai&id_pegawai=${encodeURIComponent(
      userData.id_pegawai
    )}`
  )
    .then(r => r.json())
    .then(r => {
      if (!r.success) return;

      const d = r.data;
      profilLoaded = true;

      document.getElementById('profil-nama-text').textContent = d.nama || '-';
      document.getElementById('profil-nip-text').textContent =
        d.nip ? `NIP: ${d.nip}` : 'NIP: -';
      document.getElementById('profil-status-aktif').textContent =
        d.status_aktif || '-';

      setFoto('profil-foto', d.foto_url);

      fill('profil-status', d.status_kepegawaian);
      fill('profil-golongan', d.golongan_pangkat);
      fill('profil-jenis-jabatan', d.jenis_jabatan);
      fill('profil-jabatan', d.jabatan);
      fill('profil-subbid', d.sub_bidang);

      fill('profil-tempat-lahir', d.tempat_lahir);
      fill('profil-tanggal-lahir', d.tanggal_lahir);
      fill('profil-jenis-kelamin', d.jenis_kelamin);
      fill('profil-pendidikan', d.pendidikan_terakhir);
      fill('profil-prodi', d.program_studi);
      fill('profil-tahun-lulus', d.tahun_lulus);

      fill('profil-nohp', d.no_hp);
      fill('profil-email', d.email);
      document.getElementById('profil-alamat').value =
        d.alamat_lengkap || '';
    });
}

/* ================= FOTO + CROP ================= */
function initUploadFoto() {
  const btn = document.getElementById('btn-edit-foto');
  const input = document.getElementById('input-foto');

  if (!btn || !input) return;

  btn.onclick = () => input.click();

  input.onchange = () => {
    const file = input.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => openCropper(reader.result);
    reader.readAsDataURL(file);
  };
}

function openCropper(src) {
  const img = document.createElement('img');
  img.src = src;
  img.style.maxWidth = '100%';
  document.body.appendChild(img);

  cropper = new Cropper(img, { aspectRatio: 1 });

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
      setFoto('profil-foto', r.foto_url);
    });
}

/* ================= HELPER ================= */
function fill(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '-';
}

function setFoto(id, url) {
  const img = document.getElementById(id);
  if (img) {
    img.src = url
      ? `${url}?t=${Date.now()}`
      : 'https://via.placeholder.com/120';
  }
}

/* ================= LOGOUT ================= */
document.getElementById('logout-button')?.addEventListener('click', () => {
  localStorage.clear();
  location.href = 'login.html';
});
