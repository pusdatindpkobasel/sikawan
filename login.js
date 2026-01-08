const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzLAngej--IA-IAlx2sNpdnpYGiixs_kohQyB5lG36KB72t7xg7L9uNqIICjy2XaQ0M/exec';

let pegawaiList = [];

/* ===============================
   JSONP CALLBACK
================================ */
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

/* ===============================
   LOAD DATA PEGAWAI (JSONP)
================================ */
(function loadPegawai() {
  const script = document.createElement('script');
  script.src = `${WEB_APP_URL}?action=getPegawai&callback=handlePegawai`;
  script.onerror = () => Swal.fire('Error', 'Gagal memuat data pegawai', 'error');
  document.body.appendChild(script);
})();

/* ===============================
   LOGIN SUBMIT
================================ */
document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();

  const nama = document.getElementById('nama').value;
  const pin = document.getElementById('pin').value;

  const data = pegawaiList.find(p => p[1] === nama);

  if (!data || String(pin) !== String(data[4])) {
    Swal.fire('Gagal', 'PIN salah', 'error');
    return;
  }

  Swal.fire({
    title: 'Memuat data...',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  const userData = {
    id_pegawai: data[0],
    nama: data[1],
    nip: data[3],
    sub_bidang: data[5],
    status: data[6],
    golongan: data[7],
    jabatan: data[9]
  };

  localStorage.setItem('userData', JSON.stringify(userData));
  localStorage.setItem('loginTime', new Date().toISOString());

  setTimeout(() => {
    Swal.close();
    window.location.href = 'index.html';
  }, 800);
});
