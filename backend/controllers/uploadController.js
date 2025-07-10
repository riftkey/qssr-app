import supabase from '../supabaseClient.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';

const storage = multer.memoryStorage();
export const upload = multer({ storage }).single('file');

export const uploadFileToSupabase = async (req, res) => {
  const file = req.file;
  const filename = `${uuidv4()}_${file.originalname}`;

  const { data, error } = await supabase.storage
    .from('qssr-files')
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const { data: urlData } = supabase
    .storage
    .from('qssr-files')
    .getPublicUrl(filename); // atau generate signed URL jika private

  return res.status(200).json({ url: urlData.publicUrl });
};
