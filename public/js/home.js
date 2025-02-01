async function tampilkanData() {
  const hariIni = new Date().toISOString().split("T")[0];
  const currentDate = dayjs().format("YYYY-MM-DD");

  console.log(hariIni, currentDate);

  // Konversi tanggal input ke format yang sama

  const responsePengeluaran = await fetch("/api/pengeluaran");
  const pengeluaranList = await responsePengeluaran.json();
  const detailPengeluaran = document.querySelector("#detailPengeluaran");

  detailPengeluaran.innerHTML = "";

  const pengeluaranHariIni = pengeluaranList.filter((item) => formatTanggal(item.tanggal) === currentDate);

  pengeluaranHariIni.forEach((item, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${i + 1}</td>
          <td>${item.nama}</td>
          <td>${formatTanggal(item.tanggal)}</td>
          <td>${formatRupiah(item.jumlah * item.harga)}</td>
        `;
    detailPengeluaran.appendChild(row);
  });

  const responsePemasukan = await fetch("/api/pemasukan");
  const pemasukanList = await responsePemasukan.json();
  const detailPemasukan = document.querySelector("#detailPemasukan");

  detailPemasukan.innerHTML = "";

  const pemasukanHariIni = pemasukanList.filter((item) => formatTanggal(item.tanggal) === currentDate);
  pemasukanHariIni.forEach((item, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${i + 1}</td>
          <td>${item.nama}</td>
          <td>${formatTanggal(item.tanggal)}</td>
          <td>${formatRupiah(item.jumlah * item.harga)}</td>
        `;
    detailPemasukan.appendChild(row);
  });

  const totalPengeluaran = pengeluaranHariIni.reduce((total, item) => total + item.jumlah * item.harga, 0);
  const totalPemasukan = pemasukanHariIni.reduce((total, item) => total + item.jumlah * item.harga, 0);

  document.getElementById("totalPengeluaran").textContent = formatRupiah(totalPengeluaran);
  document.getElementById("totalPemasukan").textContent = formatRupiah(totalPemasukan);
}

function formatTanggal(tanggal) {
  return dayjs(tanggal).format("YYYY-MM-DD");
}

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

document.addEventListener("DOMContentLoaded", tampilkanData);
