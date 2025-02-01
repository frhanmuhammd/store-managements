import dayjs from "dayjs";
import mysql from "mysql";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "db_frozen",
  connectTimeout: 10000,
  multipleStatements: true,
};

let db = mysql.createConnection(dbConfig);

// Get all Items
export const getAllItem = (req, res) => {
  const query = "SELECT * FROM pengeluaran";
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ message: "Error fetching Item", error: err });
    } else {
      res.status(200).json(results);
    }
  });
};

// Get Item by ID
export const getItemById = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM pengeluaran WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ message: "Error fetching Item", error: err });
    } else if (results.length === 0) {
      res.status(404).json({ message: "Item not found" });
    } else {
      res.status(200).json(results[0]);
    }
  });
};

// Create a new Item
export const createItem = (req, res) => {
  const { name, harga, tanggal, jumlah } = req.body;

  if (!name || !harga || !jumlah || !tanggal) {
    return res.status(400).json({ message: "Semua field harus diisi." });
  }

  const currentDate = dayjs().format("YYYY-MM-DD");

  const insertQuery = `
          INSERT INTO pengeluaran (nama, harga, tanggal, jumlah)
          VALUES (?, ?, ?, ?)
        `;

  db.query(insertQuery, [name, harga, currentDate, jumlah], (err, results) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ message: "Gagal menambahkan Item.", error: err });
    }
    res.status(201).json({ message: "Item berhasil ditambahkan.", id: results.insertId });
  });
};

// Update a Item
export const updateItem = (req, res) => {
  const { id } = req.params;
  const { name, harga, jumlah } = req.body;

  const currentDate = dayjs().format("YYYY-MM-DD");

  const query = "UPDATE pengeluaran SET nama = ?, harga = ?, tanggal = ?, jumlah = ? WHERE id = ?";
  db.query(query, [name, harga, currentDate, jumlah, id], (err) => {
    if (err) {
      res.status(500).json({ message: "Error updating Item", error: err });
    } else {
      res.status(200).json({ message: "Item updated" });
    }
  });
};

// Delete a Item
export const deleteItem = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM pengeluaran WHERE id = ?";
  db.query(query, [id], (err) => {
    if (err) {
      res.status(500).json({ message: "Error deleting Item", error: err });
    } else {
      res.json({ message: "Item deleted" });
    }
  });
};
