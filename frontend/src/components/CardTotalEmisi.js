import React, { useEffect, useState } from "react";

const CardTotalEmisi = ({ year }) => {
  const [loading, setLoading] = useState(true);
  const [totalAll, setTotalAll] = useState(0);
  const [perCampus, setPerCampus] = useState([]);

  useEffect(() => {
    const fetchEmisi = async () => {
      try {
        // total semua kampus
        const resAll = await fetch(`http://localhost:5000/api/emissions/summary-all/${year}`);
        const dataAll = await resAll.json();
        setTotalAll(dataAll.total || 0);

        // total per kampus
        const campuses = ["ganesha", "jatinangor"];
        const results = await Promise.all(
          campuses.map(async (campus) => {
            const res = await fetch(
              `http://localhost:5000/api/emissions/summary-campus/${campus}/${year}`
            );
            const data = await res.json();
            return {
              name: campus.charAt(0).toUpperCase() + campus.slice(1),
              amount: data.total || 0,
            };
          })
        );
        setPerCampus(results);
      } catch (err) {
        console.error("Gagal fetch total emisi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmisi();
  }, [year]);

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-2xl p-6 w-full animate-pulse">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Emisi Karbon</h2>
        <p className="text-3xl font-bold text-green-700 mb-4">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Emisi Karbon</h2>
      <p className="text-3xl font-bold text-green-700 mb-4">
        {totalAll.toFixed(2)} tCO₂e
      </p>

      <h3 className="text-md font-semibold text-gray-700 mt-4 mb-2">Total Per Kampus</h3>
      {perCampus.length === 0 ? (
        <p className="text-sm text-gray-500">Data kampus tidak tersedia.</p>
      ) : (
        <ul className="space-y-2">
          {perCampus.map((campus, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-xl"
            >
              <span className="text-sm font-medium text-gray-800">{campus.name}</span>
              <span className="text-sm font-semibold text-gray-900">
                {campus.amount.toFixed(2)} tCO₂e
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CardTotalEmisi;
