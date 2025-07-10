import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddIndikator = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    kode: "",
    nama: "",
    deskripsi: "",
    kategori: "",
    lensa: "",
    bobot: 0,
    sumber: "",
    hyperlinkQS: "",
  });

  const [subindikatorList, setSubindikatorList] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddSubindikator = () => {
    setSubindikatorList([...subindikatorList, { nama: "" }]);
  };

  const handleDeleteSubindikator = (index) => {
    setSubindikatorList(subindikatorList.filter((_, i) => i !== index));
  };

  const handleSubindikatorChange = (index, value) => {
    const updated = subindikatorList.map((sub, i) =>
      i === index ? { nama: value } : sub
    );
    setSubindikatorList(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.kode || !form.nama || !form.kategori || !form.lensa || form.bobot < 0 || !form.sumber) {
      return alert("Pastikan semua field wajib diisi dengan benar");
    }

    try {
      const res = await fetch("https://qssr-app-production.up.railway.app/api/indikator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.kode,
          name: form.nama,
          description: form.deskripsi || null,
          category: form.kategori,
          lens_category: form.lensa,
          weight: parseFloat(form.bobot),
          source_data: form.sumber,
          external_link: form.hyperlinkQS || null,
          is_active: true,
          subindikator: subindikatorList.map((s) => ({
            name: s.nama,
            description: null,
          })),
        }),
      });

      if (!res.ok) throw new Error("Gagal menambahkan indikator");

      alert("Indikator berhasil ditambahkan");
      navigate("/editor-indikator");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan indikator");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Tambah Indikator Baru</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Kode" name="kode" value={form.kode} onChange={handleChange} required />
        <Input label="Nama" name="nama" value={form.nama} onChange={handleChange} required />
        <TextArea label="Deskripsi" name="deskripsi" value={form.deskripsi} onChange={handleChange} />
        <Input label="Kategori" name="kategori" value={form.kategori} onChange={handleChange} required />
        <Input label="Lensa" name="lensa" value={form.lensa} onChange={handleChange} required placeholder="Contoh: Lingkungan / Sosial / Governance" />
        <Input label="Bobot" name="bobot" type="number" min={0} value={form.bobot} onChange={handleChange} required />

        <div>
          <label className="block font-semibold mb-1">Sumber Data</label>
          <select
            className="border rounded p-2 w-full"
            name="sumber"
            value={form.sumber}
            onChange={handleChange}
            required
          >
            <option value="">Pilih Sumber Data</option>
            <option value="QS">QS</option>
            <option value="Institusi">Institusi</option>
          </select>
        </div>

        {form.sumber === "QS" && (
          <Input
            label="Hyperlink Data QS"
            name="hyperlinkQS"
            value={form.hyperlinkQS}
            onChange={handleChange}
            placeholder="httpss://...."
          />
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center mt-4">
            <h3 className="text-xl font-bold">Subindikator</h3>
            <button
              type="button"
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={handleAddSubindikator}
            >
              Tambah Subindikator
            </button>
          </div>

          {subindikatorList.map((sub, index) => (
            <div
              key={index}
              className="border rounded p-4 bg-gray-50 space-y-2"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Subindikator #{index + 1}</h4>
                <button
                  type="button"
                  className="text-red-600 text-sm"
                  onClick={() => handleDeleteSubindikator(index)}
                >
                  Hapus
                </button>
              </div>
              <Input
                label="Nama Subindikator"
                value={sub.nama}
                onChange={(e) => handleSubindikatorChange(index, e.target.value)}
                required
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="bg-gray-400 text-white px-4 py-2 rounded"
            onClick={() => navigate("/editor-indikator")}
          >
            Batal
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
};

// Reusable input components
const Input = ({ label, ...props }) => (
  <div>
    <label className="block font-semibold mb-1">{label}</label>
    <input className="border rounded p-2 w-full" {...props} />
  </div>
);

const TextArea = ({ label, ...props }) => (
  <div>
    <label className="block font-semibold mb-1">{label}</label>
    <textarea className="border rounded p-2 w-full" rows={4} {...props} />
  </div>
);

export default AddIndikator;
