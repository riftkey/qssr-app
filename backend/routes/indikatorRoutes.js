import express from "express";
import { 
  getAllIndikator,
  getIndikatorByKode,
  createIndikator,
  updateIndikator,
  deleteIndikator,
  getIndikatorSummary,
  getLensSummary,
  getLensSummaryInstitusi,
  exportIndikatorCSV,
  exportIndikatorExcel,
} from "../controllers/indikatorController.js";
import { validateIndikator } from "../middleware/indikatorValidator.js";

const router = express.Router();

router.get("/summary", getIndikatorSummary);
router.get("/lens-summary", getLensSummary); // pindahin ke atas
router.get("/lens-summary/institusi", getLensSummaryInstitusi); // Tambahan route baru
router.get("/", getAllIndikator);
router.get("/:kode", getIndikatorByKode); // taruh paling bawah
router.post("/", validateIndikator, createIndikator);
router.put("/:kode", validateIndikator, updateIndikator);
router.delete("/:kode", deleteIndikator);
router.get("/export/csv", exportIndikatorCSV);
router.get("/export/excel", exportIndikatorExcel);






export default router;
