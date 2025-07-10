import express from 'express';
import { upload, uploadFileToSupabase } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/upload', upload, uploadFileToSupabase);

export default router;
