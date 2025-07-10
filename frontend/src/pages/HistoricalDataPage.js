import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import introJs from "intro.js";
import "intro.js/introjs.css";




const HistoricalDataPage = () => {
  const [indikatorList, setIndikatorList] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [penjelasan, setPenjelasan] = useState("");
  const [linkBukti, setLinkBukti] = useState("");
  const [fileDokumen, setFileDokumen] = useState(null);
  const [documentPath, setDocumentPath] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const navigate = useNavigate();
  useEffect(() => {
    fetchIndikator();
    
  }, []);
  useEffect(() => {
  if (expandedIndex !== null) {
    handleRowClick(expandedIndex); // re-fetch data saat tahun ganti
  }
}, [selectedYear]);

  const fetchIndikator = async () => {
    try {
      const res = await fetch("http://qssr-app-production.up.railway.app/api/indikator");
      const data = await res.json();
      setIndikatorList(data);
    } catch (err) {
      console.error("Gagal fetch indikator:", err);
    }
  };

  const handleRowClick = async (index) => {
    const indikator = indikatorList[index];
    setExpandedIndex(index === expandedIndex ? null : index);
    setPenjelasan("");
    setLinkBukti("");
    setFileDokumen(null);
    setDocumentPath(null);

    try {
      const res = await fetch(
        `http://qssr-app-production.up.railway.app/api/data-collection/${indikator.code}/${selectedYear}`
      );
      const data = await res.json();
      if (data) {
        setPenjelasan(data.value || "");
        setLinkBukti(data.evidence_url || "");
        setDocumentPath(data.document_path || null);
      }
    } catch (err) {
      console.error("Gagal fetch data collection:", err);
    }
  };

  const handleSubmit = async (indikator) => {
    const formData = new FormData();
    formData.append("indicator_id", indikator.indicator_id);
    formData.append("year", selectedYear);
    formData.append("value", penjelasan);
    formData.append("evidence_url", linkBukti);
    formData.append("submitted_by", 1);
    if (fileDokumen) {
      formData.append("document", fileDokumen);
    }

    try {
      const res = await fetch("http://qssr-app-production.up.railway.app/api/data-collection/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      alert(data.message || "Sukses menyimpan!");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Gagal menyimpan data.");
    }
  };
  const startTour = () => {
  introJs().setOptions({
    nextLabel: 'Lanjut',
    prevLabel: 'Kembali',
    skipLabel: 'Lewati',
    doneLabel: 'Selesai',
    steps: [
      {
        intro: "Selamat datang di halaman manajemen data historis. Di sini kamu bisa melihat dan mengisi data tiap indikator per tahun."
      },
      {
        element: "#tahun-selector",
        intro: "Gunakan dropdown ini untuk memilih tahun data yang ingin kamu lihat atau isi."
      },
      {
        element: "#tombol-import",
        intro: "Klik tombol ini untuk mengimpor data dari tahun sebelumnya agar tidak perlu isi manual lagi."
      },
      {
        element: "#tabel-indikator",
        intro: "Tabel ini berisi semua indikator. Klik salah satu baris untuk melihat atau mengisi data per tahun."
      }
    ]
  }).start();
};


  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
  <h1 className="text-xl font-bold">Manajemen Data Historis</h1>

  <div className="flex gap-2 items-center">
    <button
      onClick={startTour}
      className="bg-blue-600 text-white px-3 py-1 rounded"
    >
      Mulai Panduan
    </button>

    <button
      id="tombol-import"
      className="bg-green-600 text-white px-3 py-1 rounded"
      onClick={() => navigate("/import-historical")}
    >
      Import Data Tahun Sebelumnya
    </button>

    <select
      id="tahun-selector"
      value={selectedYear}
      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
      className="border px-3 py-1 rounded"
    >
      {[2021, 2022, 2023, 2024, 2025].map((y) => (
        <option key={y} value={y}>
          Tahun {y}
        </option>
      ))}
    </select>
  </div>
</div>


      <table className="w-full border text-sm shadow rounded overflow-hidden" id="tabel-indikator">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Category</th>
            <th className="border p-2">Lens</th>
            <th className="border p-2">Indicator Name</th>
            <th className="border p-2">Code</th>
            <th className="border p-2">Source</th>
          </tr>
        </thead>
        <tbody>
          {indikatorList.map((indikator, idx) => (
            <React.Fragment key={indikator.code}>
              <tr
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleRowClick(idx)}
              >
                <td className="border p-2">{indikator.category}</td>
                <td className="border p-2">{indikator.lens_category}</td>
                <td className="border p-2">{indikator.name}</td>
                <td className="border p-2">{indikator.code}</td>
                <td className="border p-2">{indikator.source_data || "-"}</td>
              </tr>

              {expandedIndex === idx && (
  <tr>
    <td colSpan={5} className="border p-4 bg-gray-50">
      {/* Deskripsi selalu ditampilkan jika ada */}
      {indikator.description && (
        <p className="text-sm text-gray-800 mb-2">
          <strong>Deskripsi:</strong> {indikator.description}
        </p>
      )}

      {indikator.source_data === "QS" ? (
        <>
          <p className="text-sm text-gray-700">
            Data ini dikumpulkan oleh <strong>QS</strong>, bukan oleh institusi.
          </p>
          {indikator.external_link && (
            <a
              href={indikator.external_link}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              Lihat Detail Data QS
            </a>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <textarea
            rows={3}
            className="border w-full rounded px-2 py-1"
            placeholder="Penjelasan"
            value={penjelasan}
            onChange={(e) => setPenjelasan(e.target.value)}
          />
          <input
            type="text"
            placeholder="Link Bukti"
            className="border w-full rounded px-2 py-1"
            value={linkBukti}
            onChange={(e) => setLinkBukti(e.target.value)}
          />
          <input
            type="file"
            className="w-full"
            onChange={(e) => setFileDokumen(e.target.files[0])}
          />
          {documentPath && (
            <div>
              <p className="text-sm">File sebelumnya:</p>
              <a
                href={`http://qssr-app-production.up.railway.app/uploads/${documentPath}`}
                className="text-blue-600 underline"
                target="_blank"
                rel="noreferrer"
              >
                {documentPath}
              </a>
            </div>
          )}
          <button
            onClick={() => handleSubmit(indikator)}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Simpan Data Tahun {selectedYear}
          </button>
        </div>
      )}
    </td>
  </tr>
)}

            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoricalDataPage;
