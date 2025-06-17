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

// Get all products
export const getAllProducts = (req, res) => {
  const query = "SELECT * FROM produk";
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ message: "Error fetching products", error: err });
    } else {
      res.status(200).json(results);
    }
  });
};

// Get product by ID
export const getProductById = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM produk WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ message: "Error fetching product", error: err });
    } else if (results.length === 0) {
      res.status(404).json({ message: "Product not found" });
    } else {
      res.status(200).json(results[0]);
    }
  });
};

// Create a new product
export const createProduct = (req, res) => {
  const { name, description, price, kategori } = req.body;

  const image = req.file ? req.file.filename : null;

  console.log(name, description, price, image, kategori);
  if (!name || !description || !price || !image || !kategori) {
    return res.status(400).json({ message: "Semua field harus diisi." });
  }

  const query = `
      INSERT INTO produk (nama, deskripsi, harga, gambar, kategori)
      VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [name, description, price, image, kategori], (err, results) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ message: "Gagal menambahkan produk.", error: err });
    }
    res.status(201).json({ message: "Produk berhasil ditambahkan.", id: results.insertId });
  });
};

// Update a product
export const updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, description, price, kategori, imagePath } = req.body;

  const image = req.file ? req.file.filename : imagePath;

  console.log(image);
  const query = "UPDATE produk SET nama = ?, deskripsi = ?, harga = ?, gambar = ?, kategori = ? WHERE id = ?";
  db.query(query, [name, description, price, image, kategori, id], (err) => {
    if (err) {
      res.status(500).json({ message: "Error updating product", error: err });
    } else {
      res.status(200).json({ message: "Product updated" });
    }
  });
};

// Delete a product
export const deleteProduct = (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM produk WHERE id = ?";
  db.query(query, [id], (err) => {
    if (err) {
      res.status(500).json({ message: "Error deleting product", error: err });
    } else {
      res.json({ message: "Product deleted" });
    }
  });
};
