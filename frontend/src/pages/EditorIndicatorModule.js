import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import introJs from "intro.js";
import "intro.js/introjs.css";


const EditorIndikatorModule = () => {
  const navigate = useNavigate();
  const [indikatorList, setIndikatorList] = useState([]);
  const [filterLensa, setFilterLensa] = useState("");

  useEffect(() => {
    fetchIndikator();
  }, []);

  const fetchIndikator = async () => {
    try {
      const res = await fetch("https://qssr-app-production.up.railway.app/api/indikator");
      const data = await res.json();
      setIndikatorList(data);
    } catch (err) {
      console.error("Gagal fetch indikator:", err);
    }
  };

  const handleToggleAktif = async (code, currentStatus) => {
    try {
      const res = await fetch(`https://qssr-app-production.up.railway.app/api/indikator/${code}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (res.ok) {
        fetchIndikator(); // refresh data setelah update
      } else {
        console.error("Gagal update status indikator");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const filteredIndikator = filterLensa
    ? indikatorList.filter((i) => i.lens_category === filterLensa)
    : indikatorList;


    const startTour = () => {
  introJs().setOptions({
    nextLabel: 'Lanjut',
    prevLabel: 'Kembali',
    skipLabel: 'Lewati',
    doneLabel: 'Selesai',
    steps: [
      {
        intro: "Selamat datang di modul editor indikator! Di sini kamu bisa mengelola indikator QSSR."
      },
      {
        element: "#tombol-panduan",
        intro: "Klik tombol ini jika ingin memulai panduan kembali di lain waktu."
      },
      {
        element: "#filter-lensa",
        intro: "Gunakan filter ini untuk menyaring indikator berdasarkan lensa."
      },
      {
        element: "#tabel-indikator",
        intro: "Ini tabel utama berisi seluruh indikator. Kamu bisa melihat subindikator, status aktif, dan edit data."
      },
      {
        element: "#tambah-indikator",
        intro: "Klik tombol ini untuk menambah indikator baru."
      }
    ]
  }).start();
};
const handleDeleteIndikator = async (code) => {
  if (!window.confirm("Yakin ingin menghapus indikator ini? Tindakan ini tidak dapat dibatalkan.")) return;

  try {
    const res = await fetch(`https://qssr-app-production.up.railway.app/api/indikator/${code}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Indikator berhasil dihapus.");
      fetchIndikator(); // refresh daftar
    } else {
      alert("Gagal menghapus indikator.");
    }
  } catch (err) {
    console.error("Gagal delete:", err);
    alert("Terjadi kesalahan saat menghapus indikator.");
  }
};


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
  <h2 className="text-2xl font-bold">Daftar Indikator</h2>
  
  <div className="flex gap-3 items-center" id="tombol-panduan">
    <button
      onClick={startTour}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Mulai Panduan
    </button>
    <a
      href="httpss://support.qs.com/hc/en-gb/articles/8551503200668-QS-World-University-Rankings-Sustainability"
      target="_blank"
      rel="noopener noreferrer"
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Lihat Indikator Tahun Ini
    </a>
    <div className="flex items-center gap-2" id="filter-lensa">
      <label className="font-semibold">Filter Lensa:</label>
      <select
        className="border rounded p-2"
        value={filterLensa}
        onChange={(e) => setFilterLensa(e.target.value)}
      >
        <option value="">Semua</option>
        {Array.from(new Set(indikatorList.map(i => i.lens_category))).map((lens, idx) => (
          <option key={idx} value={lens}>{lens}</option>
        ))}
      </select>
    </div>
  </div>
</div>

      <div className="border rounded-xl p-4 shadow bg-white" id="tabel-indikator">
        <table className="w-full border-collapse border text-sm">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="border p-2">Kode</th>
              <th className="border p-2">Nama</th>
              <th className="border p-2">Kategori</th>
              <th className="border p-2">Lensa</th>
              <th className="border p-2">Bobot</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredIndikator.map((item, index) => (
              <tr key={index}>
                <td className="border p-2">{item.code}</td>
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">{item.category}</td>
                <td className="border p-2">{item.lens_category}</td>
                <td className="border p-2">{item.weight}</td>
                <td className="border p-2">
                  <div className="flex items-center gap-2">
                    <span>{item.is_active ? "Aktif" : "Nonaktif"}</span>
                    <input
                      type="checkbox"
                      checked={item.is_active}
                      onChange={() => handleToggleAktif(item.code, item.is_active)}
                    />
                  </div>
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => navigate(`/edit-indikator/${item.code}`)}
                    className="bg-yellow-500 px-2 py-1 rounded text-white"
                  >
                    Edit
                  </button>
                  
                </td>
              </tr>
            ))}
            {filteredIndikator.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-4">Tidak ada indikator.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end" >
        <button id="tambah-indikator"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => navigate("/add-indikator")}
        >
          Tambah Indikator
        </button>
      </div>
    </div>
  );
};

export default EditorIndikatorModule;
