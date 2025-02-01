import express from "express";
const router = express.Router();
import { createItem, deleteItem, getAllItem, getItemById, updateItem } from "../controller/pengeluaran.js";
import { isAuthenticated } from "../middlewares/authentication.js";

router.get("/", isAuthenticated, getAllItem);
router.post("/create", isAuthenticated, createItem);
router.get("/:id", isAuthenticated, getItemById);
router.put("/:id", isAuthenticated, updateItem);
router.delete("/:id", isAuthenticated, deleteItem);

export default router;
