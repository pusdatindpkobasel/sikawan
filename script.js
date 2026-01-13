/* =====================================================
   SIKAWAN - SCRIPT.JS (CLEAN VERSION)
   Fokus: Auth, Dashboard, Profil Pegawai
===================================================== */

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzN-u472lht7RVo-X1qhT4MJoNCeIBUKNexPG7Vu4MyhXHGiNqKFXifpI-uAzZME_aj/exec';

let userData = {};

/* =====================================================
   MASTER DATA
===================================================== */
const masterSubBidang = [
  "Dinas",
  "Sekretariat",
  "Subbagian Umum dan Kepegawaian",
  "Bidang Pemasaran Pariwisata & Ekraf",
  "Bidang Pengembangan Destinasi Pariwisata",
  "Bidang Kepemudaan dan Olahraga"
];

const masterStatusKepegawaian = [
  "PNS",
  "PPPK",
  "PPPK PARUH WAKTU",
  "PJLP"
];

const masterGolongan = [
  "II/a","II/b","II/c","II/d",
  "III/a","III/b","III/c","III/d",
  "IV/a","IV/b"
];

const masterJabatan = [
  "Staff",
  "Kepala Subbagian",
  "Kepala Bidang",
  "Sekretaris",
  "Kepala Dinas"
];

/* =====================================================
   AUTH & SESSION GUARD
===================================================== */
window.onload = () => {
  const savedSession = localStorage.getItem('sikawan_session');
  const loginTimeStr = localStorage.getItem('loginTime');

  if (!savedSession || !loginTimeStr) {
    window.location.href = 'login.html';
    return;
  }

  const diffMinutes = (new Date() - new Date(loginTimeStr)) / 60000;
  if (diffMinutes > 60) {
    localStorage.clear();
    window.location.href = 'login.html';
    return;
  }

  userData = JSON.parse(savedSession);

  setupNavigation();
  showPage('beranda');
  displayUserInfo();
  setLogoutButton();
};

/* =====================================================
   NAVIGATION
===================================================== */
function setupNavigation() {
  const menuLinks = document.querySelectorAll('#sidebar-menu a');
  const pages = document.querySelectorAll('.page-content');
  const sidebar = document.getElementById('sidebar');
  const hamburgerBtn = document.getElementById('hamburger-btn');

  window.showPage = function (pageId) {
    pages.forEach(p => p.style.display = 'none');
    document.getElementById(`page-${pageId}`).style.display = 'block';

    menuLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.page === pageId);
    });

    if (pageId === 'profil') {
  loadUserProfile();     // isi dropdown & basic
  loadProfilLengkap();   // 🔥 AMBIL DATA LENGKAP DARI SHEET
}
  };

  menuLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showPage(link.dataset.page);

      if (window.innerWidth <= 768) {
        sidebar.classList.remove('show');
        hamburgerBtn.setAttribute('aria-expanded', false);
      }
    });
  });

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
      const isShown = sidebar.classList.toggle('show');
      hamburgerBtn.setAttribute('aria-expanded', isShown);
    });
  }
}

/* =====================================================
   DASHBOARD (BERANDA)
===================================================== */
function displayUserInfo() {
  const el = document.getElementById("info-pegawai");
  if (!el) return;

  el.innerHTML = `
    <div class="row mb-1"><div class="col-4 fw-bold">Nama</div><div class="col-8">${userData.nama_pegawai || '-'}</div></div>
    <div class="row mb-1"><div class="col-4 fw-bold">NIP</div><div class="col-8">${userData.nip || '-'}</div></div>
    <div class="row mb-1"><div class="col-4 fw-bold">Status</div><div class="col-8">${userData.status_kepegawaian || '-'}</div></div>
    <div class="row mb-1"><div class="col-4 fw-bold">Sub Bidang</div><div class="col-8">${userData.sub_bidang || '-'}</div></div>
    <div class="row mb-1"><div class="col-4 fw-bold">Role</div><div class="col-8">${userData.role || '-'}</div></div>
  `;
}

