import React, { useState, useEffect } from "react";
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import Papa from "papaparse";
import { supabase } from "../supabaseClient"; // sesuaikan path-mu
import { v4 as uuidv4 } from "uuid"; // install dulu kalau belum: npm i uuid


const DaftarIndikator = () => {
  const [selectedLens, setSelectedLens] = useState("All");
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [penjelasan, setPenjelasan] = useState("");
  const [linkBukti, setLinkBukti] = useState("");
  const [fileDokumen, setFileDokumen] = useState(null);
  const [indikatorList, setIndikatorList] = useState([]);
  const [documentPath, setDocumentPath] = useState(null);
  const [stepsEnabled, setStepsEnabled] = useState(false);

  const handleStartTour = () => {
  introJs()
    .setOptions({
      steps: [
        {
          element: '#filter-lens',
          intro: 'Gunakan dropdown ini untuk memfilter indikator berdasarkan kategori lens.',
        },
        {
          element: '#table-indikator',
          intro: 'Ini adalah tabel indikator. Klik salah satu baris untuk input data.',
        },
        {
          element: '#penjelasan',
          intro: 'Masukkan penjelasan terkait indikator di sini.',
        },
        {
          element: '#link-bukti',
          intro: 'Tambahkan URL bukti sebagai referensi data.',
        },
        {
          element: '#file-upload',
          intro: 'Unggah dokumen pendukung jika ada.',
        },
        {
          element: '#simpan-data',
          intro: 'Klik untuk menyimpan data yang sudah kamu isi.',
        },
      ],
      showProgress: true,
      showBullets: false,
      nextLabel: "Selanjutnya",
      prevLabel: "Sebelumnya",
      doneLabel: "Selesai",
    })
    .start();
};

  const lensOptions = [
    "All",
    ...Array.from(new Set(indikatorList.map((i) => i.lens_category))),
  ];

  const filteredData =
    selectedLens === "All"
      ? indikatorList
      : indikatorList.filter((i) => i.lens_category === selectedLens);

  const handleRowClick = async (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
    setPenjelasan("");
    setLinkBukti("");
    setFileDokumen(null);

    const indikator = filteredData[index];
    if (indikator.source_data !== "QS") {
      try {
        const res = await fetch(`https://qssr-app-production.up.railway.app/api/data-collection/${indikator.code}/2025`);
        const data = await res.json();
        if (data) {
          setPenjelasan(data.value || "");
          setLinkBukti(data.evidence_url || "");
          setDocumentPath(data.document_path || null);
        }
      } catch (err) {
        console.error("Gagal fetch data collection", err);
      }
    }
  };



const handleSubmit = async (indicatorCode) => {
  const indikator = filteredData.find(i => i.code === indicatorCode);
  if (!indikator) return alert("Indikator tidak ditemukan");

  let uploadedFilePath = null;

  if (fileDokumen) {
    const fileExt = fileDokumen.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("qssr-files") // nama bucket kamu
      .upload(fileName, fileDokumen);

    if (error) {
      console.error("Upload gagal:", error.message);
      return alert("Gagal upload dokumen");
    }

    uploadedFilePath = fileName;
  }

  try {
    const res = await fetch("https://qssr-app-production.up.railway.app/api/data-collection/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        indicator_id: indikator.indicator_id,
        year: 2025,
        value: penjelasan,
        evidence_url: linkBukti,
        submitted_by: 1,
        document_path: uploadedFilePath
      }),
    });

    const data = await res.json();
    alert(data.message || "Sukses!");
  } catch (err) {
    console.error(err);
    alert("Gagal menyimpan data");
  }
};


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://qssr-app-production.up.railway.app/api/indikator");
        const data = await res.json();
        setIndikatorList(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleExportCSV = () => {
  const csv = Papa.unparse(
    indikatorList.map(({ category, lens_category, name, code, weight, source_data }) => ({
      Category: category,
      Lens: lens_category,
      Name: name,
      Code: code,
      Weight: weight,
      Source: source_data,
    }))
  );

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "Daftar_Indikator_QSSR.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <div className="p-6 space-y-4">
      

      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Daftar Indikator QS Sustainability Ranking</h1>
        
        <div className="flex gap-2">
  <button
    className="bg-blue-600 text-white px-4 py-2 rounded"
    onClick={handleStartTour}
  >
    Mulai Panduan
  </button>
  <a
    href="https://qssr-app-production.up.railway.app/api/indikator/export/excel?year=2025"
    className="bg-green-700 text-white px-4 py-2 rounded"
    target="_blank"
    rel="noopener noreferrer"
  >
    Export Excel
  </a>
</div>



      </div>

      <div id="filter-lens">
        <label className="font-semibold">Filter by Lens</label>
        <select
          className="border p-2 rounded ml-2"
          value={selectedLens}
          onChange={(e) => setSelectedLens(e.target.value)}
        >
          {lensOptions.map((lens) => (
            <option key={lens} value={lens}>{lens}</option>
          ))}
        </select>
      </div>

      <table id="table-indikator" className="w-full border text-sm shadow rounded overflow-hidden">
        <thead className="bg-blue-100 text-black">
          <tr>
            <th className="border p-2">Category</th>
            <th className="border p-2">Lens</th>
            <th className="border p-2">Indicator Name</th>
            <th className="border p-2">Code</th>
            <th className="border p-2">Weight</th>
            <th className="border p-2">Source</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, idx) => (
            <React.Fragment key={idx}>
              <tr
                onClick={() => handleRowClick(idx)}
                className="hover:bg-gray-100 cursor-pointer"
              >
                <td className="border p-2">{row.category}</td>
                <td className="border p-2">{row.lens_category}</td>
                <td className="border p-2">{row.name}</td>
                <td className="border p-2">{row.code}</td>
                <td className="border p-2">{row.weight}</td>
                <td className="border p-2">{row.source_data || "-"}</td>
              </tr>
              {expandedIndex === idx && (
  <tr>
    <td colSpan={6} className="border p-4 bg-gray-50">
      {/* Deskripsi tampil untuk semua sumber */}
      {row.description && (
        <p className="text-sm text-gray-800 mb-2">
          <strong>Deskripsi:</strong> {row.description}
        </p>
      )}

      {row.source_data === "QS" ? (
        <>
          <p className="text-sm text-gray-700">
            Data ini dikumpulkan oleh <strong>QS</strong>, bukan oleh institusi.
          </p>
          {row.external_link && (
            <a
              href={row.external_link}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              Lihat Detail Data QS
            </a>
          )}
        </>
      ) : (
        <>
          {/* Form input data */}
          <div id="penjelasan">
            <label className="block font-semibold mb-1">Penjelasan</label>
            <textarea
              className="border p-2 rounded w-full"
              rows={4}
              value={penjelasan}
              onChange={(e) => setPenjelasan(e.target.value)}
            />
          </div>

          <div id="link-bukti" className="mt-2">
            <label className="block font-semibold mb-1">Link Bukti</label>
            <input
              type="text"
              className="border p-2 rounded w-full"
              value={linkBukti}
              onChange={(e) => setLinkBukti(e.target.value)}
            />
          </div>

          <div id="file-upload" className="mt-2">
            <label className="block font-semibold mb-1">Dokumen Pendukung</label>
            <input
              type="file"
              className="border p-2 rounded w-full"
              onChange={(e) => setFileDokumen(e.target.files[0])}
            />
          </div>

          {documentPath && (
            <div className="mt-2">
              <label className="block font-semibold mb-1">File Sebelumnya</label>
              <a
                href={`https://xprwmhelbpaiwzfeyblo.supabase.co/storage/v1/object/public/qssr-files/${documentPath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {documentPath}
              </a>
            </div>
          )}

          <button
            id="simpan-data"
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
            onClick={() => handleSubmit(filteredData[expandedIndex].code)}
          >
            Simpan Data
          </button>
        </>
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

export default DaftarIndikator;
