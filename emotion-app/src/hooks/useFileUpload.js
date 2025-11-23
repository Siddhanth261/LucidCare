import { useState } from 'react';

export const useFileUpload = (startComfortStream) => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsAnalyzing(true);
    setSummary("Extracting text and analyzing report... please wait...");

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const res = await fetch('http://localhost:8080/analyze-report', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      const reportSummary = data.summary;
      setSummary(reportSummary);
      
      startComfortStream(reportSummary);
    } catch (err) {
      console.error(err);
      setSummary("Error analyzing report. Ensure backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { file, summary, isAnalyzing, handleFileUpload };
};
