import React, { useEffect, useState } from "react";

const statusStyle = {
  "In Progress": "bg-yellow-100 text-yellow-800",
  Completed: "bg-green-100 text-green-800",
  "Not Started": "bg-red-100 text-red-800",
};

const QSSRTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchLensSummary = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/indikator/lens-summary/institusi");
        if (!res.ok) throw new Error("Gagal ambil data");
        const fetchedData = await res.json();

        // Hanya indikator dari institusi
        const filteredData = fetchedData.filter((row) => row.source_data !== "QS");

        setData(filteredData);
      } catch (err) {
        console.error("Gagal fetch lens summary:", err);
      }
    };

    fetchLensSummary();
  }, []);

  return (
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full table-auto bg-white text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Kategori</th>
            <th className="px-4 py-3">Lensa</th>
            <th className="px-4 py-3">Progress</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Last Update</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">{row.kategori}</td>
              <td className="px-4 py-3">{row.lens}</td>
              <td className="px-4 py-3">{row.progress}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[row.status]}`}>
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3">{row.lastUpdate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QSSRTable;
