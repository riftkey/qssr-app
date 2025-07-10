import React, { useEffect, useState } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";


const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [contactType, setContactType] = useState("academician");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  useEffect(() => {
    fetchContacts();
  }, [contactType, searchTerm]);

  const fetchContacts = async () => {
    try {
      const res = await fetch(
        `https://qssr-app-production.up.railway.app/api/contacts/${contactType}?search=${searchTerm}`
      );
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.error("Gagal fetch kontak:", err);
    }
  };

  const handleExport = () => {
    window.open(
      `https://qssr-app-production.up.railway.app/api/contacts/${contactType}/export`,
      "_blank"
    );
  };

  const handleInputChange = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const handleAddRow = () => {
    const newRow =
      contactType === "employer"
        ? {
            source: "",
            title: "",
            first_name: "",
            last_name: "",
            position: "",
            industry: "",
            company_name: "",
            country_or_territory: "",
            email: "",
            phone: "",
          }
        : {
            form_institution: "",
            pronoun: "",
            first_name: "",
            last_name: "",
            position: "",
            department: "",
            institution: "",
            country: "",
            email: "",
            discipline: "",
            phone_number: "",
          };
    setContacts((prev) => [...prev, newRow]);
  };

  const handleSaveAll = async () => {
    try {
      const cleanedContacts = contacts.map((c) => {
        if (!c.id || isNaN(c.id) || parseInt(c.id) <= 0) {
          const { id, ...rest } = c;
          return rest;
        }
        return c;
      });

      const res = await fetch("https://qssr-app-production.up.railway.app/api/contacts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contactType,
          contacts: cleanedContacts,
        }),
      });

      if (res.ok) {
        alert("Berhasil disimpan!");
        fetchContacts();
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };

  // dynamic columns
  const columns =
    contactType === "employer"
      ? [
          { key: "source", label: "Source" },
          { key: "title", label: "Title" },
          { key: "first_name", label: "First Name" },
          { key: "last_name", label: "Last Name" },
          { key: "position", label: "Position" },
          { key: "industry", label: "Industry" },
          { key: "company_name", label: "Company Name" },
          { key: "country_or_territory", label: "Country or Territory" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
        ]
      : [
          { key: "form_institution", label: "Form Institution" },
          { key: "pronoun", label: "Pronoun" },
          { key: "first_name", label: "First Name" },
          { key: "last_name", label: "Last Name" },
          { key: "position", label: "Position" },
          { key: "department", label: "Department" },
          { key: "institution", label: "Institution" },
          { key: "country", label: "Country" },
          { key: "email", label: "Email" },
          { key: "discipline", label: "Discipline" },
          { key: "phone_number", label: "Phone Number" },
        ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Daftar Kontak</h1>
        

        <div className="flex gap-2">
  <select
    value={contactType}
    onChange={(e) => setContactType(e.target.value)}
    className="border rounded px-2 py-1 tipe-kontak"
  >
    <option value="academician">Dosen</option>
    <option value="employer">Employer</option>
  </select>
  <button
    className="bg-green-600 text-white px-3 py-1 rounded text-sm tombol-export"
    onClick={handleExport}
  >
    Export CSV
  </button>
  <button
    className="bg-yellow-600 text-white px-3 py-1 rounded text-sm tombol-import"
    onClick={() => document.getElementById("importFile").click()}
  >
    Import CSV
  </button>
  <button
    className="bg-blue-600 text-white px-3 py-1 rounded text-sm tombol-simpan"
    onClick={handleSaveAll}
  >
    Simpan Semua
  </button>
  <button
    className="bg-gray-600 text-white px-3 py-1 rounded text-sm tombol-tambah"
    onClick={handleAddRow}
  >
    Tambah Baris
  </button>
  <a
    href="httpss://support.qs.com/hc/en-gb/articles/4413986473618-Academic-and-Employer-Surveys"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-purple-600 text-white px-3 py-1 rounded text-sm link-panduan"
  >
    Panduan QS
  </a>
  <button
  onClick={() => {
    introJs().setOptions({
      steps: [
        {
          element: ".tipe-kontak",
          intro: "Pilih tipe kontak: Dosen atau Employer. Ini akan menentukan struktur data yang ditampilkan.",
        },
        {
          element: ".search-kontak",
          intro: "Gunakan kolom ini untuk mencari berdasarkan nama depan/belakang.",
        },
        {
          element: ".tabel-kontak",
          intro: "Edit langsung semua kolom di sini. Anda bisa menambah atau menghapus baris.",
        },
        {
          element: ".tombol-simpan",
          intro: "Klik ini untuk menyimpan semua perubahan ke server.",
        },
        {
          element: ".tombol-export",
          intro: "Export seluruh data kontak ke format CSV.",
        },
        {
          element: ".tombol-import",
          intro: "Import data kontak dari file CSV. Pastikan formatnya sesuai.",
        },
        {
          element: ".tombol-tambah",
          intro: "Tambahkan satu baris kosong baru untuk input kontak manual.",
        },
        {
          element: ".link-panduan",
          intro: "Klik ini untuk membuka panduan resmi QS untuk kontak akademik dan employer.",
        },
      ],
      showProgress: true,
      showBullets: false,
      nextLabel: "Lanjut",
      prevLabel: "Kembali",
      skipLabel: "Lewati",
      doneLabel: "Selesai",
    }).start();
  }}
  className="bg-indigo-600 text-white px-3 py-1 rounded text-sm"
>
   Mulai Panduan
</button>

  <input
    type="file"
    accept=".csv"
    id="importFile"
    className="hidden"
    onChange={async (e) => {
      if (e.target.files.length === 0) return;
      const file = e.target.files[0];

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(
          `https://qssr-app-production.up.railway.app/api/contacts/${contactType}/import`,
          {
            method: "POST",
            body: formData,
          }
        );
        if (res.ok) {
          alert("Berhasil import CSV!");
          fetchContacts();
        } else {
          alert("Gagal import.");
        }
      } catch (err) {
        console.error(err);
        alert("Server error.");
      }
    }}
  />
</div>

      </div>

      <div>
        <input
          type="text"
          placeholder="Cari nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-2 py-1 w-full search-kontak"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border tabel-kontak">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="border p-2">
                  {col.label}
                </th>
              ))}
              <th className="border p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col.key} className="border p-1">
                    <input
                      type="text"
                      value={c[col.key] || ""}
                      onChange={(e) =>
                        handleInputChange(idx, col.key, e.target.value)
                      }
                      className="w-full border rounded px-1 py-0.5"
                    />
                  </td>
                ))}
                <td className="border p-1">
                  {c.id && (
                    <button
                      onClick={() =>
                        setDeleteConfirm({ show: true, id: c.id })
                      }
                      className="text-red-600 text-xs"
                    >
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="text-center p-2">
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow">
            <p>Yakin ingin menghapus kontak ini?</p>
            <div className="flex gap-2 mt-2 justify-end">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: null })}
                className="px-2 py-1 bg-gray-300 rounded"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `https://qssr-app-production.up.railway.app/api/contacts/${contactType}/${deleteConfirm.id}`,
                      { method: "DELETE" }
                    );
                    if (res.ok) {
                      setContacts((prev) =>
                        prev.filter((c) => c.id !== deleteConfirm.id)
                      );
                      setDeleteConfirm({ show: false, id: null });
                    } else {
                      alert("Gagal menghapus kontak di server");
                    }
                  } catch (err) {
                    console.error("Gagal menghapus:", err);
                    alert("Gagal menghapus kontak.");
                  }
                }}
                className="px-2 py-1 bg-red-600 text-white rounded"
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

export default ContactsPage;
