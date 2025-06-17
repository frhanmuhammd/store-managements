async function masukkanKePemasukan(id, nama, harga, jumlah, kategori) {
  const tanggal = new Date().toISOString().split("T")[0];
  const pemasukan = {
    name: nama,
    jumlah: parseInt(jumlah, 10),
    harga: harga * parseInt(jumlah, 10),
    kategori: kategori,
    tanggal: tanggal,
  };

  if (harga < 0 || jumlah < 0) {
    alert("Harga dan Jumlah tidak boleh negatif.");
    return;
  }

  try {
    const response = await fetch("/api/pemasukan/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pemasukan),
    });

    if (response.ok) {
      alert(`${nama} berhasil dimasukkan ke pemasukan!`);
      window.location.href = "pemasukan.html";
    } else {
      const error = await response.json();
      alert(`Gagal menyimpan data: ${error.message}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Terjadi kesalahan saat menyimpan data.");
  }
}

async function tampilkanProduk() {
  try {
    // Ambil kategori dari query string URL
    const urlParams = new URLSearchParams(window.location.search);
    const kategori = urlParams.get("kategori"); // Ambil kategori dari query string

    // Ambil data produk dari API
    const response = await fetch("/api/produk");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const produkList = await response.json();

    const listData = document.getElementById("listData");
    if (!listData) {
      console.error("Elemen listData tidak ditemukan di DOM!");
      return;
    }

    listData.innerHTML = ""; // Kosongkan sebelum diisi ulang

    // Filter produk berdasarkan kategori yang dipilih
    const filteredProduk = kategori ? produkList.filter((produk) => produk.kategori === kategori) : produkList;

    // Tampilkan produk yang sesuai
    filteredProduk.forEach((produk) => {
      const col = document.createElement("div");
      col.className = "col-4";

      col.innerHTML = `
                  <div class="card">
                      <div class="card-header" id="header-gambar">
                          <img src="/uploads/${produk.gambar}" class="card-img-top" alt="${produk.nama}">
                      </div>
                      <div class="card-body">
                          <h5 class="card-title text-center text-warning">
                              <strong>${produk.nama}</strong>
                          </h5>
                          <p class="card-text text-center">${produk.deskripsi}</p>
                          
                          <div class="d-flex justify-content-center align-items-center w-100 my-2">
                            <input type="number" class="item" id="jumlah-${produk.id}" placeholder="Masukkan Jmlh Barang" required min="1" />
                            </div>
                          <h4 class="text-center text-warning">Rp ${produk.harga.toLocaleString()}</h4>
                           <div class="d-flex justify-content-center align-items-center w-100 my-2">
                          <button class="btn btn-primary" 
                            onclick="masukkanKePemasukan('${produk.id}', '${produk.nama}', ${produk.harga}, document.getElementById('jumlah-${produk.id}').value,'${produk.kategori}')"> 
                            Masukkan Ke Pemasukan
                          </button>
                          </div>
                          <button class="btn btn-warning mt-2 ms-3" onclick="editProduk('${produk.id}')">Edit</button>
                          <button class="btn btn-danger mt-2" 
                            onclick="deleteProduk('${produk.id}')">Delete</button>
                      </div>
                  </div>
              `;
      listData.appendChild(col);
    });
  } catch (error) {
    console.error("Error fetching produk:", error);
  }
}
document.addEventListener("DOMContentLoaded", tampilkanProduk);

async function deleteProduk(id) {
  try {
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus produk ini?");
    if (!confirmDelete) return;

    const response = await fetch(`/api/produk/${id}`, { method: "DELETE" });
    if (response.ok) {
      alert("Produk berhasil dihapus.");
      tampilkanProduk(); // Refresh data produk
    } else {
      const error = await response.json();
      alert(`Gagal menghapus produk: ${error.message}`);
    }
  } catch (error) {
    console.error("Error deleting produk:", error);
    alert("Terjadi kesalahan saat menghapus produk.");
  }
}

let currentEditId = null;
let currentImagePath = "";

async function editProduk(id) {
  try {
    // Ambil data produk dari API berdasarkan ID
    const response = await fetch(`/api/produk/${id}`);
    if (!response.ok) {
      throw new Error(`Gagal mengambil data produk: ${response.status}`);
    }

    const produk = await response.json();
    console.log(produk);

    // Isi nilai input modal dengan data produk
    document.getElementById("editName").value = produk.nama;
    document.getElementById("editDescription").value = produk.deskripsi;
    document.getElementById("editPrice").value = produk.harga;
    document.getElementById("editCategory").value = produk.kategori;
    // document.getElementById("editImage").value = produk.image;

    currentEditId = id; // Simpan ID produk yang sedang diedit
    currentImagePath = produk.gambar;

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
      // Ambil data dari input modal
      const name = document.getElementById("editName").value;
      const description = document.getElementById("editDescription").value;
      const price = parseFloat(document.getElementById("editPrice").value);
      const imageFile = document.getElementById("editImage").files[0];
      const kategori = document.getElementById("editCategory").value;

      if (price < 0) {
        alert("Harga dan Jumlah tidak boleh negatif.");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("kategori", kategori);

      if (imageFile) {
        // Jika ada gambar baru, kirim file gambar
        formData.append("image", imageFile);
      } else {
        // Jika tidak ada gambar baru, kirim path gambar lama
        formData.append("imagePath", currentImagePath);
      }

      console.log(formData);
      console.log(currentImagePath);

      // Kirim data yang diperbarui ke API
      const response = await fetch(`/api/produk/${currentEditId}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        alert("Produk berhasil diperbarui.");
        const editModal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
        editModal.hide();
        tampilkanProduk(); // Refresh daftar produk
      } else {
        const error = await response.json();
        alert(`Gagal memperbarui produk: ${error.message}`);
      }
    } catch (error) {
      console.error("Error updating produk:", error);
      alert("Terjadi kesalahan saat memperbarui produk.");
    }
  });
} else {
  console.error("saveEditButton tidak ditemukan di DOM!");
}

const createBarang = () => {
  document.getElementById("tambahBarangForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Mencegah reload halaman

    // Ambil data dari form
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const price = parseFloat(document.getElementById("price").value);
    const image = document.getElementById("image").files[0]; // Ambil file gambar
    const kategori = document.getElementById("kategori").value;

    // Pastikan semua field terisi
    if (!name || !description || !price || !image || !kategori) {
      alert("Semua field harus diisi.");
      return;
    }

    // Buat FormData
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("image", image);
    formData.append("kategori", kategori);

    try {
      const response = await fetch("/api/produk/create", {
        method: "POST",
        body: formData, // Kirim FormData
      });

      if (response.ok) {
        alert("Produk berhasil ditambahkan!");
        console.log(await response.json());
        location.reload(); // Refresh halaman setelah sukses
      } else {
        const error = await response.json();
        alert(`Gagal menambahkan produk: ${error.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menambahkan produk.");
    }
  });
};

createBarang();
