// src/pages/BaselineForm.js
import React, { useState } from "react";
import BackButton from "../components/BackButton";

const BaselineForm = () => {
  const [campus, setCampus] = useState("ganesha");
  const [baselineYear, setBaselineYear] = useState(new Date().getFullYear());
  const [baselineEmission, setBaselineEmission] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:5000/api/baseline", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          campus,
          baselineYear,
          baselineEmission: parseFloat(baselineEmission),
        }),
      });
      alert("Baseline data berhasil disimpan");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan baseline");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Baseline Year Emission</h1>
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
          <label className="block text-sm mb-1">Tahun Baseline</label>
          <input
            type="number"
            value={baselineYear}
            onChange={(e) => setBaselineYear(parseInt(e.target.value))}
            className="border rounded p-2 w-full"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Emisi Baseline (tCO2e)</label>
          <input
            type="number"
            value={baselineEmission}
            onChange={(e) => setBaselineEmission(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Simpan Baseline
        </button>
      </form>
    </div>
  );
};

export default BaselineForm;
