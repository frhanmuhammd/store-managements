import express from "express";
const router = express.Router();
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controller/product.js";
import upload from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/authentication.js";

router.get("/", isAuthenticated, getAllProducts);
router.post("/create", upload.single("image"), isAuthenticated, createProduct);
router.get("/:id", isAuthenticated, getProductById);
router.put("/:id", upload.single("image"), isAuthenticated, updateProduct);
router.delete("/:id", isAuthenticated, deleteProduct);

export default router;
