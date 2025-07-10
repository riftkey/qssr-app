import React, { useState, useEffect } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";


const fakultasList = [
  "Fakultas Ilmu dan Teknologi Kebumian (FITB)",
  "Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)",
  "Fakultas Seni Rupa dan Desain (FSRD)",
  "Fakultas Teknologi Industri (FTI)",
  "Fakultas Teknik Mesin dan Dirgantara (FTMD)",
  "Fakultas Teknik Pertambangan dan Perminyakan (FTTM)",
  "Fakultas Teknik Sipil dan Lingkungan (FTSL)",
  "Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan (SAPPK)",
  "Sekolah Bisnis dan Manajemen (SBM)",
  "Sekolah Farmasi (SF)",
  "Sekolah Ilmu dan Teknologi Hayati (SITH)",
  "Sekolah Teknik Elektro dan Informatika (STEI)",
];

const DemografiPage = () => {
  const [data, setData] = useState(
    fakultasList.map((fakultas) => ({
      fakultas,
      staff_male: 0,
      staff_female: 0,
      student_male: 0,
      student_female: 0,
    }))
  );

  const [leaders, setLeaders] = useState([
    { name: "", position: "", gender: "", faculty: "" },
  ]);

  const handleChange = (index, field, value) => {
    const temp = [...data];
    temp[index][field] = parseInt(value) || 0;
    setData(temp);
  };

  const handleLeaderChange = (index, field, value) => {
    const temp = [...leaders];
    temp[index][field] = value;
    setLeaders(temp);
  };

  const handleAddFacultyRow = () => {
    setData((prev) => [
      ...prev,
      {
        fakultas: "",
        staff_male: 0,
        staff_female: 0,
        student_male: 0,
        student_female: 0,
      },
    ]);
  };

  const handleFacultyNameChange = (index, value) => {
    const temp = [...data];
    temp[index].fakultas = value;
    setData(temp);
  };

  const handleAddLeader = () => {
    setLeaders((prev) => [
      ...prev,
      { name: "", position: "", gender: "", faculty: "" },
    ]);
  };

  // DITARO DI LUAR useEffect
  const fetchData = async () => {
    try {
      const staffRes = await fetch("http://localhost:5000/api/demographics/staff");
      const staffData = await staffRes.json();

      const studentRes = await fetch("http://localhost:5000/api/demographics/student");
      const studentData = await studentRes.json();

      const leadershipRes = await fetch("http://localhost:5000/api/demographics/leadership");
      const leadershipData = await leadershipRes.json();

      const fakultasSet = new Set([
        ...staffData.map((s) => s.faculty),
        ...studentData.map((s) => s.faculty),
      ]);

      const merged = Array.from(fakultasSet).map((faculty) => {
        const staff = staffData.find((s) => s.faculty === faculty) || {};
        const student = studentData.find((s) => s.faculty === faculty) || {};
        return {
          fakultas: faculty,
          id_staff: staff.id,
          id_student: student.id,
          staff_male: staff.male_count || 0,
          staff_female: staff.female_count || 0,
          student_male: student.male_count || 0,
          student_female: student.female_count || 0,
        };
      });

      setData(merged);

      setLeaders(
        leadershipData.map((item) => ({
          id: item.id,
          name: item.name,
          position: item.position,
          gender: item.gender,
          faculty: item.unit,
        }))
      );
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil data dari server");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      await fetch("http://localhost:5000/api/demographics/staff/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: data.map((item) => ({
            id: item.id_staff,
            faculty: item.fakultas,
            male_count: item.staff_male,
            female_count: item.staff_female,
          })),
        }),
      });

      await fetch("http://localhost:5000/api/demographics/student/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: data.map((item) => ({
            id: item.id_student,
            faculty: item.fakultas,
            male_count: item.student_male,
            female_count: item.student_female,
          })),
        }),
      });

      await fetch("http://localhost:5000/api/demographics/leadership/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: leaders.map((item) => ({
            id: item.id,
            name: item.name,
            position: item.position,
            gender: item.gender,
            unit: item.faculty,
          })),
        }),
      });

      alert("Data berhasil disimpan ke server");
      fetchData(); // reload state
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data: " + err.message);
    }
  };

  const staffMaleTotal = data.reduce((sum, d) => sum + d.staff_male, 0);
  const staffFemaleTotal = data.reduce((sum, d) => sum + d.staff_female, 0);
  const studentMaleTotal = data.reduce((sum, d) => sum + d.student_male, 0);
  const studentFemaleTotal = data.reduce((sum, d) => sum + d.student_female, 0);

  const totalStaff = staffMaleTotal + staffFemaleTotal;
  const totalStudent = studentMaleTotal + studentFemaleTotal;
  const leaderL = leaders.filter((l) => l.gender === "Laki-laki").length;
  const leaderP = leaders.filter((l) => l.gender === "Perempuan").length;
  const totalLeader = leaderL + leaderP;

  const toPercent = (val, total) => (total > 0 ? ((val / total) * 100).toFixed(1) : 0);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Data Demografi</h1>
      <button
  onClick={() =>
    introJs().setOptions({
      steps: [
        {
          element: ".tabel-demografi",
          intro: "Isi data jumlah staf dan mahasiswa per fakultas berdasarkan gender.",
        },
        {
          element: ".tambah-fakultas",
          intro: "Klik tombol ini untuk menambahkan baris fakultas baru.",
        },
        {
          element: ".data-kepemimpinan",
          intro: "Masukkan nama, jabatan, unit, dan gender pimpinan institusi.",
        },
        {
          element: ".tambah-pemimpin",
          intro: "Klik untuk menambahkan entri pemimpin baru.",
        },
        {
          element: ".rasio-gender",
          intro: "Bagian ini menunjukkan rasio staf, mahasiswa, dan pemimpin berdasarkan gender.",
        },
        {
          element: ".simpan-semua",
          intro: "Klik untuk menyimpan semua data ke server.",
        },
      ],
      showProgress: true,
      showBullets: false,
      nextLabel: "Lanjut",
      prevLabel: "Kembali",
      skipLabel: "Lewati",
      doneLabel: "Selesai",
    }).start()
  }
  className="bg-blue-600 text-white px-3 py-1 rounded mb-2"
