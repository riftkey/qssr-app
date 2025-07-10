import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const EmissionsTrendChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const res = await fetch("https://qssr-app-production.up.railway.app/api/emissions/summary-trend");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Gagal fetch tren emisi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrend();
  }, []);

  return (
    <div className="p-4 bg-white rounded-2xl shadow">
      <h2 className="text-lg font-bold mb-4">Tren Emisi Tahunan per Scope</h2>
      {loading ? (
        <p className="text-gray-500">Memuat data...</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value) => `${value.toLocaleString()} tCO₂e`} />
            <Legend />
            <Line type="monotone" dataKey="scope1" stroke="#8884d8" name="Scope 1" />
            <Line type="monotone" dataKey="scope2" stroke="#82ca9d" name="Scope 2" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default EmissionsTrendChart;
