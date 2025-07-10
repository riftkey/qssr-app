// src/pages/BaselineTargetForm.js
import React, { useState, useEffect } from "react";
import BackButton from "../components/BackButton";

const BaselineTargetForm = () => {
  const [campus, setCampus] = useState("ganesha");
  const [baselineYear, setBaselineYear] = useState("");
  const [baselineEmission, setBaselineEmission] = useState("");
  const [targetYear, setTargetYear] = useState("");

  // load data awal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://qssr-app-production.up.railway.app/api/netzero/${campus}`);
        if (res.ok) {
          const data = await res.json();
          setBaselineYear(data.baseline_year || "");
          setBaselineEmission(data.baseline_emission || "");
          setTargetYear(data.target_year || "");
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [campus]);

  const handleSave = async () => {
    try {
      await fetch(`http://qssr-app-production.up.railway.app/api/netzero/${campus}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baselineYear,
          baselineEmission,
          targetYear,
          targetEmission: 0, // net-zero commitment
          evidenceUrl: null  // opsional
        }),
      });

      alert("Data berhasil disimpan");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Baseline Year & Target Net Zero</h1>
      <BackButton to="/carbon-calculator" className="mb-4" />

      {/* Kampus */}
      <div className="mb-4">
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

      {/* Baseline */}
      <div className="mb-6 p-4 rounded border shadow bg-gray-50">
        <h2 className="text-md font-semibold mb-2">Baseline Emissions</h2>
        <label className="text-sm block mb-1">Baseline Year</label>
        <input
          type="number"
          value={baselineYear}
          onChange={(e) => setBaselineYear(e.target.value)}
          className="border rounded p-2 w-full mb-2"
        />
        <label className="text-sm block mb-1">Baseline Emissions (tCO2e)</label>
        <input
          type="number"
          value={baselineEmission}
          onChange={(e) => setBaselineEmission(e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      {/* Target */}
      <div className="mb-6 p-4 rounded border shadow bg-gray-50">
        <h2 className="text-md font-semibold mb-2">Target Net Zero</h2>
        <label className="text-sm block mb-1">Target Year (0 tCO2e)</label>
        <input
          type="number"
          value={targetYear}
          onChange={(e) => setTargetYear(e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      <button
        onClick={handleSave}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
      >
        Simpan Data
      </button>
    </div>
  );
};

export default BaselineTargetForm;
