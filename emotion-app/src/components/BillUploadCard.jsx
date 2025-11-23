import React, { useState } from "react";

export default function BillUploadCard({ onUpload, loading }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = () => {
    if (selectedFile) onUpload(selectedFile);
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h2 className="text-lg font-semibold mb-2">Upload Your Medical Bill</h2>

      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => setSelectedFile(e.target.files[0])}
        className="mb-3"
      />

      <button
        onClick={handleSubmit}
        disabled={!selectedFile || loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md w-full"
      >
        {loading ? "Analyzing..." : "Analyze Bill"}
      </button>
    </div>
  );
}
