import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const dummyHistoricalData = {
  2021: {
    "Environmental Education": [
      { kode: "EE1", nama: "Peluncuran Kurikulum Keberlanjutan Global Tingkat Universitas", bukti: "https://2021.example.com/bukti-ee1" },
      { kode: "EE2", nama: "Laporan Tahunan Kegiatan Unit Mahasiswa Pecinta Lingkungan", bukti: "https://2021.example.com/bukti-ee2" },
    ],
    "Environmental Research": [
      { kode: "ER1", nama: "Inisiasi Kolaborasi Penelitian Iklim dengan Universitas Mitra", bukti: "https://2021.example.com/bukti-er1" },
      { kode: "ER3", nama: "Pembentukan Pusat Studi Energi Terbarukan", bukti: "https://2021.example.com/bukti-er3" },
    ],
    "Environmental Sustainability": [
      { kode: "ES2", nama: "Deklarasi Komitmen sebagai 'Sustainable Group Member'", bukti: "https://2021.example.com/bukti-es2" },
      { kode: "ES3", nama: "Survei Awal Persepsi Staf Mengenai Komitmen Perubahan Iklim", bukti: "https://2021.example.com/bukti-es3" },
      { kode: "ES10", nama: "Publikasi Dokumen Awal Kebijakan Strategi Iklim Universitas", bukti: "https://2021.example.com/bukti-es10" },
    ],
    "Employability and Opportunities": [
      { kode: "EO1", nama: "Peningkatan Reputasi Melalui Job Fair Virtual Berfokus Green Jobs", bukti: "https://2021.example.com/bukti-eo1" },
      { kode: "EO5", nama: "Penandatanganan MoU Kemitraan dengan 5 Perusahaan di Sektor Energi Hijau", bukti: "https://2021.example.com/bukti-eo5" },
    ],
    "Equality": [
      { kode: "EQ1", nama: "Laporan Riset Dampak SDG 5 (Kesetaraan Gender) di Lingkungan Kampus", bukti: "https://2021.example.com/bukti-eq1" },
      { kode: "EQ5", nama: "Rilis Kebijakan Kesetaraan, Keberagaman, dan Inklusi (EDI)", bukti: "https://2021.example.com/bukti-eq5" },
    ],
    "Health and Wellbeing": [
      { kode: "HW1", nama: "Peluncuran Program Kesehatan Mental 'Kampus Sehat Jiwa'", bukti: "https://2021.example.com/bukti-hw1" },
      { kode: "HW2", nama: "Peresmian Layanan Konseling Psikologis Gratis bagi Mahasiswa", bukti: "https://2021.example.com/bukti-hw2" },
    ],
    "Impact of Education": [
      { kode: "IE1", nama: "Riset Dampak SDG 4 (Pendidikan Berkualitas) dari Program Kampus", bukti: "https://2021.example.com/bukti-ie1" },
      { kode: "IE4", nama: "Deklarasi Komitmen pada Indeks Kebebasan Akademik", bukti: "https://2021.example.com/bukti-ie4" },
    ],
    "Knowledge Exchange": [
      { kode: "KE1", nama: "Forum Inovasi Masyarakat Tahunan Pertama", bukti: "https://2021.example.com/bukti-ke1" },
      { kode: "KE2", nama: "Program 'Desa Binaan' oleh Mahasiswa KKN", bukti: "https://2021.example.com/bukti-ke2" },
    ],
    "Good Governance": [
      { kode: "GG1", nama: "Implementasi Kode Etik Akademik Baru", bukti: "https://2021.example.com/bukti-gg1" },
      { kode: "GG4", nama: "Publikasi Laporan Keuangan Tahunan yang Transparan", bukti: "https://2021.example.com/bukti-gg4" },
    ]
  },
  2022: {
    "Environmental Education": [
      { kode: "EE1", nama: "Pembaruan Silabus Mata Kuliah Wajib Universitas dengan Topik Lingkungan", bukti: "https://2022.example.com/bukti-ee1" },
      { kode: "EE3", nama: "Menyelenggarakan 10+ Workshop Lingkungan Hidup untuk Publik dan Mahasiswa", bukti: "https://2022.example.com/bukti-ee3" },
    ],
    "Environmental Research": [
      { kode: "ER1", nama: "Peningkatan Dampak Penelitian SDG 13 (Penanganan Iklim)", bukti: "https://2022.example.com/bukti-er1" },
      { kode: "ER2", nama: "Laporan Jumlah Publikasi Ilmiah Topik Lingkungan di Jurnal Nasional", bukti: "https://2022.example.com/bukti-er2" },
    ],
    "Environmental Sustainability": [
      { kode: "ES7", nama: "Pemasangan Panel Surya Tahap 1, Menurunkan Emisi CO2", bukti: "https://2022.example.com/bukti-es7" },
      { kode: "ES8", nama: "Laporan Kapasitas Energi Terbarukan yang Dihasilkan On-site", bukti: "https://2022.example.com/bukti-es8" },
      { kode: "ES5", nama: "Peluncuran Gerakan 'Green Society' oleh Himpunan Mahasiswa", bukti: "https://2022.example.com/bukti-es5" },
    ],
    "Employability and Opportunities": [
      { kode: "EO2", nama: "Riset Ketenagakerjaan Lulusan pada Sektor Keberlanjutan", bukti: "https://2022.example.com/bukti-eo2" },
      { kode: "EO5", nama: "Program Magang Bersertifikat dengan NGO Lingkungan", bukti: "https://2022.example.com/bukti-eo5" },
    ],
    "Equality": [
      { kode: "EQ2", nama: "Data Statistik Rasio Gender Mahasiswa Baru Tahun 2022", bukti: "https://2022.example.com/bukti-eq2" },
      { kode: "EQ7", nama: "Pembentukan Pusat Layanan Inklusi dan Dukungan Disabilitas", bukti: "https://2022.example.com/bukti-eq7" },
      { kode: "EQ3", nama: "Laporan Rasio Gender Staf Pengajar per Fakultas", bukti: "https://2022.example.com/bukti-eq3" },
    ],
    "Health and Wellbeing": [
      { kode: "HW2", nama: "Renovasi dan Peningkatan Fasilitas Klinik Sehat Mahasiswa", bukti: "https://2022.example.com/bukti-hw2" },
      { kode: "HW3", nama: "Data Statistik Kesehatan Mahasiswa dari Survei Nasional", bukti: "https://2022.example.com/bukti-hw3" },
    ],
    "Impact of Education": [
      { kode: "IE2", nama: "Peningkatan Literasi SDG dalam Kurikulum, Terbukti dari Survei Mahasiswa", bukti: "https://2022.example.com/bukti-ie2" },
      { kode: "IE3", nama: "Studi Kasus Alumni Berprestasi di Bidang Pendidikan", bukti: "https://2022.example.com/bukti-ie3" },
    ],
    "Knowledge Exchange": [
      { kode: "KE2", nama: "Laporan Program Pengabdian Masyarakat Berkelanjutan", bukti: "https://2022.example.com/bukti-ke2" },
      { kode: "KE3", nama: "Hasil Survei Persepsi Staf terhadap Program Diseminasi Pengetahuan", bukti: "https://2022.example.com/bukti-ke3" },
    ],
    "Good Governance": [
      { kode: "GG2", nama: "Kebijakan Wajib Publikasi Open-Access untuk Hasil Riset Dosen", bukti: "https://2022.example.com/bukti-gg2" },
      { kode: "GG6", nama: "Notulensi Rapat Senat yang Melibatkan Perwakilan Mahasiswa", bukti: "https://2022.example.com/bukti-gg6" },
      { kode: "GG7", nama: "Publikasi Risalah Rapat Pimpinan di Website Universitas", bukti: "https://2022.example.com/bukti-gg7" },
    ]
  },
  2023: {
    "Environmental Education": [
      { kode: "EE1", nama: "Meraih Peringkat Top 10 Nasional untuk Reputasi Akademik Bidang Lingkungan", bukti: "https://2023.example.com/bukti-ee1" },
      { kode: "EE2", nama: "Profil Alumni Sukses di Sektor Pemerintahan Bidang Lingkungan", bukti: "https://2023.example.com/bukti-ee2" },
      { kode: "EE3", nama: "Modul Pelatihan Dosen untuk Integrasi Topik Lingkungan Lintas Disiplin", bukti: "https://2023.example.com/bukti-ee3" },
    ],
    "Environmental Research": [
      { kode: "ER1", nama: "Indeks Dampak Penelitian Berkelanjutan (SDG 7, 11, 12)", bukti: "https://2023.example.com/bukti-er1" },
      { kode: "ER4", nama: "Laporan Sitasi Kebijakan Riset Lingkungan oleh Pemerintah Daerah", bukti: "https://2023.example.com/bukti-er4" },
    ],
    "Environmental Sustainability": [
      { kode: "ES1", nama: "Profil Alumni Inovator di Bidang Teknologi Daur Ulang", bukti: "https://2023.example.com/bukti-es1" },
      { kode: "ES4", nama: "Implementasi Kebijakan Pengadaan dan Investasi Berkelanjutan", bukti: "https://2023.example.com/bukti-es4" },
      { kode: "ES6", nama: "Roadmap dan Komitmen Menuju Net Zero Emission 2040", bukti: "https://2023.example.com/bukti-es6" },
    ],
    "Employability and Opportunities": [
      { kode: "EO4", nama: "Laporan Keterserapan Lulusan di Industri Hijau Menurut Statistik Nasional", bukti: "https://2023.example.com/bukti-eo4" },
      { kode: "EO6", nama: "Survei Kepuasan Keterampilan Lulusan oleh Pemberi Kerja", bukti: "https://2023.example.com/bukti-eo6" },
    ],
    "Equality": [
      { kode: "EQ4", nama: "Laporan Peningkatan Rasio Perempuan dalam Jabatan Struktural Kampus", bukti: "https://2023.example.com/bukti-eq4" },
      { kode: "EQ6", nama: "Hasil Survei Pandangan Staf Mengenai Kesetaraan Akademik", bukti: "https://2023.example.com/bukti-eq6" },
      { kode: "EQ8", nama: "Data Kesetaraan Universitas Dibandingkan Statistik Nasional", bukti: "https://2023.example.com/bukti-eq8" },
    ],
    "Health and Wellbeing": [
      { kode: "HW1", nama: "Riset Dampak Lingkungan Kampus terhadap Kesejahteraan Mahasiswa", bukti: "https://2023.example.com/bukti-hw1" },
      { kode: "HW2", nama: "Program 'Wellness Wednesday' dengan Kegiatan Yoga dan Meditasi", bukti: "https://2023.example.com/bukti-hw2" },
    ],
    "Impact of Education": [
      { kode: "IE5", nama: "Analisis Dampak Pendidikan Universitas Berdasarkan Statistik Nasional", bukti: "https://2023.example.com/bukti-ie5" },
      { kode: "IE1", nama: "Evaluasi Kualitas Pembelajaran Berbasis Dampak pada Masyarakat", bukti: "https://2023.example.com/bukti-ie1" },
    ],
    "Knowledge Exchange": [
      { kode: "KE1", nama: "Jurnal Pengabdian Masyarakat yang Terindeks Nasional", bukti: "https://2023.example.com/bukti-ke1" },
      { kode: "KE4", nama: "Kumpulan Policy Brief Hasil Riset Sosial untuk Pemerintah", bukti: "https://2023.example.com/bukti-ke4" },
    ],
    "Good Governance": [
      { kode: "GG3", nama: "Pembentukan Tim Khusus Pembangunan Berkelanjutan (SDG Center)", bukti: "https://2023.example.com/bukti-gg3" },
      { kode: "GG5", nama: "Laporan Kegiatan dan Anggaran Badan Eksekutif Mahasiswa", bukti: "https://2023.example.com/bukti-gg5" },
      { kode: "GG9", nama: "Survei Persepsi Staf Terhadap Transparansi Tata Kelola", bukti: "https://2023.example.com/bukti-gg9" },
    ]
  },
  // Data untuk 2024 dan 2025 dapat dikembangkan dengan pola yang sama.
};

