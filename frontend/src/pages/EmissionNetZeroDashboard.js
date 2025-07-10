import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";





const EmissionNetZeroDashboard = () => {
  const [campus, setCampus] = useState("ganesha");
  const [baselineYear, setBaselineYear] = useState(null);
  const [baselineEmission, setBaselineEmission] = useState(null);
  const [targetYear, setTargetYear] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expectedEmission, setExpectedEmission] = useState(null);
  const [reportedEmission, setReportedEmission] = useState("");
  const [progress, setProgress] = useState(null);
  const [trendData, setTrendData] = useState([]);
// wajib register!
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // baseline
        const resBaseline = await fetch(`http://qssr-app-production.up.railway.app/api/emission-baseline/${campus}`);
        if (resBaseline.ok) {
          const d = await resBaseline.json();
          setBaselineYear(d.baseline_year);
          setBaselineEmission(d.baseline_emission);
        }
        // target
        const resTarget = await fetch(`http://qssr-app-production.up.railway.app/api/netzero/${campus}`);
        if (resTarget.ok) {
          const d = await resTarget.json();
          setTargetYear(d.target_year);
        }
        // trend
        const resTrend = await fetch(`http://qssr-app-production.up.railway.app/api/emission-trend/${campus}`);
        if (resTrend.ok) {
          const d = await resTrend.json();
          setTrendData(d);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllData();
  }, [campus]);

  useEffect(() => {
    if (
      baselineYear &&
      baselineEmission &&
      targetYear &&
      selectedYear >= baselineYear &&
      selectedYear <= targetYear
    ) {
      const Eexpected =
        baselineEmission *
        (1 - (selectedYear - baselineYear) / (targetYear - baselineYear));
      setExpectedEmission(Eexpected.toFixed(2));
    } else {
      setExpectedEmission(null);
    }
  }, [baselineYear, baselineEmission, targetYear, selectedYear]);

  const handleProgressCalc = () => {
    if (expectedEmission && reportedEmission) {
      let prog = ((expectedEmission - reportedEmission) / expectedEmission) * 100;
      prog = Math.max(0, Math.min(100, prog));
      setProgress(prog.toFixed(2));
    }
  };

  const chartData = {
    labels: trendData.map((d) => d.year),
    datasets: [
      {
        label: "Emisi (tCO2e)",
        data: trendData.map((d) => d.emission),
        fill: false,
        borderColor: "green",
      },
    ],
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Emisi & Net Zero</h1>
      <BackButton to="/dashboard" />

      {/* Kampus & Tahun */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm mb-1">Kampus</label>
          <select
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            className="border rounded p-2"
          >
            <option value="ganesha">Ganesha</option>
            <option value="jatinangor">Jatinangor</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Tahun Berjalan</label>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border rounded p-2 w-32"
          />
        </div>
      </div>

      {/* Interpolasi */}
      <div className="p-4 bg-gray-50 rounded shadow space-y-2">
        <h2 className="text-lg font-semibold">Kalkulator Interpolasi</h2>
        <div className="text-sm">
          <strong>Expected Emission:</strong>{" "}
          {expectedEmission !== null ? `${expectedEmission} tCO2e` : "—"}
        </div>
        {baselineYear &&
          targetYear &&
          targetYear - baselineYear < 3 && (
            <div className="p-2 bg-yellow-100 rounded text-red-600">
              ⚠️ ES9 Not Applicable (baseline year &lt; 3 tahun)
            </div>
          )}
      </div>

      {/* Progress Estimator */}
      <div className="p-4 bg-gray-50 rounded shadow space-y-2">
        <h2 className="text-lg font-semibold">Progress Estimator</h2>
        <div>
          <label className="block text-sm mb-1">Reported Emission (tCO2e)</label>
          <input
            type="number"
            value={reportedEmission}
            onChange={(e) => setReportedEmission(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </div>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={handleProgressCalc}
        >
          Hitung Progress
        </button>
        {progress !== null && (
          <div className="text-sm">
            Progress: <strong>{progress}%</strong>
          </div>
        )}
      </div>

      {/* Dashboard Visual */}
      <div className="p-4 bg-gray-50 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Tren Emisi</h2>
        <Line data={chartData} />
        {progress !== null && (
          <div className="mt-4">
            <label className="block text-sm mb-1">Progress ke Net Zero</label>
            <div className="w-full bg-gray-200 rounded h-6">
              <div
                className="bg-green-600 text-white h-6 text-xs flex justify-center items-center"
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmissionNetZeroDashboard;
