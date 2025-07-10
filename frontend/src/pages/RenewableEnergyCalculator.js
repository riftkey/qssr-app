import React, { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import introJs from "intro.js";
import "intro.js/introjs.css";

const RenewableEnergyCalculator = () => {
  const [data, setData] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState("ganesha");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [modal, setModal] = useState({ show: false, index: null });

  const kategoriSumber = [
    "Solar Electric Panels (PV)",
    "Solar Thermal Panels (air panas)",
    "Biomass-Fueled Boilers",
    "Wind Turbines",
    "Ground Source Heat Pumps",
    "Lainnya"
  ];

  const handleChange = (i, key, value) => {
    const updated = [...data];
    updated[i][key] = value;
    setData(updated);
  };

  const handleDelete = () => {
    setData(data.filter((_, i) => i !== modal.index));
    setModal({ show: false, index: null });
  };

  const handleSave = async () => {
    try {
      await fetch(
        `http://localhost:5000/api/renewable/${selectedCampus}/${selectedYear}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        }
      );
      alert("Data berhasil disimpan");
      fetchData(); // refresh
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data energi terbarukan.");
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/renewable/${selectedCampus}/${selectedYear}`
      );
      if (res.ok) {
        const d = await res.json();
        if (d.length) {
          setData(
            d.map((item) => ({
              sumber: item.sumber,
              nama: item.nama,
              amount: item.amount,
            }))
          );
        } else {
          setData([]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCampus, selectedYear]);

  const totalEnergi = data.reduce(
    (acc, curr) => acc + (parseFloat(curr.amount) || 0),
    0
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Kalkulator Energi Terbarukan</h1>
      <button
  onClick={() => {
    introJs().setOptions({
      steps: [
        {
          element: ".dropdown-kampus-tahun",
          intro: "Pilih kampus dan tahun pelaporan terlebih dahulu.",
        },
        {
          element: ".summary-renewable",
          intro: "Total seluruh energi terbarukan yang digunakan pada tahun dan kampus ini.",
        },
        {
          element: ".input-renewable",
          intro: "Isi kategori sumber, nama alat/lokasi, dan jumlah energi yang dihasilkan.",
        },
        {
          element: ".tombol-tambah-renewable",
          intro: "Klik di sini untuk menambahkan sumber energi terbarukan baru.",
        },
        {
          element: ".tombol-simpan-renewable",
          intro: "Setelah selesai, klik untuk menyimpan semua data.",
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
   Panduan Pengisian Energi Terbarukan
</button>


      {/* Pilih kampus + tahun */}
      <div className="dropdown-kampus-tahun">
  
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            selectedCampus === "ganesha" ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setSelectedCampus("ganesha")}
        >
          Ganesha
        </button>
        <button
          className={`px-4 py-2 rounded ${
            selectedCampus === "jatinangor" ? "bg-green-600 text-white" : "bg-gray-200"
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

      <div className="mb-4 p-3 bg-gray-100 rounded shadow text-sm summary-renewable">
        Total energi terbarukan kampus <strong>{selectedCampus}</strong> tahun {selectedYear}:{" "}
        <strong className="text-green-700">{totalEnergi.toFixed(2)} kWh</strong>
      </div>

      {data.map((row, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 items-end input-renewable">
          <div>
            <label className="text-sm block mb-1">Kategori Sumber</label>
            <select
              value={row.sumber}
              onChange={(e) => handleChange(i, "sumber", e.target.value)}
              className="border px-2 py-1 rounded w-full text-sm"
            >
              {kategoriSumber.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm block mb-1">Nama Alat / Lokasi</label>
            <input
              type="text"
              value={row.nama}
              onChange={(e) => handleChange(i, "nama", e.target.value)}
              className="border px-2 py-1 rounded w-full text-sm"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Energi (kWh)</label>
            <input
              type="number"
              value={row.amount}
              onChange={(e) => handleChange(i, "amount", e.target.value)}
              className="border px-2 py-1 rounded w-full text-sm"
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
        className="bg-blue-600 text-white px-4 py-2 rounded mt-2 tombol-tambah-renewable"
        onClick={() =>
          setData([...data, { sumber: "", nama: "", amount: "" }])
        }
      >
        + Tambah Sumber
      </button>

      <button
        className="ml-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded mt-2 tombol-simpan-renewable"
        onClick={handleSave}
      >
        Simpan Data
      </button>

      {modal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-lg mb-4">Hapus sumber ini?</p>
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

export default RenewableEnergyCalculator;
