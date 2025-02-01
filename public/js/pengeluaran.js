// Fungsi utama untuk menampilkan data
async function tampilkanData() {
  const response = await fetch("/api/pengeluaran");
  const pengeluaranList = await response.json();
  console.log(pengeluaranList);
  const detailPengeluaran = document.querySelector("tbody");

  // Kosongkan tbody sebelum menambahkan data
  detailPengeluaran.innerHTML = "";

  // Gunakan forEach untuk menambahkan data ke dalam tabel
  pengeluaranList.forEach((item, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${item.nama}</td>
      <td>${formatRupiah(item.jumlah * item.harga)}</td>
      <td>${formatTanggal(item.tanggal)}</td>
      <td>
      <button class="btn btn-primary me-2" onclick="editItem('${item.id}')">Edit</button>
      <button class="btn btn-danger" onclick="deleteItem('${item.id}')">Delete</button>
      </td>
    `;
    detailPengeluaran.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", tampilkanData);

const createPengeluaran = () => {
  document.getElementById("tambahPengeluaranForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Mencegah reload halaman

    // Ambil data dari form
    const name = document.getElementById("name").value;
    const harga = parseFloat(document.getElementById("harga").value);
    const jumlah = document.getElementById("jumlah").value;
    const tanggal = new Date().toISOString().split("T")[0];

    if (harga < 0 || jumlah < 0) {
      alert("Harga dan Jumlah tidak boleh negatif.");
      return;
    }

    const data = { name, harga, jumlah, tanggal };

    try {
      const response = await fetch("/api/pengeluaran/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("item berhasil ditambahkan!");
        console.log(response);
        location.reload(); // Refresh halaman setelah sukses
      } else {
        const error = await response.json();
        alert(`Gagal menambahkan item: ${error.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menambahkan item.");
    }
  });
};

createPengeluaran();

async function deleteItem(id) {
  try {
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus item ini?");
    if (!confirmDelete) return;

    const response = await fetch(`/api/pengeluaran/${id}`, { method: "DELETE" });
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
    const response = await fetch(`/api/pengeluaran/${id}`);
    if (!response.ok) {
      throw new Error(`Gagal mengambil data produk: ${response.status}`);
    }
    const item = await response.json();

    // Isi nilai input modal dengan data item
    document.getElementById("editName").value = item.nama;
    document.getElementById("editHarga").value = item.harga;
    document.getElementById("editJumlah").value = item.jumlah;

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
  saveEditButton.addEventListener("click", async () => {
    try {
      const hargaEdit = parseFloat(document.getElementById("editHarga").value);
      const jumlahEdit = document.getElementById("editJumlah").value;

      if (hargaEdit < 0 || jumlahEdit < 0) {
        alert("Harga dan Jumlah tidak boleh negatif.");
        return;
      }
      // Ambil data dari input modal
      const updatedPengeluaran = {
        name: document.getElementById("editName").value,
        jumlah: jumlahEdit,
        harga: hargaEdit,
        tanggal: new Date().toISOString().split("T")[0],
      };

      // Kirim data yang diperbarui ke API
      const response = await fetch(`/api/pengeluaran/${currentEditId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPengeluaran),
      });

      if (response.ok) {
        alert("Pengeluaran berhasil diperbarui.");
        const editModal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
        editModal.hide();
        tampilkanData();
      } else {
        const error = await response.json();
        alert(`Gagal memperbarui Pengeluaran: ${error.message}`);
      }
    } catch (error) {
      console.error("Error updating Pengeluaran:", error);
      alert("Terjadi kesalahan saat memperbarui Pengeluaran.");
    }
  });
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