const HistoryPage = () => {
  const location = useLocation();
  const initialLensa = location.state?.selectedLensa || "Environmental Sustainability";
  const [selectedLensa, setSelectedLensa] = useState(initialLensa);
  const [selectedYear, setSelectedYear] = useState(2025);

  const years = Object.keys(dummyHistoricalData).sort((a, b) => b - a);

  const handleLensaChange = (e) => {
    setSelectedLensa(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const currentData = dummyHistoricalData[selectedYear]?.[selectedLensa] || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Riwayat Lensa dan Indikator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-semibold mb-1">Pilih Tahun</label>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="border rounded p-2 w-full"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">Pilih Lensa</label>
          <select
            value={selectedLensa}
            onChange={handleLensaChange}
            className="border rounded p-2 w-full"
          >
            {Object.keys(dummyHistoricalData[selectedYear] || {}).map((lensa) => (
              <option key={lensa} value={lensa}>{lensa}</option>
            ))}
          </select>
        </div>
      </div>

      <table className="min-w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-blue-100 text-left">
          <tr>
            <th className="px-4 py-2 border-b">Kode</th>
            <th className="px-4 py-2 border-b">Nama</th>
            <th className="px-4 py-2 border-b">Bukti URL</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border-b">{item.kode}</td>
                <td className="px-4 py-2 border-b">{item.nama}</td>
                <td className="px-4 py-2 border-b text-blue-600 underline">
                  <a href={item.bukti} target="_blank" rel="noopener noreferrer">{item.bukti}</a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="px-4 py-2 text-center text-gray-500">Tidak ada data untuk tahun dan lensa ini.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryPage;
