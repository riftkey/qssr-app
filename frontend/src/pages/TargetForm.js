// src/pages/TargetForm.js
import React, { useState } from "react";
import BackButton from "../components/BackButton";

const TargetForm = () => {
  const [campus, setCampus] = useState("ganesha");
  const [targetYear, setTargetYear] = useState(new Date().getFullYear() + 10);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("http://qssr-app-production.up.railway.app/api/netzero", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          campus,
          targetYear,
          commitment: 0, // net zero
        }),
      });
      alert("Target net-zero berhasil disimpan");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan target net-zero");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Target Net Zero</h1>
      <BackButton to="/dashboard" className="mb-4"/>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm mb-1">Kampus</label>
          <select
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="ganesha">Ganesha</option>
            <option value="jatinangor">Jatinangor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Tahun Target Net Zero</label>
          <input
            type="number"
            value={targetYear}
            onChange={(e) => setTargetYear(parseInt(e.target.value))}
            className="border rounded p-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Komitmen Emisi (tCO2e)</label>
          <input
            type="number"
            value={0}
            disabled
            className="border rounded p-2 w-full bg-gray-100 text-gray-500"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Simpan Target
        </button>
      </form>
    </div>
  );
};

export default TargetForm;
