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
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!data.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center text-muted">
          Tidak ada data pegawai
        </td>
      </tr>
    `;
    return;
  }

  data.forEach(p => {
    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td class="text-center">
          <i class="bi bi-person-circle fs-4 text-secondary"></i>
        </td>
        <td>${p.nama_pegawai || '-'}</td>
        <td>${p.nip || '-'}</td>
        <td>${p.jenis_jabatan || '-'}</td>
        <td>${p.jabatan || '-'}</td>
        <td>${p.golongan_pangkat || '-'}</td>
        <td>${p.sub_bidang || '-'}</td>
        <td>${p.status_kepegawaian || '-'}</td>
        <td>
          <button
            class="btn btn-sm btn-outline-primary"
            onclick="showDetailPegawai('${p.id_pegawai}')">
            Detail
          </button>
        </td>
      </tr>
    `);
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