>
  Mulai Panduan
</button>


      {/* tabel staf dan mahasiswa */}
      <table className="w-full text-sm border tabel-demografi">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Fakultas</th>
            <th className="border p-2">Staf Laki-laki</th>
            <th className="border p-2">Staf Perempuan</th>
            <th className="border p-2">Mahasiswa Laki-laki</th>
            <th className="border p-2">Mahasiswa Perempuan</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              <td className="border p-1">
                <input
                  type="text"
                  value={row.fakultas}
                  onChange={(e) => handleFacultyNameChange(idx, e.target.value)}
                  className="w-full border rounded px-1 py-0.5"
                />
              </td>
              <td className="border p-1">
                <input
                  type="number"
                  value={row.staff_male}
                  onChange={(e) => handleChange(idx, "staff_male", e.target.value)}
                  className="w-full border rounded px-1 py-0.5"
                />
              </td>
              <td className="border p-1">
                <input
                  type="number"
                  value={row.staff_female}
                  onChange={(e) => handleChange(idx, "staff_female", e.target.value)}
                  className="w-full border rounded px-1 py-0.5"
                />
              </td>
              <td className="border p-1">
                <input
                  type="number"
                  value={row.student_male}
                  onChange={(e) => handleChange(idx, "student_male", e.target.value)}
                  className="w-full border rounded px-1 py-0.5"
                />
              </td>
              <td className="border p-1">
                <input
                  type="number"
                  value={row.student_female}
                  onChange={(e) => handleChange(idx, "student_female", e.target.value)}
                  className="w-full border rounded px-1 py-0.5"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={handleAddFacultyRow}
        className="bg-gray-600 text-white px-3 py-1 rounded mt-2 tambah-fakultas"
      >
        Tambah Baris Fakultas
      </button>

      {/* data kepemimpinan */}
      <div className="space-y-2 mt-4 data-kepemimpinan">
        <h2 className="text-lg font-semibold">Data Kepemimpinan</h2>
        {leaders.map((leader, idx) => (
          <div className="grid grid-cols-2 gap-2 border p-2 rounded" key={idx}>
            <input
              type="text"
              placeholder="Nama Pemimpin"
              value={leader.name}
              onChange={(e) => handleLeaderChange(idx, "name", e.target.value)}
              className="border rounded px-2 py-1"
            />
            <input
              type="text"
              placeholder="Jabatan"
              value={leader.position}
              onChange={(e) => handleLeaderChange(idx, "position", e.target.value)}
              className="border rounded px-2 py-1"
            />
            <input
              type="text"
              placeholder="Fakultas/Unit"
              value={leader.faculty}
              onChange={(e) => handleLeaderChange(idx, "faculty", e.target.value)}
              className="border rounded px-2 py-1"
            />
            <select
              value={leader.gender}
              onChange={(e) => handleLeaderChange(idx, "gender", e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
        ))}
        <button
          onClick={handleAddLeader}
          className="bg-gray-600 text-white px-3 py-1 rounded tambah-pemimpin"
        >
          Tambah Pemimpin
        </button>
      </div>

      {/* rasio */}
      <div className="space-y-2 mt-4 rasio-gender">
        <h2 className="text-lg font-semibold">Rasio (%)</h2>
        <p>
          Rasio Staf (L:{toPercent(staffMaleTotal, totalStaff)}% , P:{toPercent(staffFemaleTotal, totalStaff)}%)
        </p>
        <p>
          Rasio Mahasiswa (L:{toPercent(studentMaleTotal, totalStudent)}% , P:{toPercent(studentFemaleTotal, totalStudent)}%)
        </p>
        <p>
          Rasio Kepemimpinan (L:{toPercent(leaderL, totalLeader)}% , P:{toPercent(leaderP, totalLeader)}%)
        </p>
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4 simpan-semua"
      >
        Simpan Semua
      </button>
    </div>
  );
};

export default DemografiPage;
