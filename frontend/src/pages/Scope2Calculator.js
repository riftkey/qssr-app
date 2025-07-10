import React, { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import introJs from "intro.js";
import "intro.js/introjs.css";


const Scope2Calculator = () => {
  const [data, setData] = useState([
    { lokasi: "", konsumsi: "", faktor: 0.00085, emisi: 0 }
  ]);
  const [selectedCampus, setSelectedCampus] = useState("ganesha");

  const [modal, setModal] = useState({ show: false, index: null });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());


  const handleChange = (i, key, value) => {
    const updated = [...data];
    updated[i][key] = value;

    // hitung emisi otomatis
    const konsumsi = parseFloat(updated[i].konsumsi) || 0;
    const faktor = 0.00085; // fix
    updated[i].faktor = faktor; // fix supaya tidak berubah
    updated[i].emisi = konsumsi * faktor;

    setData(updated);
  };

  const handleDelete = () => {
    setData(data.filter((_, i) => i !== modal.index));
    setModal({ show: false, index: null });
  };

  const handleSave = async () => {
    try {
      await fetch(
        `https://qssr-app-production.up.railway.app/api/scope2/${selectedCampus}/${selectedYear}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        }
      );
      alert("Data berhasil disimpan");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data.");
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch(
          `https://qssr-app-production.up.railway.app/api/scope2/${selectedCampus}/${selectedYear}`
        );

      if (res.ok) {
  const d = await res.json();
  console.log("DATA FETCHED:", d); // biar bisa dicek di console
  if (d.length) {
    setData(
      d.map((item) => ({
        lokasi: item.lokasi,
        konsumsi: item.konsumsi,
        faktor: 0.00085,
        emisi: item.emisi,
      }))
    );
  } else {
    setData([]);  // <--- dikosongkan
  }
}

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCampus,selectedYear]);

  const totalEmisi = data.reduce(
    (acc, curr) => acc + (parseFloat(curr.emisi) || 0),
    0
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Kalkulator Emisi Scope 2 (Listrik)</h1>
      <BackButton to="/carbon-calculator" className="mb-4" />

<button
  onClick={() => {
    introJs().setOptions({
      steps: [
        {
          element: ".dropdown-kampus-tahun",
          intro: "Pilih kampus dan tahun pelaporan terlebih dahulu.",
        },
        {
          element: ".info-faktor-emisi",
          intro: "Faktor emisi listrik ini sudah ditentukan oleh Kementerian ESDM.",
        },
        {
          element: ".summary-scope2",
          intro: "Ini adalah total emisi listrik (Scope 2) berdasarkan data yang kamu input.",
        },
        {
          element: ".input-scope2",
          intro: "Isi nama lokasi dan konsumsi listrik di sini. Emisi akan dihitung otomatis.",
        },
        {
          element: ".tombol-tambah-scope2",
          intro: "Klik untuk menambahkan baris data konsumsi listrik baru.",
        },
        {
          element: ".tombol-simpan-scope2",
          intro: "Klik untuk menyimpan semua data ke sistem.",
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
  className="bg-blue-600 text-white px-3 py-1 rounded mb-4"
>
  ⚡ Panduan Pengisian Emisi Listrik
</button>

      {/* tombol pilihan kampus */}
      <div className="dropdown-kampus-tahun">
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            selectedCampus === "ganesha"
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setSelectedCampus("ganesha")}
        >
          Ganesha
        </button>
        <button
          className={`px-4 py-2 rounded ${
            selectedCampus === "jatinangor"
              ? "bg-green-600 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setSelectedCampus("jatinangor")}
        >
          Jatinangor
        </button>
      </div>
          <div className="flex items-center gap-2 mb-4">
  <label className="text-sm">Tahun Pelaporan:</label>
  <select
    className="border rounded px-2 py-1 text-sm"
    value={selectedYear}
    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
  >
    {Array.from({ length: 6 }, (_, i) => 2020 + i).map((y) => (
      <option key={y} value={y}>{y}</option>
    ))}
  </select>
</div>
</div>

      {/* info faktor emisi */}
      <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded text-sm info-faktor-emisi">
        Faktor emisi ditetapkan <strong>0.00085 tCO₂e per kWh</strong> berdasarkan
        dokumen
        <a
          href="https://gatrik.esdm.go.id/assets/uploads/download_index/files/96d7c-nilai-fe-grk-sistem-ketenagalistrikan-tahun-2019.pdf"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline ml-1"
        >
          FAKTOR EMISI GRK SISTEM KETENAGALISTRIKAN 2019 oleh Kementerian ESDM
        </a>
        .
      </div>

      {/* total emisi */}
      <div className="mb-4 p-3 bg-gray-100 rounded shadow text-sm summary-scope2">
        Total Emisi Scope 2 kampus <strong>{selectedCampus}</strong> tahun {selectedYear}:{" "}
        <strong className="text-green-700">{totalEmisi.toFixed(4)} tCO₂e</strong>
      </div>

      {data.map((row, i) => (
        <div
          key={i}
          className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 items-end input-scope2"
        >
          <div>
            <label className="text-sm block mb-1">Nama Lokasi</label>
            <input
              type="text"
              value={row.lokasi}
              onChange={(e) => handleChange(i, "lokasi", e.target.value)}
              className="border px-2 py-1 rounded w-full text-sm"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Konsumsi (kWh)</label>
            <input
              type="number"
              value={row.konsumsi}
              onChange={(e) => handleChange(i, "konsumsi", e.target.value)}
              className="border px-2 py-1 rounded w-full text-sm"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Faktor Emisi (fixed)</label>
            <input
              type="number"
              step="0.00001"
              value={0.00085}
              readOnly
              className="border px-2 py-1 rounded w-full text-sm bg-gray-100"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Emisi (tCO₂e)</label>
            <input
              type="text"
              readOnly
              value={row.emisi.toFixed(4)}
              className="border px-2 py-1 rounded w-full text-sm bg-gray-100"
            />
          </div>
          <div className="flex items-center justify-center mt-6">
            <button
              className="text-red-600 border border-red-600 px-3 py-1 rounded text-sm hover:bg-red-100"
              onClick={() => setModal({ show: true, index: i })}
            >
              Hapus
            </button>
          </div>
        </div>
      ))}

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mt-2 tombol-tambah-scope2"
        onClick={() =>
          setData([
            ...data,
            { lokasi: "", konsumsi: "", faktor: 0.00085, emisi: 0 }
          ])
        }
      >
        + Tambah Baris
      </button>

      <button
        className="ml-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded mt-2 tombol-simpan-scope2"
        onClick={handleSave}
      >
        Simpan Data
      </button>

      {/* modal hapus */}
      {modal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-lg mb-4">Hapus baris ini?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setModal({ show: false, index: null })}
              >
                Batal
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={handleDelete}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scope2Calculator;
