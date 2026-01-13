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

  window.showPage = function (pageId) {
    pages.forEach(p => p.style.display = 'none');
    document.getElementById(`page-${pageId}`).style.display = 'block';

    menuLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.page === pageId);
    });

    if (pageId === 'profil') {
      loadUserProfile();
      loadProfilLengkap(); // ✅ INI KUNCI UTAMANYA
    }
  };

  menuLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      showPage(link.dataset.page);
    });
  });
}

/* =====================================================
   DASHBOARD (BERANDA)
===================================================== */
function displayUserInfo() {
  const el = document.getElementById("info-pegawai");
  if (!el) return;

  el.innerHTML = `
    <div class="row mb-1"><div class="col-4 fw-bold">Nama</div><div class="col-8">${userData.nama_pegawai || '-'}</div></div>
    <div class="row mb-1"><div class="col-4 fw-bold">Status</div><div class="col-8">${userData.status_kepegawaian || '-'}</div></div>
    <div class="row mb-1"><div class="col-4 fw-bold">Sub Bidang</div><div class="col-8">${userData.sub_bidang || '-'}</div></div>
    <div class="row mb-1"><div class="col-4 fw-bold">Role</div><div class="col-8">${userData.role || '-'}</div></div>
  `;
}

/* =====================================================
   PROFIL BASIC (SESSION)
===================================================== */
function loadUserProfile() {
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
   PROFIL LENGKAP (FROM SHEET)
===================================================== */
function loadProfilLengkap() {

  if (!userData.id_pegawai) {
    console.error('ID Pegawai tidak ada di session', userData);
    Swal.fire('Error', 'ID Pegawai tidak ditemukan di session login', 'error');
    return;
  }

  fetch(`${WEB_APP_URL}?action=getProfilPegawai&id_pegawai=${encodeURIComponent(userData.id_pegawai)}`)
    .then(res => res.json())
    .then(res => {
      console.log('RESPON PROFIL:', res);

      if (!res.success) {
        Swal.fire('Error', res.message || 'Gagal memuat profil', 'error');
        return;
      }

      const d = res.data;

      // ===== HEADER =====
      document.getElementById('profil-nama-text').textContent = d.nama || '-';
      document.getElementById('profil-nip-text').textContent = d.nip ? `NIP: ${d.nip}` : 'NIP: -';
      document.getElementById('profil-status-aktif').textContent = d.status_aktif || '-';

      // ===== KEPEGAWAIAN =====
      setVal('profil-status', d.status_kepegawaian);
      setVal('profil-golongan', d.golongan_pangkat);
      setVal('profil-jenis-jabatan', d.jenis_jabatan);
      setVal('profil-jabatan', d.jabatan);
      setVal('profil-subbid', d.sub_bidang);

      // ===== PRIBADI =====
      setVal('profil-tempat-lahir', d.tempat_lahir);
      setVal('profil-tanggal-lahir', d.tanggal_lahir);
      setVal('profil-jenis-kelamin', d.jenis_kelamin);
      setVal('profil-pendidikan', d.pendidikan_terakhir);
      setVal('profil-prodi', d.program_studi);
      setVal('profil-tahun-lulus', d.tahun_lulus);

      // ===== KONTAK =====
      setVal('profil-nohp', d.no_hp);
      setVal('profil-email', d.email);
      document.getElementById('profil-alamat').value = d.alamat_lengkap || '';
    })
    .catch(err => {
      console.error(err);
      Swal.fire('Error', 'Gagal terhubung ke server', 'error');
    });
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
}
