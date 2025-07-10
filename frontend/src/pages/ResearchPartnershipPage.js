import React, { useEffect, useState } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";


const ResearchPartnershipPage = () => {
  const [data, setData] = useState([]);
  const [uniquePartners, setUniquePartners] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    const res = await fetch("https://qssr-app-production.up.railway.app/api/research-partnerships");
    const json = await res.json();
    setData(json);

    // hitung hanya perusahaan tidak kosong
    const uniqueCount = new Set(
      json
        .map((d) => d.partner_company?.trim())
        .filter((v) => v && v.length > 0)
    ).size;
    setUniquePartners(uniqueCount);
  } catch (err) {
    console.error("Gagal fetch:", err);
  }
};


  const handleChange = (index, field, value) => {
    const temp = [...data];
    temp[index][field] = value;
    setData(temp);
  };

  const handleAddRow = () => {
    setData((prev) => [
      ...prev,
      {
        research_title: "",
        partner_company: "",
        topic: "",
        author: "",
        faculty: "",
      },
    ]);
  };

  const handleSaveAll = async () => {
    try {
      const res = await fetch("https://qssr-app-production.up.railway.app/api/research-partnerships/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerships: data }),
      });
      if (res.ok) {
        alert("Berhasil disimpan!");
        fetchData();
      } else {
        alert("Gagal menyimpan");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Terjadi kesalahan server.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus data ini?")) return;
    try {
      const res = await fetch(`https://qssr-app-production.up.railway.app/api/research-partnerships/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Gagal menghapus");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleExport = () => {
    window.open("https://qssr-app-production.up.railway.app/api/research-partnerships/export", "_blank");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Kemitraan Penelitian</h1>
        <div className="flex gap-2">
          <a
  href="https://scholar.itb.ac.id/project"
  target="_blank"
  rel="noopener noreferrer"
  className="bg-indigo-600 text-white px-3 py-1 rounded tombol-kemitraan"
>
  Lihat Kemitraan ITB
</a>

          <button
            className="bg-green-600 text-white px-3 py-1 rounded tombol-export"
            onClick={handleExport}
          >
            Export CSV
          </button>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded tombol-simpan"
            onClick={handleSaveAll}
          >
            Simpan Semua
          </button>
          <button
            className="bg-gray-600 text-white px-3 py-1 rounded tombol-tambah"
            onClick={handleAddRow}
          >
            Tambah Baris
          </button>
          <button
  onClick={() => {
    introJs().setOptions({
      steps: [
        {
          element: ".tombol-kemitraan",
          intro: "Klik ini untuk membuka scholar.itb.ac.id dan melihat secara lengkap data kemitraan penelitian ITB.",
        },
        {
          element: ".tombol-export",
          intro: "Klik ini untuk mengunduh data kemitraan penelitian dalam format CSV.",
        },
        {
          element: ".tombol-simpan",
          intro: "Klik untuk menyimpan semua perubahan data ke server.",
        },
        {
          element: ".tombol-tambah",
          intro: "Tambah baris baru untuk mengisi data penelitian baru.",
        },
        {
          element: ".tabel-input",
          intro: "Semua data bisa diedit langsung di tabel ini. Anda juga bisa menghapus baris dengan tombol 'Hapus'.",
        },
        {
          element: ".total-mitra",
          intro: "Jumlah mitra perusahaan unik dalam 5 tahun terakhir akan otomatis dihitung di sini. Hal ini berguna untuk mengestimasi nilai ITB pada Indikator EO5.",
        },
        
      ],
      showProgress: true,
      showBullets: false,
      nextLabel: "Lanjut",
      prevLabel: "Kembali",
      skipLabel: "Lewati",
      doneLabel: "Selesai",
    }).start();
  }}
  className="bg-purple-600 text-white px-3 py-1 rounded"
>
  Mulai Panduan
</button>

        </div>
      </div>

      <div className="text-sm text-gray-600 total-mitra">
        Total Mitra Perusahaan Berbeda 5 Tahun Terakhir:{" "}
        <span className="font-semibold text-black">{uniquePartners}</span>
      </div>

      <div className="overflow-x-auto tabel-input">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              {["Judul Penelitian", "Mitra Perusahaan", "Topik", "Penulis", "Fakultas", "Aksi"].map((h) => (
                <th key={h} className="border p-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((d, idx) => (
              <tr key={idx}>
                {["research_title", "partner_company", "topic", "author", "faculty"].map((f) => (
                  <td key={f} className="border p-1">
                    <input
                      type="text"
                      className="w-full border px-1 py-0.5 rounded"
                      value={d[f] || ""}
                      onChange={(e) => handleChange(idx, f, e.target.value)}
                    />
                  </td>
                ))}
                <td className="border p-1">
                  {d.id && (
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="text-red-600 text-xs"
                    >
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-2">Tidak ada data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResearchPartnershipPage;
