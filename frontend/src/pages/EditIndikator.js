import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditIndikator = () => {
  const navigate = useNavigate();
  const { kode } = useParams();

  const [form, setForm] = useState({
    kode: "",
    nama: "",
    deskripsi: "",
    kategori: "",
    lensa: "",
    bobot: 0,
    sumber: "",
    hyperlinkQS: "",
    is_active : true, // ✅ tambahkan ini
  });

  const [subindikatorList, setSubindikatorList] = useState([]);

  const fetchIndikatorByKode = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/indikator/${kode}`);
      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        kode: data.code,
        nama: data.name,
        deskripsi: data.description || "",
        kategori: data.category || "",
        lensa: data.lens_category || "",
        bobot: data.weight || 0,
        sumber: data.source_data || "",
        hyperlinkQS: data.external_link || "",
        is_active: data.is_active || true, // ✅ tambahkan ini
      }));

      setSubindikatorList(
        Array.isArray(data.sub_indicators)
          ? data.sub_indicators.map((sub) =>
              typeof sub === "string"
                ? {
                    nama: sub,
                  }
                : {
                    nama: sub?.nama || "",
                  }
            )
          : []
      );
    } catch (err) {
      console.error("Gagal ambil data indikator:", err);
    }
  };

  useEffect(() => {
    fetchIndikatorByKode();
  }, [kode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddSubindikator = () => {
    setSubindikatorList([...subindikatorList, { nama: "" }]);
  };

  const handleDeleteSubindikator = (index) => {
    const updated = subindikatorList.filter((_, i) => i !== index);
    setSubindikatorList(updated);
  };

  const handleSubindikatorChange = (index, field, value) => {
    const updated = subindikatorList.map((sub, i) =>
      i === index ? { ...sub, [field]: value } : sub
    );
    setSubindikatorList(updated);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.kode || !form.nama || form.bobot < 0) {
    alert("Pastikan semua field diisi dengan benar dan bobot >= 0");
    return;
  }

  const payload = {
    code: form.kode,
    name: form.nama,
    description: form.deskripsi,
    category: form.kategori,
    lens_category: form.lensa,
    weight: parseFloat(form.bobot),
    source_data: form.sumber,
    external_link: form.hyperlinkQS,
    is_active: form.is_active,
    subindikator: subindikatorList.map((s) => ({ name: s.nama })),
  };

  try {
    const res = await fetch(`http://localhost:5000/api/indikator/${form.kode}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Gagal simpan perubahan indikator");
    }

    alert("Berhasil menyimpan perubahan indikator.");
    navigate("/editor-indikator");
  } catch (err) {
    console.error("Error simpan:", err);
    alert("Terjadi kesalahan saat menyimpan.");
  }
};
const handleDelete = async () => {
  if (!window.confirm("Apakah kamu yakin ingin menghapus indikator ini?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/indikator/${form.kode}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Gagal menghapus indikator");

    alert("Indikator berhasil dihapus.");
    navigate("/editor-indikator");
  } catch (err) {
    console.error("Error hapus:", err);
    alert("Terjadi kesalahan saat menghapus.");
  }
};




  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Edit Indikator</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Kode</label>
          <input
            className="border rounded p-2 w-full"
            name="kode"
            value={form.kode}
            onChange={handleChange}
            readOnly
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Nama</label>
          <input
            className="border rounded p-2 w-full"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Deskripsi</label>
          <textarea
            className="border rounded p-2 w-full"
            name="deskripsi"
            value={form.deskripsi}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Kategori</label>
          <input
            className="border rounded p-2 w-full"
            name="kategori"
            value={form.kategori}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Lensa</label>
          <input
            className="border rounded p-2 w-full"
            name="lensa"
            value={form.lensa}
            onChange={handleChange}
            required
            placeholder="Contoh: Lingkungan / Sosial / Governance"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Bobot</label>
          <input
            className="border rounded p-2 w-full"
            type="number"
            name="bobot"
            value={form.bobot}
            onChange={handleChange}
            min={0}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Sumber Data</label>
          <select
            className="border rounded p-2 w-full"
            name="sumber"
            value={form.sumber}
            onChange={handleChange}
            required
          >
            <option value="">Pilih Sumber</option>
            <option value="QS">QS</option>
            <option value="Institusi">Institusi</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, is_active: e.target.checked }))
            }
          />
          <label className="font-semibold">Aktifkan Indikator</label>
        </div>


        {form.sumber === "QS" && (
          <div className="border p-4 bg-gray-50 rounded space-y-2 mt-4">
            <label className="block font-semibold mb-1">
              Hyperlink Data QS
            </label>
            <input
              className="border rounded p-2 w-full"
              name="hyperlinkQS"
              value={form.hyperlinkQS}
              onChange={handleChange}
              placeholder="https://...."
            />
          </div>
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
              <div>
                <label className="block font-semibold mb-1">Nama Subindikator</label>
                <input
                  className="border rounded p-2 w-full"
                  value={sub.nama}
                  onChange={(e) =>
                    handleSubindikatorChange(index, "nama", e.target.value)
                  }
                  required
                />
              </div>
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
            Simpan Perubahan
          </button>
          
  <button
    type="button"
    onClick={handleDelete}
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
  >
    Hapus Indikator
  </button>

        </div>
      </form>
    </div>
  );
};

export default EditIndikator;
