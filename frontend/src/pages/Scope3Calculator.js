import React, { useState } from "react";

const Scope3Calculator = () => {
  const [travelData, setTravelData] = useState([
    { kegiatan: "", jenisTransportasi: "", jarak: "", faktor: 0.0002 }
  ]);
  const [wasteData, setWasteData] = useState([
    { jenisLimbah: "", jumlah: "", faktor: 0.0004 }
  ]);

  const [modal, setModal] = useState({ show: false, kategori: "", index: null });

  const getEmission = (row) => {
    const a = parseFloat(row.jarak || row.jumlah) || 0;
    const b = parseFloat(row.faktor) || 0;
    return (a * b).toFixed(4);
  };

  const handleDelete = () => {
    if (modal.kategori === "travel") {
      setTravelData(travelData.filter((_, i) => i !== modal.index));
    } else if (modal.kategori === "waste") {
      setWasteData(wasteData.filter((_, i) => i !== modal.index));
    }
    setModal({ show: false, kategori: "", index: null });
  };

  const handleSave = () => {
    console.log("Business Travel:", travelData);
    console.log("Waste:", wasteData);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Kalkulator Emisi Scope 3</h1>

      <Section
        title="✈️ Perjalanan Dinas (Business Travel)"
        data={travelData}
        setData={setTravelData}
        modal={modal}
        setModal={setModal}
        kategori="travel"
        fields={[
          { label: "Kegiatan", key: "kegiatan", type: "text" },
          { label: "Jenis Transportasi", key: "jenisTransportasi", type: "text" },
          { label: "Jarak Tempuh (km)", key: "jarak", type: "number" },
          { label: "Faktor Emisi (tCO₂e/km)", key: "faktor", type: "number", defaultValue: 0.0002 }
        ]}
        getEmission={getEmission}
      />

      <Section
        title="🗑️ Pengelolaan Limbah"
        data={wasteData}
        setData={setWasteData}
        modal={modal}
        setModal={setModal}
        kategori="waste"
        fields={[
          { label: "Jenis Limbah", key: "jenisLimbah", type: "text" },
          { label: "Jumlah (kg)", key: "jumlah", type: "number" },
          { label: "Faktor Emisi (tCO₂e/kg)", key: "faktor", type: "number", defaultValue: 0.0004 }
        ]}
        getEmission={getEmission}
      />

      <button
        className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
        onClick={handleSave}
      >
        Simpan Semua Data
      </button>

      {modal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="text-lg mb-4">Apakah Anda yakin ingin menghapus baris ini?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setModal({ show: false, kategori: "", index: null })}
              >
                Batal
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={handleDelete}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Fix: handleChange pindah ke dalam sini
const Section = ({ title, data, setData, modal, setModal, kategori, fields, getEmission }) => {
  const handleChange = (i, key, value) => {
    const updated = [...data];
    updated[i][key] = value;
    setData(updated);
  };

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>

      {data.map((row, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4 items-end">
          {fields.map((field, fIdx) => (
            <div key={fIdx}>
              <label className="block text-sm mb-1">{field.label}</label>
              <input
                type={field.type}
                placeholder={field.label}
                className="border px-2 py-1 rounded w-full text-sm"
                value={row[field.key]}
                onChange={(e) => handleChange(i, field.key, e.target.value)}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm mb-1">Emisi (tCO₂e)</label>
            <input
              readOnly
              className="border px-2 py-1 rounded w-full text-sm bg-gray-100"
              value={getEmission(row)}
            />
          </div>
          <div className="flex items-center justify-center mt-6">
            <button
              className="text-red-600 border border-red-600 px-3 py-1 rounded text-sm hover:bg-red-100"
              onClick={() => setModal({ show: true, kategori, index: i })}
            >
              Hapus
            </button>
          </div>
        </div>
      ))}

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        onClick={() => {
          const newItem = Object.fromEntries(
            fields.map((f) => [f.key, f.defaultValue || ""])
          );
          setData([...data, newItem]);
        }}
      >
        + Tambah Baris
      </button>
    </div>
  );
};

export default Scope3Calculator;
