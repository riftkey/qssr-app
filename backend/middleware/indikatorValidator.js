export const validateIndikator = (req, res, next) => {
  const isCreate = req.method === "POST";

  const {
    code,
    name,
    category,
    lens_category,
    weight,
    source_data,
    is_active,
    subindikator,
  } = req.body;

  const errors = [];

  if (isCreate && (!code || typeof code !== "string")) {
    errors.push("Code wajib diisi dan harus string");
  }

  if (!name || typeof name !== "string") {
    errors.push("Name wajib diisi dan harus string");
  }

  if (!category || typeof category !== "string") {
    errors.push("Kategori wajib diisi dan harus string");
  }

  if (!lens_category || typeof lens_category !== "string") {
    errors.push("Lensa wajib diisi dan harus string");
  }

  if (typeof weight !== "number" || weight < 0) {
    errors.push("Bobot harus berupa angka >= 0");
  }

  if (!source_data || !["QS", "Institusi"].includes(source_data)) {
    errors.push("Sumber data harus QS atau Institusi");
  }

  if (typeof is_active !== "boolean") {
    errors.push("is_active harus boolean");
  }

  if (subindikator && !Array.isArray(subindikator)) {
    errors.push("Subindikator harus array");
  }

  if (errors.length > 0) {
    return res.status(422).json({ errors });
  }

  next();
};
