import React from "react";

export default function BillResults({ analysis, appealLetter }) {
  return (
    <div className="mt-6 bg-white border rounded-lg p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Bill Analysis Results</h2>

      <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
        {JSON.stringify(analysis, null, 2)}
      </pre>

      <h2 className="text-lg font-semibold mt-6 mb-2">Generated Appeal Letter</h2>

      <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
        {appealLetter}
      </pre>
    </div>
  );
}
