import React from "react";
import { Flame, Bolt, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

const scopeIcon = {
  "Scope 1": <Flame className="w-4 h-4 text-red-500" />,
  "Scope 2": <Bolt className="w-4 h-4 text-blue-500" />,
  "Scope 3": <Leaf className="w-4 h-4 text-green-500" />,
};

const CardTotalScope = ({
  scopeType = "Scope 1",
  total = 0,
  sources = [],
  campusTotals = [],
}) => {
  const navigate = useNavigate();

  const totalAllSources = sources.reduce((acc, s) => acc + s.amount, 0);

  const getColor = () => {
    if (scopeType === "Scope 1") return "text-red-600";
    if (scopeType === "Scope 2") return "text-blue-600";
    return "text-green-600";
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-10 w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Total Emisi {scopeType}
      </h2>
      <p className={`text-3xl font-bold ${getColor()} mb-4`}>
        {parseFloat(total).toFixed(2)} tCO₂e
      </p>

      <h3 className="text-md font-semibold text-gray-700 mb-2">
        Penyumbang Emisi Terbesar
      </h3>
      {sources.length === 0 ? (
        <p className="text-sm text-gray-500">Tidak ada data sumber.</p>
      ) : (
        <ul className="space-y-2">
          {sources.map((source, idx) => {
            const percentage =
              totalAllSources > 0
                ? ((source.amount / totalAllSources) * 100).toFixed(1)
                : 0;
            return (
              <li
                key={idx}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  {scopeIcon[scopeType] || (
                    <Flame className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-800">
                    {source.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {source.amount.toFixed(2)} tCO₂e
                  </p>
                  <p className="text-xs text-gray-500">
                    {percentage}% dari {scopeType}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {campusTotals.length > 0 && (
        <>
          <h3 className="text-md font-semibold text-gray-700 mt-6 mb-2">
            Total Emisi per Kampus
          </h3>
          <ul className="space-y-2">
            {campusTotals.map((campus, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between bg-gray-100 p-3 rounded-xl"
              >
                <span className="text-sm font-medium text-gray-800">
                  {campus.name}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {campus.amount.toFixed(2)} tCO₂e
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <button
        onClick={() =>
          navigate(`/${scopeType.toLowerCase().replace(/\s+/g, "")}-calculator`)
        }
        className="mt-4 w-full bg-green-600 text-white font-medium py-2 rounded-xl hover:bg-green-700 transition"
      >
        Hitung Emisi
      </button>
    </div>
  );
};

export default CardTotalScope;
