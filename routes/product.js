import express from "express";
const router = express.Router();
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controller/product.js";
import upload from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/authentication.js";

const handleUpdateUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      // Jika error upload tapi ada imagePath (gambar lama), lanjutkan
      if (err.message === "Only images are allowed" && req.body.imagePath) {
        return next();
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.get("/", isAuthenticated, getAllProducts);
router.post("/create", upload.single("image"), isAuthenticated, createProduct);
router.get("/:id", isAuthenticated, getProductById);
router.put("/:id", upload.single("image"), isAuthenticated, updateProduct);
router.delete("/:id", isAuthenticated, deleteProduct);

export default router;
