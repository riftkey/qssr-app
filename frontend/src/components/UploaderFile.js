import { useState } from "react";

export default function UploadDataCollection() {
  const [file, setFile] = useState(null);
  const [value, setValue] = useState("");
  const [year, setYear] = useState(2025);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("evidence", file);
    formData.append("indicator_id", 1);        // contoh
    formData.append("subindicator_id", 2);     // contoh
    formData.append("year", year);
    formData.append("value", value);
    formData.append("evidence_url", "https://contoh.com/bukti2");
    formData.append("submitted_by", 1);        // contoh
    formData.append("validated_by", 2);        // contoh

    try {
      const response = await fetch(
        "http://localhost:3000/api/data-collection/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      console.log("success:", result);
      alert("Berhasil upload & simpan data!");
    } catch (err) {
      console.error(err);
      alert("Upload gagal");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Nilai:
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <br />
      <label>
        Tahun:
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
      </label>
      <br />
      <label>
        File Evidence (PDF):
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </label>
      <br />
      <button type="submit">Upload & Simpan</button>
    </form>
  );
}
