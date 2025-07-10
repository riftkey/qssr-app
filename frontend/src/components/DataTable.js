const DataTable = () => {
  const dummyData = [
    { id: 1, category: "Environmental", indicator: "Carbon Emission", value: "526,098 tCO2e" },
    { id: 2, category: "Social Impact", indicator: "Community Service", value: "123 Projects" },
  ];

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      <table className="min-w-full table-auto">
        <thead className="bg-blue-500 text-white">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium">Kategori</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Indikator</th>
            <th className="px-6 py-3 text-left text-sm font-medium">Nilai</th>
          </tr>
        </thead>
        <tbody>
          {dummyData.map((data, index) => (
            <tr key={data.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              <td className="px-6 py-4 text-sm text-gray-700">{data.category}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{data.indicator}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{data.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
