// src/pages/ProgressEstimator.js
import React, { useState, useEffect } from "react";
import BackButton from "../components/BackButton";

const ProgressEstimator = () => {
  const [campus, setCampus] = useState("ganesha");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [baselineYear, setBaselineYear] = useState(null);
  const [baselineEmission, setBaselineEmission] = useState(null);
  const [targetYear, setTargetYear] = useState(null);
  const [expectedEmission, setExpectedEmission] = useState(null);
  const [reportedEmission, setReportedEmission] = useState("");
  const [progress, setProgress] = useState(null);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/emission-baseline/${campus}`);
        const d = await res.json();
        setBaselineYear(d.baseline_year);
        setBaselineEmission(d.baseline_emission);

        const resTarget = await fetch(`http://localhost:5000/api/netzero/${campus}`);
        const dTarget = await resTarget.json();
        setTargetYear(dTarget.target_year);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [campus]);

  useEffect(() => {
    if (baselineYear && baselineEmission && targetYear && selectedYear) {
      const yearDiffBaseline = selectedYear - baselineYear;
      const yearDiffTarget = targetYear - baselineYear;

      if (yearDiffBaseline < 3) {
        setWarning("Baseline Year less than 3 years: ES9 Not Applicable");
        setExpectedEmission(null);
        return;
      }

      const eExpected =
        baselineEmission *
        (1 - (selectedYear - baselineYear) / (targetYear - baselineYear));

      setExpectedEmission(eExpected > 0 ? eExpected : 0);
      setWarning("");
    }
  }, [baselineYear, baselineEmission, targetYear, selectedYear]);

  const handleProgress = () => {
    if (expectedEmission !== null && reportedEmission !== "") {
      let progressVal =
        ((expectedEmission - parseFloat(reportedEmission)) / expectedEmission) *
        100;

      if (progressVal < 0) progressVal = 0;
      if (progressVal > 100) progressVal = 100;

      setProgress(progressVal);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Progress Estimator</h1>
      <BackButton to="/dashboard" className="mb-4" />

      {/* Kampus */}
      <div className="mb-4">
        <label className="text-sm block mb-1">Kampus</label>
        <select
          value={campus}
          onChange={(e) => setCampus(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="ganesha">Ganesha</option>
          <option value="jatinangor">Jatinangor</option>
        </select>
      </div>

      {/* Tahun berjalan */}
      <div className="mb-4">
        <label className="text-sm block mb-1">Tahun Berjalan</label>
        <input
          type="number"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="border rounded p-2 w-full"
        />
      </div>

      {/* Reported emissions */}
      <div className="mb-4">
        <label className="text-sm block mb-1">Emisi Terlapor (tCO2e)</label>
        <input
          type="number"
          value={reportedEmission}
          onChange={(e) => setReportedEmission(e.target.value)}
          className="border rounded p-2 w-full"
        />
      </div>

      {/* Expected emissions */}
      {expectedEmission !== null && !warning && (
        <div className="mb-4 p-3 bg-green-100 rounded shadow text-sm">
          Expected Emissions: <strong>{expectedEmission.toFixed(2)} tCO2e</strong>
        </div>
      )}

      {/* Warning */}
      {warning && (
        <div className="mb-4 p-3 bg-yellow-200 border rounded text-sm">
          {warning}
        </div>
      )}

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleProgress}
        disabled={warning}
      >
        Hitung Progress
      </button>

      {progress !== null && !warning && (
        <div className="mt-4 p-4 bg-green-200 rounded shadow text-lg">
          Progress:
          <strong> {progress.toFixed(2)}%</strong>
        </div>
      )}
    </div>
  );
};

export default ProgressEstimator;
