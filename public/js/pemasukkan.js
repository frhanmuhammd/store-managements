// Fungsi utama untuk menampilkan data
async function tampilkanData() {
  const response = await fetch("/api/pemasukan");
  const pemasukanList = await response.json();
  const detailPemasukan = document.querySelector("tbody");

  // Kosongkan tbody sebelum menambahkan data
  detailPemasukan.innerHTML = "";

  // Gunakan forEach untuk menambahkan data ke dalam tabel
  pemasukanList.forEach((item, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${item.nama}</td>
      <td>${formatRupiah(item.jumlah * item.harga)}</td>
      <td>${item.kategori}</td>
      <td>${formatTanggal(item.tanggal)}</td>
      <td>
      <button class="btn btn-primary me-2" onclick="editItem('${item.id}')">Edit</button>
      <button class="btn btn-danger" onclick="deleteItem('${item.id}')">Delete</button>
      </td>
    `;
    detailPemasukan.appendChild(row);
  });
}

// Panggil fungsi setelah konten halaman dimuat
document.addEventListener("DOMContentLoaded", tampilkanData);

async function deleteItem(id) {
  try {
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus item ini?");
    if (!confirmDelete) return;

    const response = await fetch(`/api/pemasukan/${id}`, { method: "DELETE" });
    if (response.ok) {
      alert("item berhasil dihapus.");
      tampilkanData(); // Refresh data produk
    } else {
      const error = await response.json();
      alert(`Gagal menghapus item: ${error.message}`);
    }
  } catch (error) {
    console.error("Error deleting  item:", error);
    alert("Terjadi kesalahan saat menghapus item.");
  }
}

let currentEditId = null;

async function editItem(id) {
  try {
    // Ambil data produk dari API berdasarkan ID
    const response = await fetch(`/api/pemasukan/${id}`);
    if (!response.ok) {
      throw new Error(`Gagal mengambil data produk: ${response.status}`);
    }
    const item = await response.json();

    // Isi nilai input modal dengan data item
    document.getElementById("editName").value = item.nama;
    document.getElementById("editHarga").value = item.harga;
    document.getElementById("editJumlah").value = item.jumlah;
    document.getElementById("editKategori").value = item.kategori;

    currentEditId = id; // Simpan ID produk yang sedang diedit

    // Tampilkan modal
    const editModal = new bootstrap.Modal(document.getElementById("editModal"));
    editModal.show();
  } catch (error) {
    console.error("Error fetching produk:", error);
    alert("Terjadi kesalahan saat mengambil data produk.");
  }
}

const saveEditButton = document.getElementById("saveEditButton");
if (saveEditButton) {
  const saveEditButton = document.getElementById("saveEditButton");
  if (saveEditButton) {
    saveEditButton.addEventListener("click", async () => {
      try {
        const harga = parseInt(document.getElementById("editHarga").value, 10);
        const jumlah = parseInt(document.getElementById("editJumlah").value, 10);

        if (harga < 0 || jumlah < 0) {
          alert("Harga dan Jumlah tidak boleh negatif.");
          return;
        }

        // Ambil data dari input modal
        const updatedPemasukan = {
          name: document.getElementById("editName").value,
          jumlah,
          harga,
          kategori: document.getElementById("editKategori").value,
          tanggal: new Date().toISOString().split("T")[0],
        };

        // Kirim data yang diperbarui ke API
        const response = await fetch(`/api/pemasukan/${currentEditId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPemasukan),
        });

        if (response.ok) {
          alert("Pemasukan berhasil diperbarui.");
          const editModal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
          editModal.hide();
          tampilkanData(); // Refresh daftar Pemasukan
        } else {
          const error = await response.json();
          alert(`Gagal memperbarui Pemasukan: ${error.message}`);
        }
      } catch (error) {
        console.error("Error updating Pemasukan:", error);
        alert("Terjadi kesalahan saat memperbarui Pemasukan.");
      }
    });
  } else {
    console.error("saveEditButton tidak ditemukan di DOM!");
  }
} else {
  console.error("saveEditButton tidak ditemukan di DOM!");
}

function formatTanggal(tanggal) {
  const date = new Date(tanggal);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}
