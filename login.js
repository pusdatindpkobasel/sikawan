const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxVglYinZmuaGYnBR6HD7E-fnQ44qJDS2VKkuCiVtUy6iVUCuCgnTMAeHlKuWPOhpdP/exec';

// Handle submit login
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

      // simpan session login
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
