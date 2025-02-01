import express from "express";
const router = express.Router();
import { createPemasukan, deletePemasukan, getAllPemasukan, getPemasukanById, updatePemasukan } from "../controller/pemasukan.js";

import { isAuthenticated } from "../middlewares/authentication.js";

router.get("/", isAuthenticated, getAllPemasukan);
router.post("/create", isAuthenticated, createPemasukan);
router.get("/:id", isAuthenticated, getPemasukanById);
router.put("/:id", isAuthenticated, updatePemasukan);
router.delete("/:id", isAuthenticated, deletePemasukan);

export default router;
