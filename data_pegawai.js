/* =====================================================
   DATA PEGAWAI MODULE (USER VIEW) - FINAL FIX
   ✔ JSON ONLY
   ✔ Filter OK
   ✔ Modal OK
===================================================== */

let pegawaiData = [];
let dataPegawaiLoaded = false;

/* =========================
   INIT
========================= */
function initDataPegawai() {
  if (dataPegawaiLoaded) return;

  fetch(`${WEB_APP_URL}?action=getPegawaiAll`)
    .then(res => res.json())
    .then(res => {
      if (!res.success || !Array.isArray(res.data)) {
        console.error('Format data pegawai tidak valid', res);
        return;
      }

      pegawaiData = res.data;
      dataPegawaiLoaded = true;

      populateFilter();
      renderTable(pegawaiData);
    })
    .catch(err => {
      console.error('Gagal load data pegawai:', err);
    });
}

/* =========================
   RENDER TABLE
========================= */
function renderTable(data) {
  const tbody = document.getElementById('pegawai-table');
  tbody.innerHTML = '';

  const isAdmin = userData?.role === 'ADMIN';

  data.forEach(p => {
    tbody.innerHTML += `
      <tr>
        <td class="text-center">
          <i class="bi bi-person-circle fs-4 text-secondary"></i>
        </td>
        <td>${p.nama_pegawai}</td>
        <td>${p.nip || '-'}</td>
        <td>${p.jenis_jabatan}</td>
        <td>${p.jabatan}</td>
        <td>${p.golongan_pangkat || '-'}</td>
        <td>${p.sub_bidang}</td>
        <td>${p.status_kepegawaian}</td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary me-1"
            onclick="showDetailPegawai('${p.id_pegawai}')">
            Detail
          </button>

          ${isAdmin ? `
            <button class="btn btn-sm btn-outline-warning me-1"
              onclick="showEditPegawai('${p.id_pegawai}')">
              Edit
            </button>

            <button class="btn btn-sm btn-outline-danger"
              onclick="nonaktifkanPegawai('${p.id_pegawai}')">
              Nonaktif
            </button>
          ` : ``}
        </td>
      </tr>
    `;
  });
}

/* =========================
   FILTER
========================= */
function populateFilter() {
  const subbidEl = document.getElementById('filter-subbid');
  if (!subbidEl) return;

  subbidEl.innerHTML = `<option value="">Semua Sub Bidang</option>`;

  [...new Set(pegawaiData.map(p => p.sub_bidang).filter(Boolean))]
    .sort()
    .forEach(v => {
      subbidEl.insertAdjacentHTML('beforeend', `<option value="${v}">${v}</option>`);
    });

  ['filter-subbid', 'filter-jenis-jabatan', 'filter-status', 'filter-search']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.oninput = applyFilter;
    });
}

function applyFilter() {
  const sb = getVal('filter-subbid');
  const jj = getVal('filter-jenis-jabatan');
  const st = getVal('filter-status');
  const q  = getVal('filter-search').toLowerCase();

  const filtered = pegawaiData.filter(p =>
    (!sb || p.sub_bidang === sb) &&
    (!jj || p.jenis_jabatan === jj) &&
    (!st || p.status_kepegawaian === st) &&
    (
      !q ||
      (p.nama_pegawai || '').toLowerCase().includes(q) ||
      (p.nip || '').includes(q)
    )
  );

  renderTable(filtered);
}

const getVal = id =>
  document.getElementById(id)?.value || '';

/* =========================
   MODAL DETAIL
========================= */
function showDetailPegawai(id) {
  const p = pegawaiData.find(x => x.id_pegawai === id);
  if (!p) return;

  // Foto (optional)
  const foto = document.getElementById('detail-foto');
  if (foto) {
    foto.src = p.foto_url
      ? `${p.foto_url}?t=${Date.now()}`
      : 'https://via.placeholder.com/100';
  }

  setText('detail-nama', p.nama_pegawai);
  setText('detail-nip', p.nip ? `NIP: ${p.nip}` : 'NIP: -');
  setText('detail-status', p.status_kepegawaian);
  setText('detail-jenis-jabatan', p.jenis_jabatan);
  setText('detail-jabatan', p.jabatan);
  setText('detail-golongan', p.golongan_pangkat);
  setText('detail-subbid', p.sub_bidang);
  setText('detail-pendidikan', p.pendidikan_terakhir);
  setText('detail-prodi', p.program_studi);
  setText('detail-lulus', p.tahun_lulus);
  setText('detail-hp', p.no_hp);
  setText('detail-email', p.email);
  setText('detail-alamat', p.alamat_lengkap);

  const modalEl = document.getElementById('modalDetailPegawai');
  if (modalEl) {
    new bootstrap.Modal(modalEl).show();
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || '-';
}
/* =========================
   MODAL EDIT PEGAWAI
========================= */
function showEditPegawai(id) {
  const p = pegawaiData.find(x => x.id_pegawai === id);
  if (!p) return;

  document.getElementById('edit-id-pegawai').value = p.id_pegawai;
  document.getElementById('edit-nama').value = p.nama_pegawai;
  document.getElementById('edit-nip').value = p.nip || '';
  document.getElementById('edit-status').value = p.status_kepegawaian;
  document.getElementById('edit-golongan').value = p.golongan_pangkat || '';
  document.getElementById('edit-jenis-jabatan').value = p.jenis_jabatan;
  document.getElementById('edit-jabatan').value = p.jabatan;
  document.getElementById('edit-subbid').value = p.sub_bidang;

  new bootstrap.Modal(
    document.getElementById('modalEditPegawai')
  ).show();
}
/* =========================
   NONAKTIF PEGAWAI
========================= */
function nonaktifkanPegawai(id) {
  const p = pegawaiData.find(x => x.id_pegawai === id);
  if (!p) return;

  Swal.fire({
    title: 'Nonaktifkan Pegawai?',
    text: `Pegawai ${p.nama_pegawai} akan dinonaktifkan`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Nonaktifkan'
  }).then(res => {
    if (!res.isConfirmed) return;

    // sementara dummy (nanti sambung ke GAS)
    p.status_kepegawaian = 'NONAKTIF';
    renderTable(pegawaiData);

    Swal.fire('Berhasil', 'Pegawai dinonaktifkan', 'success');
  });
}

