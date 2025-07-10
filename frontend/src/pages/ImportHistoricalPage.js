import React, { useState, useEffect } from "react";

const ImportHistoricalPage = () => {
  const [indikatorList, setIndikatorList] = useState([]);
  const [selectedSourceYear, setSelectedSourceYear] = useState(2024);
  const [selectedTargetYear, setSelectedTargetYear] = useState(2025);
  const [selectedIndicators, setSelectedIndicators] = useState([]);
//   const [previewData, setPreviewData] = useState([]);


  useEffect(() => {
    const fetchIndikator = async () => {
      try {
        const res = await fetch("http://qssr-app-production.up.railway.app/api/indikator");
        const data = await res.json();
        setIndikatorList(data);
      } catch (err) {
        console.error("Gagal fetch indikator:", err);
      }
    };
    fetchIndikator();
  }, []);

  const handleCheckboxChange = (id) => {
    setSelectedIndicators((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };
//   const handlePreview = async () => {
//   try {
//     const res = await fetch("http://qssr-app-production.up.railway.app/api/data-collection/preview-import", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         fromYear: selectedSourceYear,
//         indicators: selectedIndicators,
//       }),
//     });
//     const data = await res.json();
//     setPreviewData(data);
//   } catch (err) {
//     console.error("Preview error:", err);
//     alert("Gagal load preview");
//   }
// };


  const handleImport = async () => {
    if (selectedIndicators.length === 0) {
      alert("Pilih minimal satu indikator.");
      return;
    }

    try {
      const res = await fetch("http://qssr-app-production.up.railway.app/api/data-collection/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromYear: selectedSourceYear,
          toYear: selectedTargetYear,
          indicators: selectedIndicators,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        alert("Berhasil import data!");
      } else {
        alert("Gagal import: " + json.message);
      }
    } catch (err) {
      console.error("Import error:", err);
      alert("Terjadi kesalahan saat import.");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Import Data Historis</h1>

      <div className="space-x-4">
        <label>Tahun Sumber:</label>
        <select
          value={selectedSourceYear}
          onChange={(e) => setSelectedSourceYear(parseInt(e.target.value))}
          className="border px-2 py-1 rounded"
        >
          {[2021, 2022, 2023, 2024].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <label>Tahun Tujuan:</label>
        <select
          value={selectedTargetYear}
          onChange={(e) => setSelectedTargetYear(parseInt(e.target.value))}
          className="border px-2 py-1 rounded"
        >
          {[2021, 2022, 2023, 2024, 2025].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <h2 className="font-semibold mt-4">Pilih Indikator yang Akan Diimport</h2>
      <label className="block font-semibold">
  <input
    type="checkbox"
    className="mr-2"
    checked={selectedIndicators.length === indikatorList.length}
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedIndicators(indikatorList.map((i) => i.indicator_id));
      } else {
        setSelectedIndicators([]);
      }
    }}
  />
  Pilih Semua Indikator
</label>

      <div className="max-h-[400px] overflow-y-auto border rounded p-3">
        {indikatorList.map((i) => (
          <label key={i.indicator_id} className="block text-sm">
            <input
              type="checkbox"
              checked={selectedIndicators.includes(i.indicator_id)}
              onChange={() => handleCheckboxChange(i.indicator_id)}
              className="mr-2"
            />
            {i.code} - {i.name}
          </label>
        ))}
      </div>
      {/* <button
  onClick={handlePreview}
  className="bg-yellow-500 text-white px-4 py-2 rounded"
>
  Tampilkan Preview
</button> */}


      <button
        onClick={handleImport}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Import Sekarang
      </button>
    </div>
  );
};

export default ImportHistoricalPage;
