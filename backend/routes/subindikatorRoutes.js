import express from "express";
import {
  getAllSubindikator,
  getSubindikatorById,
  createSubindikator,
  updateSubindikator,
  deleteSubindikator
} from "../controllers/subindikatorController.js";

const router = express.Router();

router.get("/", getAllSubindikator);
router.get("/:id", getSubindikatorById);
router.post("/", createSubindikator);
router.put("/:id", updateSubindikator);
router.delete("/:id", deleteSubindikator);

export default router;
