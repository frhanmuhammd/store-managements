import express from "express";
import mysql from "mysql";
import cors from "cors";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";
import session from "express-session";
import { isAuthenticated, redirectIfAuthenticated } from "./middlewares/authentication.js";

// Mendapatkan direktori saat ini
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Middleware untuk melayani file statis dari folder uploads

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Konfigurasi koneksi database
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "db_frozen",
  connectTimeout: 10000,
  multipleStatements: true,
};

let db = mysql.createConnection(dbConfig);

db.connect((err) => {
  if (err) {
    console.error("Koneksi ke database gagal:", err);
  } else {
    console.log("Terhubung ke database MySQL");
  }
});

// Menangani koneksi terputus
db.on("error", (err) => {
  console.error("Koneksi terputus:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    db = mysql.createConnection(dbConfig);
    db.connect((err) => {
      if (err) {
        console.error("Gagal menyambung kembali:", err);
      } else {
        console.log("Terhubung kembali ke database MySQL");
      }
    });
  } else {
    throw err;
  }
});

// Rute untuk melayani halaman HTML sesuai permintaan
app.get("/", redirectIfAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login_web.html"));
});
app.get("/register", redirectIfAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/home", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.get("/produk", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "produk.html"));
});

app.get("/bahan_burger", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "bahan_burger.html"));
});

app.get("/frozen_food", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "frozen_food.html"));
});

app.get("/bahan_pelengkap", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "bahan_pelengkap.html"));
});

app.get("/pemasukan", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pemasukan.html"));
});

app.get("/pengeluaran", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "pengeluaran.html"));
});

app.get("/profil", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "profil.html"));
});

app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ? AND password = ?";

  db.query(query, [username, password], (err, results) => {
    if (err) {
      res.status(500).json({ message: "Error fetching Item", error: err });
    }

    if (results.length === 0) {
      res.status(404).json({ message: "Password atau username salah" });
    }

    req.session.authenticated = true;
    req.session.user = results[0];

    return res.status(200).json(results[0]);
  });
});

app.post("/auth/register", (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (username === "" || password === "" || confirmPassword === "") {
    return res.status(404).json({ message: "Password atau username salah" });
  }

  if (password !== confirmPassword) {
    return res.status(404).json({ message: "Password tidak sama" });
  }

  const query = "INSERT INTO users (username, password) VALUES (?, ?)";

  db.query(query, [username, password], (err, results) => {
    if (err) {
      res.status(500).json({ message: "Error fetching Item", error: err });
    }

    return res.status(201).json(results);
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("gagal hapus session", err);
    } else {
      res.redirect("/");
    }
  });
});

import productRouter from "./routes/product.js";
import pemasukanRouter from "./routes/pemasukan.js";
import pengeluaranRouter from "./routes/pengeluaran.js";

app.use("/api/produk", productRouter);
app.use("/api/pemasukan", pemasukanRouter);
app.use("/api/pengeluaran", pengeluaranRouter);

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
