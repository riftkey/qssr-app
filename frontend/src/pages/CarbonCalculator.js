import React, { useState, useEffect } from "react";
import CardTotalEmisi from "../components/CardTotalEmisi";
import CardTotalScope from "../components/CardTotalScope";
import BaselineSummaryCard from "../components/BaselineSummaryCard";
import introJs from "intro.js";
import "intro.js/introjs.css";



const CarbonCalculator = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [scope1Data, setScope1Data] = useState({ total: 0, sources: [] });
  const [scope2Data, setScope2Data] = useState({ total: 0, sources: [] });
  const [campusScope1Totals, setCampusScope1Totals] = useState([]);
  const [campusScope2Totals, setCampusScope2Totals] = useState([]);

  useEffect(() => {
    const fetchScope1 = async () => {
      try {
        const res = await fetch(
          `https://qssr-app-production.up.railway.app/api/emissions/scope1-summary/${selectedYear}`
        );
        if (res.ok) {
          const data = await res.json();
          setScope1Data({
            total: parseFloat(data.total) || 0,
            sources: data.sources || [],
          });
        }
      } catch (err) {
        console.error("Error fetching scope1 summary:", err);
      }
    };

    const fetchScope2 = async () => {
      try {
        const res = await fetch(
          `https://qssr-app-production.up.railway.app/api/emissions/scope2-summary/${selectedYear}`
        );
        if (res.ok) {
          const data = await res.json();
          setScope2Data({
            total: parseFloat(data.total) || 0,
            sources: data.sources || [],
          });
        }
      } catch (err) {
        console.error("Error fetching scope2 summary:", err);
      }
    };

    const fetchCampusScopeTotals = async () => {
      try {
        const campuses = ["ganesha", "jatinangor"];
        const resultsScope1 = await Promise.all(
          campuses.map(async (campus) => {
            const res = await fetch(
              `https://qssr-app-production.up.railway.app/api/emissions/summary-campus/${campus}/${selectedYear}`
            );
            const data = await res.json();
            return {
              name: campus.charAt(0).toUpperCase() + campus.slice(1),
              amount: data.scope1 || 0,
            };
          })
        );
        const resultsScope2 = await Promise.all(
          campuses.map(async (campus) => {
            const res = await fetch(
              `https://qssr-app-production.up.railway.app/api/emissions/summary-campus/${campus}/${selectedYear}`
            );
            const data = await res.json();
            return {
              name: campus.charAt(0).toUpperCase() + campus.slice(1),
              amount: data.scope2 || 0,
            };
          })
        );
        setCampusScope1Totals(resultsScope1);
        setCampusScope2Totals(resultsScope2);
      } catch (err) {
        console.error("Error fetching campus totals per scope:", err);
      }
    };

    fetchScope1();
    fetchScope2();
    fetchCampusScopeTotals();
  }, [selectedYear]);

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      {/* Onboarding steps */}
      <button
  onClick={() => {
    introJs().setOptions({
      steps: [
        {
          element: ".dropdown-tahun",
          intro: "Pilih tahun pelaporan untuk melihat data emisi tahun tersebut.",
        },
        {
          element: ".card-total-emisi",
          intro: "Ini adalah total emisi gabungan dari semua scope untuk tahun terpilih.",
        },
        {
          element: ".card-scope-1",
          intro: "Menampilkan total emisi Scope 1 per sumber dan kampus.",
        },
        {
          element: ".card-scope-2",
          intro: "Menampilkan total emisi Scope 2 per sumber dan kampus.",
        },
        {
          element: ".card-baseline-summary",
          intro: "Ringkasan baseline dan target emisi tahun ini.",
        },
      ],
      showProgress: true,
      showBullets: false,
      exitOnOverlayClick: false,
      nextLabel: "Lanjut",
      prevLabel: "Kembali",
      doneLabel: "Selesai",
    }).start();
  }}
  className="bg-blue-600 text-white px-3 py-1 rounded mb-4"
>
   Mulai Panduan
</button>


      {/* dropdown tahun */}
      <div className="flex items-center gap-2 mb-4 dropdown-tahun">
        <label className="text-sm">Tahun Pelaporan:</label>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {Array.from({ length: 6 }, (_, i) => 2020 + i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* summary total emisi */}
      <div className="card-total-emisi">
        <CardTotalEmisi year={selectedYear} />
      </div>

      {/* summary scope 1 */}
      <div className="card-scope-1">
        <CardTotalScope
          scopeType="Scope 1"
          total={scope1Data.total}
          sources={scope1Data.sources}
          campusTotals={campusScope1Totals}
        />
      </div>

      {/* summary scope 2 */}
      <div className="card-scope-2">
        <CardTotalScope
          scopeType="Scope 2"
          total={scope2Data.total}
          sources={scope2Data.sources}
          campusTotals={campusScope2Totals}
        />
      </div>

      {/* baseline target summary */}
      <div className="card-baseline-summary">
        <BaselineSummaryCard selectedYear={selectedYear} />
      </div>
    </div>
  );
};

export default CarbonCalculator;
