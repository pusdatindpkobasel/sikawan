/* =====================================================
   DATA PEGAWAI MODULE (USER VIEW)
===================================================== */

let pegawaiData = [];

function initDataPegawai() {
  if (pegawaiData.length) return;

  fetch(`${WEB_APP_URL}?action=getPegawaiAll`)
    .then(res => res.json())
    .then(res => {
      if (!res.success) return;

      pegawaiData = res.data;
      populateFilter();
      renderTable(pegawaiData);
    });
}

/* =========================
   RENDER TABLE
========================= */
function renderTable(data) {
  const tbody = document.getElementById('pegawai-table');
  tbody.innerHTML = '';

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
        <td>
          <button class="btn btn-sm btn-outline-primary"
            onclick="showDetailPegawai('${p.id_pegawai}')">
            Detail
          </button>
        </td>
      </tr>
    `;
  });
}

/* =========================
   FILTER
========================= */
function populateFilter() {
  const subbid = document.getElementById('filter-subbid');
  const set = new Set(pegawaiData.map(p => p.sub_bidang));
  set.forEach(v => subbid.innerHTML += `<option>${v}</option>`);

  ['filter-subbid','filter-jenis-jabatan','filter-status','filter-search']
    .forEach(id => document.getElementById(id).oninput = applyFilter);
}

function applyFilter() {
  const sb = filterValue('filter-subbid');
  const jj = filterValue('filter-jenis-jabatan');
  const st = filterValue('filter-status');
  const q  = filterValue('filter-search').toLowerCase();

  const filtered = pegawaiData.filter(p =>
    (!sb || p.sub_bidang === sb) &&
    (!jj || p.jenis_jabatan === jj) &&
    (!st || p.status_kepegawaian === st) &&
    (!q || p.nama_pegawai.toLowerCase().includes(q) || (p.nip||'').includes(q))
  );

  renderTable(filtered);
}

const filterValue = id => document.getElementById(id).value;

/* =========================
   MODAL DETAIL
========================= */
function showDetailPegawai(id) {
  const p = pegawaiData.find(x => x.id_pegawai === id);
  if (!p) return;

  document.getElementById('detail-foto').src =
    p.foto_url || 'https://via.placeholder.com/100';

  document.getElementById('detail-nama').textContent = p.nama_pegawai;
  document.getElementById('detail-nip').textContent =
    p.nip ? `NIP: ${p.nip}` : 'NIP: -';

  setText('detail-status', p.status_kepegawaian);
  setText('detail-jenis-jabatan', p.jenis_jabatan);
  setText('detail-jabatan', p.jabatan);
  setText('detail-golongan', p.golongan_pangkat || '-');
  setText('detail-subbid', p.sub_bidang);
  setText('detail-pendidikan', p.pendidikan_terakhir || '-');
  setText('detail-prodi', p.program_studi || '-');
  setText('detail-lulus', p.tahun_lulus || '-');
  setText('detail-hp', p.no_hp || '-');
  setText('detail-email', p.email || '-');
  setText('detail-alamat', p.alamat_lengkap || '-');

  new bootstrap.Modal(
    document.getElementById('modalDetailPegawai')
  ).show();
}

const setText = (id,val) =>
  document.getElementById(id).textContent = val || '-';
