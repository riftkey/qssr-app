import React, { useState } from "react";
import UploadDataCollection from "../components/UploaderFile";

const QSSRUploadPage = () => {
  const [category, setCategory] = useState("");
  const [lens, setLens] = useState("");
  const [indicator, setIndicator] = useState("");
  const [bukti, setBukti] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Kirim data ke backend di sini
    alert("Data berhasil dikirim!");
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4">Unggah Data QSSR</h2>
      <p className="mb-6 text-gray-600">
        Unggah data kamu untuk keperluan QS Sustainability Ranking
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kategori */}
        <div>
          <label className="block font-medium mb-1">Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Pilih kategori</option>
            <option value="environmental">Environmental Impact</option>
            <option value="social">Social Impact</option>
            <option value="governance">Government</option>
          </select>
        </div>

        {/* Lensa */}
        <div>
          <label className="block font-medium mb-1">Lensa</label>
          <select
            value={lens}
            onChange={(e) => setLens(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Pilih lensa</option>
            <option value="ee">Environmental Education</option>
            <option value="er">Environmental Research</option>
            <option value="es">Environmental Sustainability</option>
            <option value="eo">Employability and Opportunities</option>
            <option value="eq">Equality</option>
            <option value="hw">Health and Wellbeing</option>
            <option value="ie">Impact of Education</option>
            <option value="ke">Knowledge Exchange</option>
            <option value="gg">Good Governance</option>
          </select>
        </div>

        {/* Indikator */}
        <div>
          <label className="block font-medium mb-1">Indikator</label>
          <select
            value={indicator}
            onChange={(e) => setIndicator(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Pilih indikator</option>
            <option value="energi">ES 7 - Emissions Efficiency</option>
            <option value="emisi">ES 8 - Renewable Generated Onsite</option>
            <option value="inklusivitas">ES 9 - Progress Toward Target</option>
            {/* Tambahkan indikator lain sesuai kebutuhan */}
          </select>
        </div>


        {/* Bukti/Nilai */}
        <div>
          <label className="block font-medium mb-1">Bukti/Nilai</label>
          <textarea
            value={bukti}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={3}
            placeholder="Tulis URL atau Bukti pelaporan yang relevan"
          />
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block font-medium mb-1">Deskripsi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={3}
            placeholder="Tulis deskripsi singkat tentang data yang diunggah"
          />
        </div>

        {/* Tahun Pelaporan */}
        <div>
          <label className="block font-medium mb-1">Tahun Pelaporan</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Contoh: 2025"
          />
        </div>

        {/* Upload File */}
        <div>
          <label className="block font-medium mb-2">Unggah Berkas</label>
          <div className="border border-dashed border-gray-400 p-6 text-center rounded">
            <input type="file" onChange={handleFileChange} />
            <p className="text-sm text-gray-500 mt-2">
              Format yang didukung: PDF, XLSX, DOCX, CSV (maksimal 10MB)
            </p>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Simpan Sebagai Draf
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Kirim
          </button>
        </div>
        <UploadDataCollection
          category={category}
          lens={lens}
          indicator={indicator}
          bukti={bukti}
          description={description}
          year={year}
          file={file} />
      </form>
    </div>
  );
};

export default QSSRUploadPage;
