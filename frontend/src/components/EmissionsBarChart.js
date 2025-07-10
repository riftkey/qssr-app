import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const EmissionsBarChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchEmisiTahunan = async () => {
    try {
      const res = await fetch("https://qssr-app-production.up.railway.app/api/emissions/summary-per-year");
      const result = await res.json();

      // Validasi dan format data
      const mapped = result.map((item) => ({
        year: item.year.toString(),
        emissions: item.emissions || 0,
      }));

      setData(mapped);
    } catch (err) {
      console.error("Gagal fetch data emisi tahunan:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchEmisiTahunan();
}, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full h-[400px]">
      <h2 className="text-xl font-bold mb-4">Total Emisi Tahunan (tCO₂e)</h2>
      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value) => `${value.toLocaleString()} tCO₂e`} />
            <Legend />
            <Bar dataKey="emissions" fill="#3b82f6" name="Emisi Total" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default EmissionsBarChart;
