import React, { useState } from "react";

function BillAnalyzer() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [appeal, setAppeal] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadAndAnalyze = async () => {
    if (!file) return alert("Upload a bill first!");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:8080/analyze-bill", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setAnalysis(data.analysis);
    setAppeal(data.appeal);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white border rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">Bill Analyzer</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="border p-3 rounded-lg w-full mb-4"
      />

      <button
        onClick={uploadAndAnalyze}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg mb-4"
      >
        {loading ? "Analyzing..." : "Analyze Bill"}
      </button>

      {/* Analysis */}
      {analysis && (
        <div className="mt-6 p-4 border rounded-lg bg-slate-50">
          <h2 className="font-semibold text-lg mb-2">Billing Findings</h2>

          <p className="text-sm whitespace-pre-wrap mb-4">
            {analysis.high_level_summary}
          </p>

          {/* ⭐ FIXED: Safe object rendering */}
          {analysis.potential_issues?.length > 0 && (
            <>
              <h3 className="font-semibold text-md mb-2">Potential Issues:</h3>

              <div className="space-y-3">
                {analysis.potential_issues.map((issue, idx) => (
                  <div key={idx} className="p-3 bg-white border rounded-lg shadow-sm">
                    
                    <p className="text-sm font-semibold text-red-600">
                      {issue.issue_type}
                    </p>

                    <p className="text-sm mt-1">
                      <strong>Line:</strong> {issue.line_snippet}
                    </p>

                    <p className="text-sm mt-1">
                      <strong>Codes:</strong> {issue.codes.join(", ")}
                    </p>

                    <p className="text-sm mt-1">
                      <strong>Impact:</strong> {issue.patient_impact}
                    </p>

                    <p className="text-sm mt-1">
                      <strong>Can dispute?</strong> {issue.can_patient_dispute ? "Yes" : "No"}
                    </p>

                    <p className="text-sm mt-1 whitespace-pre-wrap">
                      <strong>Reason:</strong> {issue.dispute_rationale}
                    </p>

                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Appeal */}
      {appeal && (
        <div className="mt-6 p-4 border rounded-lg bg-blue-50">
          <h2 className="font-semibold text-lg mb-2">Draft Appeal Letter</h2>

          <pre className="text-sm whitespace-pre-wrap">
            {typeof appeal === "string"
              ? appeal
              : JSON.stringify(appeal, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default BillAnalyzer;