/* =====================================================
   PROFIL PEGAWAI
===================================================== */
function loadUserProfile() {
  if (!userData) return;

  document.getElementById('profil-nama').value = userData.nama_pegawai || "";
  document.getElementById('profil-nip').value = userData.nip || "";
  document.getElementById('profil-email').value = userData.email || "";

  populateSelect('profil-subbid', masterSubBidang, userData.sub_bidang);
  populateSelect('profil-status', masterStatusKepegawaian, userData.status_kepegawaian);
  populateSelect('profil-golongan', masterGolongan, userData.golongan_pangkat);
  populateSelect('profil-jabatan', masterJabatan, userData.jabatan);
}

function populateSelect(id, options, selectedValue) {
  const select = document.getElementById(id);
  if (!select) return;

  select.innerHTML = "";
  options.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt;
    if (opt === selectedValue) o.selected = true;
    select.appendChild(o);
  });
}

/* =====================================================
   UPDATE PROFIL
===================================================== */
document.getElementById('profil-form')?.addEventListener('submit', async e => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('action', 'updatePegawai');
  formData.append('id_pegawai', userData.id_pegawai);
  formData.append('email', document.getElementById('profil-email').value);
  formData.append('sub_bidang', document.getElementById('profil-subbid').value);
  formData.append('status_kepegawaian', document.getElementById('profil-status').value);
  formData.append('golongan_pangkat', document.getElementById('profil-golongan').value);
  formData.append('jabatan', document.getElementById('profil-jabatan').value);

  Swal.fire({ title: 'Menyimpan...', didOpen: () => Swal.showLoading() });

  const res = await fetch(WEB_APP_URL, { method: 'POST', body: formData });
  const json = await res.json();

  if (json.success) {
    Swal.fire('Berhasil', 'Profil diperbarui', 'success');
    Object.assign(userData, json.data);
    localStorage.setItem('sikawan_session', JSON.stringify(userData));
  } else {
    Swal.fire('Gagal', json.message || 'Error', 'error');
  }
});

/* =====================================================
   LOAD PROFIL LENGKAP
===================================================== */
function loadProfilLengkap() {
  fetch(`${WEB_APP_URL}?action=getProfilPegawai&id_pegawai=${userData.id_pegawai}`)
    .then(res => res.json())
    .then(res => {
      if (!res.success) {
        Swal.fire('Error', res.message, 'error');
        return;
      }

      const d = res.data;

      // Header
      document.getElementById('profil-nama-text').textContent = d.nama;
      document.getElementById('profil-nip-text').textContent = d.nip ? `NIP: ${d.nip}` : 'NIP: -';
      document.getElementById('profil-status-aktif').textContent = d.status_aktif || '-';

      // Kepegawaian
      setVal('profil-status', d.status_kepegawaian);
      setVal('profil-golongan', d.golongan_pangkat);
      setVal('profil-jenis-jabatan', d.jenis_jabatan);
      setVal('profil-jabatan', d.jabatan);
      setVal('profil-subbid', d.sub_bidang);

      // Pribadi
      setVal('profil-tempat-lahir', d.tempat_lahir);
      setVal('profil-tanggal-lahir', d.tanggal_lahir);
      setVal('profil-jenis-kelamin', d.jenis_kelamin);
      setVal('profil-pendidikan', d.pendidikan_terakhir);
      setVal('profil-prodi', d.program_studi);
      setVal('profil-tahun-lulus', d.tahun_lulus);

      // Kontak
      setVal('profil-nohp', d.no_hp);
      setVal('profil-email', d.email);
      document.getElementById('profil-alamat').value = d.alamat_lengkap || '';
    });
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '-';
}
/* =====================================================
   LOGOUT
===================================================== */
function logout() {
  Swal.fire({
    title: 'Logout?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya'
  }).then(r => {
    if (r.isConfirmed) {
      localStorage.clear();
      window.location.href = 'login.html';
    }
  });
}

function setLogoutButton() {
  document.getElementById('logout-button')?.addEventListener('click', logout);
  document.getElementById('logout-button-mobile')?.addEventListener('click', logout);
}
