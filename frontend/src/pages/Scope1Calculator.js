import React, { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import introJs from "intro.js";
import "intro.js/introjs.css";




const Scope1Calculator = () => {
  const [gensetData, setGensetData] = useState([]);
  const [kendaraanData, setKendaraanData] = useState([]);
  const [refrigerantData, setRefrigerantData] = useState([]);
  const [modal, setModal] = useState({ show: false, type: "", index: null });
  const [selectedCampus, setSelectedCampus] = useState(1);  // default kampus 1 (misal Jatinangor)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const bahanBakarFaktor = {
    Solar: { faktor: 2.68, densitas: 0.83 },
    Bensin: { faktor: 2.31, densitas: 0.74 },
    LPG: { faktor: 1.51, densitas: 0.54 },
    CNG: { faktor: 2.75, densitas: 0.75 },
    Biodiesel: { faktor: 2.45, densitas: 0.82 },
    Pertamax: { faktor: 2.27, densitas: 0.74 },
    Avtur: { faktor: 3.15, densitas: 0.80 },
    Kerosene: { faktor: 2.50, densitas: 0.81 },
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch(`https://qssr-app-production.up.railway.app/api/scope1/${selectedCampus}/${selectedYear}`);

      if (res.ok) {
        const data = await res.json();

        if (data.genset?.length) {
          setGensetData(
            data.genset.map((item) => ({
              kode: item.kode || "",
              bahanBakar: item.bahan_bakar || "",
              jumlah: item.jumlah || "",
              satuan: item.satuan || "liter",
              emisiFaktor: item.emisiFaktor || bahanBakarFaktor[item.bahan_bakar]?.faktor || "-",
            }))
          );
        } else {
          setGensetData([]);  // biar bersih kalau pindah kampus
        }

        if (data.kendaraan?.length) {
          setKendaraanData(
            data.kendaraan.map((item) => ({
              kode: item.kode || "",
              jenis: item.jenis || item.tipe || "",
              bahanBakar: item.bahan_bakar || "",
              konsumsi: item.konsumsi || "",
              satuan: item.satuan || "liter",
              unit: item.unit || 1,
              emisiFaktor: item.emisiFaktor || bahanBakarFaktor[item.bahan_bakar]?.faktor || "-",
            }))
          );
        } else {
          setKendaraanData([]);
        }

        if (data.refrigerant?.length) {
          setRefrigerantData(
            data.refrigerant.map((item) => ({
              kode: item.kode || "",
              tempat: item.tempat || "",
              unit: item.unit || 1,
              jenis: item.tipe || "",
              isiPerUnit: item.kapasitas || "",
              kebocoranPersen: item.estimasi_kebocoran || "",
              emisi: item.emisi || "",
            }))
          );
        } else {
          setRefrigerantData([]);
        }

      }
    } catch (err) {
      console.error(err);
    }
  };
  fetchData();
}, [selectedCampus,selectedYear]);  // <== tambahkan dependensi bro


  const handleSave = async () => {
    try {
      const gensetWithEmisi = gensetData.map((item) => {
        const fuel = bahanBakarFaktor[item.bahanBakar] || { faktor: 0, densitas: 1 };
        let jumlahKg = parseFloat(item.jumlah) || 0;
        if (item.satuan === "liter") jumlahKg *= fuel.densitas;
        const emisi = jumlahKg * fuel.faktor;
        return { ...item, emisi: emisi.toFixed(2), emisiFaktor: fuel.faktor };
      });

      const kendaraanWithEmisi = kendaraanData.map((item) => {
        const fuel = bahanBakarFaktor[item.bahanBakar] || { faktor: 0, densitas: 1 };
        let konsumsiKg = parseFloat(item.konsumsi) || 0;
        if (item.satuan === "liter") konsumsiKg *= fuel.densitas;
        const emisi = (parseFloat(item.unit) || 1) * konsumsiKg * fuel.faktor;
        return { ...item, emisi: emisi.toFixed(2), emisiFaktor: fuel.faktor };
      });

      const refrigerantWithEmisi = refrigerantData.map((item) => {
  const GWPTable = {
    "R-22": 1810,
    "R-32": 677,
    "R-134a": 1300,
    "R-410A": 2088,
    "R-1234yf": 4,
  };
  const unit = parseFloat(item.unit) || 1;
  const isi = parseFloat(item.isiPerUnit) || 0;
  const kebocoran = parseFloat(item.kebocoranPersen) || 0;
  const gwp = GWPTable[item.jenis] || 0;
  const emisiTon = unit * isi * (kebocoran/100) * gwp / 1000;
  return {
    ...item,
    kapasitas: isi,                    // 👈 match dengan backend
    estimasiKebocoran: kebocoran,      // 👈 match dengan backend
    emisi: emisiTon.toFixed(2)
  };
});



      const res = await fetch("https://qssr-app-production.up.railway.app/api/scope1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gensetData: gensetWithEmisi,
          kendaraanData: kendaraanWithEmisi,
          refrigerantData: refrigerantWithEmisi,
          campus_id: selectedCampus,
          year: selectedYear,

        }),
      });

      if (res.ok) {
        alert("Data Scope 1 berhasil disimpan!");
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi error.");
    }
  };

  const handleDelete = () => {
    if (modal.type === "genset") {
      setGensetData(gensetData.filter((_, i) => i !== modal.index));
    } else if (modal.type === "kendaraan") {
      setKendaraanData(kendaraanData.filter((_, i) => i !== modal.index));
    } else if (modal.type === "refrigerant") {
      setRefrigerantData(refrigerantData.filter((_, i) => i !== modal.index));
    }
    setModal({ show: false, type: "", index: null });
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Kalkulator Emisi Scope 1</h1>
      <BackButton to="/carbon-calculator" />
      <button
  onClick={() => {
    introJs().setOptions({
      steps: [
        {
          element: ".dropdown-tahun-kampus",
          intro: "Pilih tahun pelaporan dan kampus terlebih dahulu.",
        },
        {
          element: ".total-emisi-scope1",
          intro: "Ringkasan total emisi untuk Genset, Kendaraan, dan Refrigerant.",
        },
        {
          element: ".section-genset",
          intro: "Masukkan data konsumsi bahan bakar Genset / Boiler di sini.",
        },
        {
          element: ".section-kendaraan",
          intro: "Masukkan data konsumsi kendaraan institusi di sini.",
        },
        {
          element: ".section-refrigerant",
          intro: "Isi data jenis dan kebocoran refrigerant AC di sini.",
        },
        {
          element: ".simpan-data-scope1",
          intro: "Klik untuk menyimpan seluruh data Scope 1.",
        },
      ],
      showProgress: true,
      showBullets: false,
      nextLabel: "Lanjut",
      prevLabel: "Kembali",
      doneLabel: "Selesai",
    }).start();
  }}
  className="bg-blue-600 text-white px-3 py-1 rounded mb-4"
>
  🎓 Panduan Pengisian Scope 1
</button>

      <div className="flex gap-2 mb-4 dropdown-tahun-kampus">
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

  <button
    onClick={() => setSelectedCampus(1)}
    className={`px-4 py-2 rounded ${selectedCampus === 1 ? "bg-green-600 text-white" : "bg-gray-200"}`}
  >
    Kampus Jatinangor
  </button>
  <button
    onClick={() => setSelectedCampus(2)}
    className={`px-4 py-2 rounded ${selectedCampus === 2 ? "bg-green-600 text-white" : "bg-gray-200"}`}
  >
    Kampus Ganesha
  </button>
</div>

      {/* total emisi */}
      <div className="mt-8 p-4 bg-gray-100 rounded shadow text-sm total-emisi-scope1">
        <h2 className="text-xl font-bold mb-2">Total Emisi Scope 1</h2>
        <ul className="mb-2">
          <li>🔥 Genset / Boiler: {gensetData.reduce((acc, curr) => {
            const fuel = bahanBakarFaktor[curr.bahanBakar] || { faktor: 0, densitas: 1 };
            let jumlahKg = parseFloat(curr.jumlah) || 0;
            if (curr.satuan === "liter") jumlahKg *= fuel.densitas;
            const emisi = jumlahKg * fuel.faktor;
            return acc + emisi;
          }, 0).toFixed(2)} tCO₂e</li>

          <li>🚗 Kendaraan: {kendaraanData.reduce((acc, curr) => {
            const fuel = bahanBakarFaktor[curr.bahanBakar] || { faktor: 0, densitas: 1 };
            let konsumsiKg = parseFloat(curr.konsumsi) || 0;
            if (curr.satuan === "liter") konsumsiKg *= fuel.densitas;
            const emisi = (parseFloat(curr.unit) || 1) * konsumsiKg * fuel.faktor;
            return acc + emisi;
          }, 0).toFixed(2)} tCO₂e</li>

          <li>❄️ Refrigerant: {refrigerantData.reduce((acc, curr) => {
  const gwpTable = {
    "R-22": 1810,
    "R-32": 677,
    "R-134a": 1300,
    "R-410A": 2088,
    "R-1234yf": 4
  };
  const gwp = gwpTable[curr.jenis] || 0;
  const emisi = (parseFloat(curr.unit) || 1)
    * (parseFloat(curr.isiPerUnit) || 0)
    * (parseFloat(curr.kebocoranPersen) || 0) / 100
    * gwp / 1000;
  return acc + emisi;
}, 0).toFixed(2)} tCO₂e</li>

        </ul>
        <strong>
  Total: {(
    gensetData.reduce((acc, curr) => {
      const fuel = bahanBakarFaktor[curr.bahanBakar] || { faktor: 0, densitas: 1 };
      let jumlahKg = parseFloat(curr.jumlah) || 0;
      if (curr.satuan === "liter") jumlahKg *= fuel.densitas;
      const emisi = jumlahKg * fuel.faktor;
      return acc + emisi;
    }, 0)
    +
    kendaraanData.reduce((acc, curr) => {
      const fuel = bahanBakarFaktor[curr.bahanBakar] || { faktor: 0, densitas: 1 };
      let konsumsiKg = parseFloat(curr.konsumsi) || 0;
      if (curr.satuan === "liter") konsumsiKg *= fuel.densitas;
      const emisi = (parseFloat(curr.unit) || 1) * konsumsiKg * fuel.faktor;
      return acc + emisi;
    }, 0)
    +
    refrigerantData.reduce((acc, curr) => {
      const gwpTable = {
        "R-22": 1810,
        "R-32": 677,
        "R-134a": 1300,
        "R-410A": 2088,
        "R-1234yf": 4
      };
      const gwp = gwpTable[curr.jenis] || 0;
      const emisi = (parseFloat(curr.unit) || 1)
        * (parseFloat(curr.isiPerUnit) || 0)
        * (parseFloat(curr.kebocoranPersen) || 0) / 100
        * gwp / 1000;
      return acc + emisi;
    }, 0)
  ).toFixed(2)} tCO₂e
</strong>

      </div>

      <Section
        title="🔥 Genset / Boiler"
        className="section-genset"
        data={gensetData}
        setData={setGensetData}
        modal={modal}
        setModal={setModal}
        type="genset"
        fields={[
          { label: "Kode / Identifier", key: "kode", type: "text" },
          { label: "Jenis Bahan Bakar", key: "bahanBakar", type: "select", options: Object.keys(bahanBakarFaktor) },
          { label: "Jumlah Konsumsi", key: "jumlah", type: "number" },
          { label: "Satuan", key: "satuan", type: "select", options: ["liter", "kg"] },
        ]}
      />

      <Section
        title="🚗 Kendaraan Institusi"
        className="section-kendaraan"
        data={kendaraanData}
        setData={setKendaraanData}
        modal={modal}
        setModal={setModal}
        type="kendaraan"
        fields={[
          { label: "Kode / Identifier", key: "kode", type: "text" },
          { label: "Jenis Kendaraan", key: "jenis", type: "text" },
          { label: "Unit", key: "unit", type: "number", defaultValue: 1 },
          { label: "Jenis Bahan Bakar", key: "bahanBakar", type: "select", options: Object.keys(bahanBakarFaktor) },
          { label: "Konsumsi / Jarak Tempuh", key: "konsumsi", type: "number" },
          { label: "Satuan", key: "satuan", type: "select", options: ["liter", "kg"] },
        ]}
      />

      <Section
      title="❄️ Refrigerant / AC"
      className="section-refrigerant"
      data={refrigerantData}
      setData={setRefrigerantData}
      modal={modal}
      setModal={setModal}
      type="refrigerant"
      fields={[
        { label: "Kode / Identifier", key: "kode", type: "text" },
        { label: "Tempat Gedung", key: "tempat", type: "text" },
        { label: "Jumlah Unit AC", key: "unit", type: "number", defaultValue: 1 },
        { label: "Jenis Refrigerant", key: "jenis", type: "select", options: ["R-22", "R-32", "R-134a", "R-410A", "R-1234yf"] },
        { label: "Isi Refrigerant per Unit (kg)", key: "isiPerUnit", type: "number" },
        { label: "Persentase Kebocoran Tahunan (%)", key: "kebocoranPersen", type: "number" },
      ]}
    />


      <button
        className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded simpan-data-scope1"
        onClick={handleSave}
      >
        Simpan Semua Data
      </button>
      
      {modal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>Apakah yakin ingin menghapus baris ini?</p>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setModal({ show: false, type: "", index: null })}
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

const Section = ({ title, data, setData, modal, setModal, type, fields,className  }) => {
  const bahanBakarFaktor = {
    Solar: { faktor: 2.68, densitas: 0.83 },
    Bensin: { faktor: 2.31, densitas: 0.74 },
    LPG: { faktor: 1.51, densitas: 0.54 },
    CNG: { faktor: 2.75, densitas: 0.75 },
    Biodiesel: { faktor: 2.45, densitas: 0.82 },
    Pertamax: { faktor: 2.27, densitas: 0.74 },
    Avtur: { faktor: 3.15, densitas: 0.80 },
    Kerosene: { faktor: 2.50, densitas: 0.81 },
  };

  const handleChange = (i, key, value) => {
    const updated = [...data];
    updated[i][key] = value;
    setData(updated);
  };

  const getEmission = (rowItem) => {
  if (type === "genset" || type === "kendaraan") {
    const fuel = bahanBakarFaktor[rowItem.bahanBakar] || { faktor: 0, densitas: 1 };
    let jumlahKg = parseFloat(rowItem.jumlah || rowItem.konsumsi) || 0;
    if (rowItem.satuan === "liter") jumlahKg *= fuel.densitas;
    const unit = parseFloat(rowItem.unit || 1);
    return (jumlahKg * unit * fuel.faktor).toFixed(2);
  }

  if (type === "refrigerant") {
    const GWPTable = {
      "R-22": 1810,
      "R-32": 677,
      "R-134a": 1300,
      "R-410A": 2088,
      "R-1234yf": 4,
    };
    const unit = parseFloat(rowItem.unit || 1);
    const isi = parseFloat(rowItem.isiPerUnit) || 0;
    const kebocoran = parseFloat(rowItem.kebocoranPersen) || 0;
    const gwp = GWPTable[rowItem.jenis] || 0;
    const emisiTon = unit * isi * (kebocoran/100) * gwp / 1000;
    return emisiTon.toFixed(2);
  }

  return "0.00";
};


  return (
    <div className={`mb-10 ${className || ""}`}>
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      {data.map((rowItem, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-9 gap-4 mb-4 items-end">
          {fields.map((field, idx) => (
            <div key={idx} className="md:col-span-1">
              <label className="block text-xs mb-1">{field.label}</label>
              {field.type === "select" ? (
                <select
                  className="border px-2 py-1 rounded w-full text-xs"
                  value={rowItem[field.key] || ""}
                  onChange={(e) => handleChange(i, field.key, e.target.value)}
                >
                  <option value="">Pilih</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.label}
                  className="border px-2 py-1 rounded w-full text-xs"
                  value={rowItem[field.key] || ""}
                  onChange={(e) => handleChange(i, field.key, e.target.value)}
                />
              )}
            </div>
          ))}
          {/* faktor emisi */}
          <div className="md:col-span-1">
            <label className="block text-xs mb-1">Faktor Emisi</label>
            <input
              className="border px-2 py-1 rounded w-full text-xs bg-gray-100"
              value={bahanBakarFaktor[rowItem.bahanBakar]?.faktor || "-"}
              readOnly
            />
          </div>
          {/* emisi */}
          <div className="md:col-span-1">
            <label className="block text-xs mb-1">Emisi (tCO₂e)</label>
            <input
              className="border px-2 py-1 rounded w-full text-xs bg-gray-100"
              value={getEmission(rowItem)}
              readOnly
            />
          </div>
          {/* tombol hapus */}
          <div className="md:col-span-1 flex items-center justify-center mt-6 md:mt-0">
            <button
              className="text-red-600 border border-red-600 px-3 py-1 rounded text-xs hover:bg-red-100 w-full"
              onClick={() => setModal({ show: true, type, index: i })}
            >
              Hapus
            </button>
          </div>
        </div>
      ))}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        onClick={() => {
          const newItem = Object.fromEntries(fields.map((f) => [f.key, f.defaultValue || ""]));
          setData([...data, newItem]);
        }}
      >
        + Tambah Baris
      </button>
    </div>
  );
};

export default Scope1Calculator;
