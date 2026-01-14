/* =====================================================
   SIKAWAN - SCRIPT.JS (FINAL & FIXED)
   Fokus: Auth, Dashboard, Profil Lengkap Pegawai
===================================================== */

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzN-u472lht7RVo-X1qhT4MJoNCeIBUKNexPG7Vu4MyhXHGiNqKFXifpI-uAzZME_aj/exec';

let userData = {};
let profilSudahDimuat = false;

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

  /* ===============================
     🔧 NORMALISASI SESSION (KUNCI)
     =============================== */
  // Antisipasi session lama / mapping lama
  userData.id_pegawai =
    userData.id_pegawai ||
    userData.idPegawai ||
    userData.id ||
    null;

  console.log('SESSION FINAL:', userData);

  setupNavigation();
  showPage('beranda');
  displayUserInfo();
   initUploadFoto();
  setLogoutButton();

  /* ===============================
     ⚡ PRELOAD PROFIL LENGKAP
     =============================== */
  // Supaya saat klik menu Profil tidak terasa lambat
  loadProfilLengkap();
};

/* =====================================================
   NAVIGATION
===================================================== */
function setupNavigation() {
  const menuLinks = document.querySelectorAll('#sidebar-menu a');
  const pages = document.querySelectorAll('.page-content');

  window.showPage = function (pageId) {
    pages.forEach(p => p.style.display = 'none');
    const page = document.getElementById(`page-${pageId}`);
    if (page) page.style.display = 'block';

    menuLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.page === pageId);
    });

    if (pageId === 'profil') {
      loadProfilLengkap(); // ⬅️ langsung load dari SHEET
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

  document.getElementById('nama-pegawai').textContent = userData.nama_pegawai || '-';
  document.getElementById('status-pegawai').textContent = 'AKTIF';

  el.innerHTML = `
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
   // Foto Pegawai
const fotoEl = document.getElementById('foto-pegawai');
if (fotoEl) {
  fotoEl.src = userData.foto_url || 'https://via.placeholder.com/120';
}
}

/* =====================================================
   PROFIL LENGKAP (FROM SHEET data_pegawai)
===================================================== */
function loadProfilLengkap() {

  if (!userData.id_pegawai) {
    console.error('ID Pegawai TIDAK ADA:', userData);
    Swal.fire(
      'Error',
      'ID Pegawai tidak ditemukan di session. Silakan logout dan login ulang.',
      'error'
    );
    return;
  }

  // ✅ Swal loading HANYA SAAT PERTAMA
  if (!profilSudahDimuat) {
    Swal.fire({
      title: 'Memuat Profil',
      text: 'Mohon tunggu...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
  }

  fetch(`${WEB_APP_URL}?action=getProfilPegawai&id_pegawai=${encodeURIComponent(userData.id_pegawai)}`)
    .then(res => res.json())
    .then(res => {

      if (!res.success) {
        Swal.fire('Error', res.message || 'Gagal memuat profil', 'error');
        return;
      }

      const d = res.data;

      /* ===== HEADER ===== */
      document.getElementById('profil-nama-text').textContent = d.nama || '-';
      document.getElementById('profil-nip-text').textContent = d.nip ? `NIP: ${d.nip}` : 'NIP: -';
      document.getElementById('profil-status-aktif').textContent = d.status_aktif || '-';

      /* ===== KEPEGAWAIAN ===== */
      setVal('profil-status', d.status_kepegawaian);
      setVal('profil-golongan', d.golongan_pangkat);
      setVal('profil-jenis-jabatan', d.jenis_jabatan);
      setVal('profil-jabatan', d.jabatan);
      setVal('profil-subbid', d.sub_bidang);

      /* ===== PRIBADI ===== */
      setVal('profil-tempat-lahir', d.tempat_lahir);
      setVal('profil-tanggal-lahir', d.tanggal_lahir);
      setVal('profil-jenis-kelamin', d.jenis_kelamin);
      setVal('profil-pendidikan', d.pendidikan_terakhir);
      setVal('profil-prodi', d.program_studi);
      setVal('profil-tahun-lulus', d.tahun_lulus);

      /* ===== KONTAK ===== */
      setVal('profil-nohp', d.no_hp);
      setVal('profil-email', d.email);
      document.getElementById('profil-alamat').value = d.alamat_lengkap || '';

      // ✅ Tutup Swal & tandai sudah dimuat
      if (!profilSudahDimuat) {
        Swal.close();
        profilSudahDimuat = true;
      }
    })
    .catch(err => {
      console.error(err);
      Swal.fire('Error', 'Gagal terhubung ke server', 'error');
    });
}

/* =====================================================
   HELPER
===================================================== */
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
}
/* =====================================================
   UPLOAD FOTO PROFIL
===================================================== */
function initUploadFoto() {
  const inputFoto = document.getElementById('input-foto');
  const fotoEl = document.getElementById('foto-pegawai');

  if (!inputFoto || !fotoEl) return;

  inputFoto.onchange = function () {
    const file = this.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire('Error', 'File harus berupa gambar', 'error');
      return;
    }

    Swal.fire({
      title: 'Mengunggah Foto...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const reader = new FileReader();
    reader.onload = function () {
      const formData = new FormData();
      formData.append('action', 'uploadFoto');
      formData.append('id_pegawai', userData.id_pegawai);
      formData.append('base64', reader.result);

      fetch(WEB_APP_URL, { method: 'POST', body: formData })
        .then(res => res.json())
        .then(res => {
          if (!res.success) {
            Swal.fire('Gagal', res.message || 'Upload gagal', 'error');
            return;
          }

          fotoEl.src = res.foto_url;
          userData.foto_url = res.foto_url;
          localStorage.setItem('sikawan_session', JSON.stringify(userData));

          Swal.fire('Berhasil', 'Foto profil diperbarui', 'success');
        })
        .catch(() => {
          Swal.fire('Error', 'Gagal terhubung ke server', 'error');
        });
    };

    reader.readAsDataURL(file);
  };
}
