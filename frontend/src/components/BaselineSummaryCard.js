import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BaselineSummaryCard = ({ selectedYear }) => {
  const [baselineData, setBaselineData] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBaseline = async () => {
      try {
        const res = await fetch("http://qssr-app-production.up.railway.app/api/netzero/");
        if (res.ok) {
          const data = await res.json();
          setBaselineData(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBaseline();
  }, []);

  useEffect(() => {
    const fetchProgress = async () => {
  try {
    const currentYear = selectedYear || new Date().getFullYear();

    const progressPromises = baselineData.map(async (item) => {
      const campus = item.campus_name.toLowerCase();

      // reported emissions per campus
      const reportedRes = await fetch(
        `http://qssr-app-production.up.railway.app/api/emissions/summary-campus/${campus}/${currentYear}`
      );
      const reportedData = await reportedRes.json();
      const reportedTotal = reportedData.total || 0;

      const progressRes = await fetch(
        `http://qssr-app-production.up.railway.app/api/netzero/${campus}/${currentYear}/progress/${reportedTotal}`
      );
      if (progressRes.ok) {
        return progressRes.json();
      }
      return null;
    });

    const progressResults = await Promise.all(progressPromises);
    setProgressData(progressResults.filter(Boolean));
  } catch (err) {
    console.error(err);
  }
};


    if (baselineData.length > 0) {
      fetchProgress();
    }
  }, [baselineData, selectedYear]);

  return (
    <div className="p-4 rounded shadow bg-gray-100 mt-6">
      <h2 className="text-lg font-bold mb-4">Baseline & Target Net Zero ITB</h2>
      {baselineData.length > 0 ? (
        baselineData.map((item, idx) => {
          const progress = progressData[idx];
          return (
            <div key={idx} className="p-4 mb-4 border rounded shadow bg-white">
              <h3 className="font-semibold">{item.campus_name}</h3>
              <p>Baseline Year: <strong>{item.baseline_year ?? "-"}</strong></p>
              <p>Baseline Emission: <strong>{item.baseline_emission ?? "-"} tCO2e</strong></p>
              <p>Target Year (0 tCO2e): <strong>{item.target_year ?? "-"}</strong></p>
              {progress ? (
                <>
                  <p>Expected Emission ({progress.year}): <strong>{progress.expectedEmission.toFixed(2)} tCO2e</strong></p>
                  <p>Reported Emission: <strong>{progress.reportedEmission.toFixed(2)} tCO2e</strong></p>
                  <div className="mt-2">
                    <div className="text-sm">Progress to Net Zero:</div>
                    <div className="w-full bg-gray-300 rounded-full h-4 mt-1">
                      <div
                        className="bg-green-600 h-4 rounded-full"
                        style={{ width: `${progress.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs mt-1">{progress.progress.toFixed(1)}%</div>
                  </div>
                </>
              ) : (
                <p>Progress data unavailable.</p>
              )}
              <button
                onClick={() => navigate("/baseline-target-form")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-2"
              >
                Edit Baseline & Target
              </button>
            </div>
          );
        })
      ) : (
        <p>Belum ada data baseline / target.</p>
      )}
    </div>
  );
};

export default BaselineSummaryCard;
