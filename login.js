const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyJY2JqCr-hUBUzzLIaaIZIyK1rDPrfhXhWXOk6-HVI10m-Gp2rWVCHaX01VvS5fi1r/exec';

let pegawaiList = [];

/* =========================
   LOAD NAMA PEGAWAI (JSONP)
========================= */
function handlePegawai(data) {
  pegawaiList = data;
  const select = document.getElementById('nama');
  select.innerHTML = '<option value="">-- Pilih Pegawai --</option>';

  data.forEach(p => {
    const opt = document.createElement('option');
   opt.value = p[1];        // nama_pegawai
opt.textContent = p[1]; // nama_pegawai
    select.appendChild(opt);
  });
}

(function loadPegawai() {
  const script = document.createElement('script');
  script.src = `${WEB_APP_URL}?action=getPegawai&callback=handlePegawai`;
  script.onerror = () => Swal.fire('Error', 'Gagal memuat data pegawai', 'error');
  document.body.appendChild(script);
})();

/* =========================
   LOGIN SUBMIT
========================= */
document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const nama = document.getElementById('nama').value;
  const pin = document.getElementById('pin').value;

  if (!nama || !pin) {
    Swal.fire('Peringatan', 'Nama dan PIN wajib diisi', 'warning');
    return;
  }

  Swal.fire({
    title: 'Memverifikasi...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  const formData = new FormData();
  formData.append('action', 'login');
  formData.append('nama', nama);
  formData.append('pin', pin);

  fetch(WEB_APP_URL, {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(res => {
      if (!res.success) {
        Swal.fire('Gagal', res.message || 'Login gagal', 'error');
        return;
      }

      // simpan session SiKaWaN
      localStorage.setItem('sikawan_session', JSON.stringify(res.data));
      localStorage.setItem('loginTime', new Date().toISOString());

      Swal.fire({
        icon: 'success',
        title: 'Login berhasil',
        timer: 800,
        showConfirmButton: false
      });

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    })
    .catch(err => {
      Swal.fire('Error', 'Gagal terhubung ke server', 'error');
      console.error(err);
    });
});
