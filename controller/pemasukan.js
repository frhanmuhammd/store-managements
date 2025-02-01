import mysql from "mysql";
import dayjs from "dayjs";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "db_frozen",
  connectTimeout: 10000,
  multipleStatements: true,
};

let db = mysql.createConnection(dbConfig);

// Get all Pemasukans
export const getAllPemasukan = (req, res) => {
  const query = "SELECT * FROM pemasukan";
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ message: "Error fetching Pemasukan", error: err });
    } else {
      res.status(200).json(results);
    }
  });
};

// Get Pemasukan by ID
export const getPemasukanById = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM pemasukan WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ message: "Error fetching Pemasukan", error: err });
    } else if (results.length === 0) {
      res.status(404).json({ message: "Pemasukan not found" });
    } else {
      res.status(200).json(results[0]);
    }
  });
};

// Create a new Pemasukan
export const createPemasukan = (req, res) => {
  const { name, harga, jumlah, tanggal, kategori } = req.body;

  if (!name || !harga || !jumlah || !tanggal || !kategori) {
    return res.status(400).json({ message: "Pastikan semua field telah diisi." });
  }
  const currentDate = dayjs().format("YYYY-MM-DD");

  // Konversi tanggal input ke format yang sama
  const inputDate = dayjs(req.body.tanggal).format("YYYY-MM-DD");

  console.log("Current Date:", currentDate, "Input Date: ", inputDate);

  // Cek apakah nama dan tanggal sama dengan data yang ada di database
  const checkQuery = `
     SELECT * FROM pemasukan WHERE nama = ? AND DATE(created_at) = ?
    `;

  db.query(checkQuery, [name, currentDate], (err, results) => {
    if (err) {
      console.error("Error checking data:", err);
      return res.status(500).json({ message: "Terjadi kesalahan saat memeriksa data.", error: err });
    }

    if (results.length > 0) {
      // Jika data dengan nama dan tanggal hari ini sudah ada, update jumlah
      const existingJumlah = results[0].jumlah;
      const newJumlah = existingJumlah + jumlah;

      const updateQuery = `
          UPDATE pemasukan SET jumlah = ? WHERE nama = ? AND tanggal = ?
        `;

      db.query(updateQuery, [newJumlah, name, currentDate], (err) => {
        if (err) {
          console.error("Error updating data:", err);
          return res.status(500).json({ message: "Gagal memperbarui jumlah.", error: err });
        }
        return res.status(200).json({ message: "Jumlah produk berhasil diperbarui." });
      });
    } else {
      // Jika data dengan nama dan tanggal berbeda, buat data baru
      const insertQuery = `
          INSERT INTO pemasukan (nama, harga, tanggal, jumlah, kategori)
          VALUES (?, ?, ?, ?, ?)
        `;

      db.query(insertQuery, [name, harga, currentDate, jumlah, kategori], (err, results) => {
        if (err) {
          console.error("Error inserting data:", err);
          return res.status(500).json({ message: "Gagal menambahkan produk.", error: err });
        }
        return res.status(201).json({ message: "Produk berhasil ditambahkan.", id: results.insertId });
      });
    }
  });
};

// Update a Pemasukan
export const updatePemasukan = (req, res) => {
  const { id } = req.params;
  const { name, harga, jumlah, tanggal, kategori } = req.body;

  const query = "UPDATE pemasukan SET nama = ?, harga = ?, tanggal = ?, jumlah = ?, kategori = ? WHERE id = ?";
  db.query(query, [name, harga, tanggal, jumlah, kategori, id], (err) => {
    if (err) {
      res.status(500).json({ message: "Error updating Pemasukan", error: err });
    } else {
      res.status(200).json({ message: "Pemasukan updated" });
    }
  });
};

// Delete a Pemasukan
export const deletePemasukan = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM pemasukan WHERE id = ?";
  db.query(query, [id], (err) => {
    if (err) {
      res.status(500).json({ message: "Error deleting Pemasukan", error: err });
    } else {
      res.json({ message: "Pemasukan deleted" });
    }
  });
};
