import React, { useState } from "react";
import {
  Upload,
  XCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Copy,
  Send,
  X,
} from "lucide-react";
import BillingCallSimulator from "../components/BillingCallSimulator";

function BillAnalyzer() {
  const [step, setStep] = useState("upload"); // 'upload' | 'results' | 'draft'
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [appeal, setAppeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState(new Set());
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);

  // NEW: call simulator state
  const [showCallSim, setShowCallSim] = useState(false);
  const [callScript, setCallScript] = useState([]);
  const [callLoading, setCallLoading] = useState(false);

  const uploadAndAnalyze = async (selectedFile) => {
    if (!selectedFile) return alert("Upload a bill first!");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("http://localhost:8080/analyze-bill", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setAnalysis(data.analysis);
      setAppeal(data.appeal);
      setStep("results");
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      uploadAndAnalyze(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      uploadAndAnalyze(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const resetAnalysis = () => {
    setStep("upload");
    setFile(null);
    setAnalysis(null);
    setAppeal(null);
    setSelectedIssues(new Set());
    setGeneratedEmail(null);
    setCallScript([]);
    setShowCallSim(false);
  };

  const toggleIssueSelection = (issueIndex) => {
    const newSelected = new Set(selectedIssues);
    if (newSelected.has(issueIndex)) {
      newSelected.delete(issueIndex);
    } else {
      newSelected.add(issueIndex);
    }
    setSelectedIssues(newSelected);
  };

  const generateDisputeEmail = async () => {
    if (selectedIssues.size === 0) {
      alert("Please select at least one issue to dispute.");
      return;
    }

    setEmailLoading(true);
    try {
      const selectedIssueDetails = Array.from(selectedIssues).map(
        (index) => analysis.potential_issues[index]
      );

      const response = await fetch(
        "http://localhost:8080/draft-appeal-letter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patient_info: analysis.patient_info,
            provider_info: analysis.provider_info,
            bill_info: analysis.bill_info,
            analysis: {
              high_level_summary: analysis.high_level_summary,
              potential_issues: selectedIssueDetails,
            },
            issues_summary: `Selected ${selectedIssues.size} issues for dispute`,
            tone: "firm-but-polite",
          }),
        }
      );

      const data = await response.json();
      setGeneratedEmail(data.letter);
      setStep("draft");
    } catch (error) {
      console.error("Email generation failed:", error);
      alert("Failed to generate email. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const openMailto = () => {
    if (!generatedEmail) return;

    const subject = encodeURIComponent(
      "Medical Bill Dispute - Account Number"
    );
    const body = encodeURIComponent(generatedEmail);
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;

    window.open(mailtoLink);
  };

  const copyAppealToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      alert("Appeal letter copied to clipboard.");
    } catch {
      alert("Could not copy text. Please copy manually.");
    }
  };

  // Calculate total potential savings (rough)
  const totalSavings = Array.from(selectedIssues)
    .map((index) => analysis?.potential_issues?.[index])
    .filter(Boolean)
    .reduce((sum, issue) => {
      const text = `${issue.patient_impact} ${issue.dispute_rationale}`;
      const matches = text.match(/\$[\d,]+\.?\d*/g);
      if (matches) {
        return sum + parseFloat(matches[0].replace("$", "").replace(",", ""));
      }
      return sum + 50; // default estimate
    }, 0)
    .toFixed(2);

  // NEW: practice phone call using Gemini script
  const handleStartCall = async () => {
    if (!analysis) return;
    if (!analysis.potential_issues || analysis.potential_issues.length === 0)
      return;

    setShowCallSim(true);
    setCallLoading(true);

    try {
      const selectedIssueDetails =
        selectedIssues.size > 0
          ? Array.from(selectedIssues).map(
              (idx) => analysis.potential_issues[idx]
            )
          : analysis.potential_issues.slice(0, 3); // fallback: first few issues

      const res = await fetch("http://localhost:8080/simulate-billing-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_info: analysis.patient_info,
          provider_info: analysis.provider_info,
          bill_info: analysis.bill_info,
          issues: selectedIssueDetails,
          max_turns: 10,
        }),
      });

      const data = await res.json();
      if (data.turns) {
        setCallScript(data.turns);
      } else {
        console.error("Call script error:", data);
        alert("Could not generate call script. Try again.");
        setShowCallSim(false);
      }
    } catch (err) {
      console.error("Call simulation failed:", err);
      alert("Call simulation failed. Try again.");
      setShowCallSim(false);
    } finally {
      setCallLoading(false);
    }
  };

  // --------------------------------------------------
  // STEP 1 – UPLOAD
  // --------------------------------------------------
  if (step === "upload") {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
              Bill Analysis
            </h1>
            <p className="text-slate-600 text-base lg:text-lg">
              Upload your medical bill to detect coding issues you can question
              and use an AI-drafted appeal letter to push back.
            </p>
          </header>

          <div
            className={`mt-16 border-2 border-dashed rounded-3xl p-10 lg:p-16 text-center transition-all duration-300 bg-white shadow-sm cursor-pointer ${
              loading
                ? "border-emerald-400 bg-emerald-50/40"
                : dragOver
                ? "border-blue-400 bg-blue-50 scale-105"
                : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() =>
              !loading &&
              document.getElementById("bill-upload-input")?.click()
            }
          >
            <input
              id="bill-upload-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />

            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16 mb-2">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Analyzing your bill…
                </h2>
                <p className="text-slate-600 text-sm">
                  Cross-checking codes against common CPT/HCPCS patterns.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center border border-slate-200 mb-2">
                  <Upload className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {dragOver ? "Drop your file here" : "Upload your statement"}
                </h2>
                <p className="text-slate-600 max-w-md text-sm lg:text-base">
                  Drag and drop a PDF or image of your bill, or click to browse
                  files from your device.
                </p>
                {file && (
                  <p className="mt-2 text-xs text-slate-500">
                    Last selected:{" "}
                    <span className="font-medium">{file.name}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // STEP 2 – RESULTS
  // --------------------------------------------------
  if (step === "results") {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <header className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Bill Analysis
              </h1>
              <p className="text-slate-600 text-sm md:text-base">
                Review what looks correct and which line items might be
                contestable.
              </p>
            </div>

            {analysis?.potential_issues?.length > 0 && (
              <button
                onClick={handleStartCall}
                disabled={callLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {callLoading ? "Preparing call..." : "Practice phone call"}
              </button>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-20">
            {/* Overview */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-emerald-50">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 text-sm">
                    Bill Overview &amp; Information
                  </h2>
                  <p className="text-xs text-slate-500">
                    AI summary and extracted details from your bill.
                  </p>
                </div>
              </div>

              <div className="p-5 border-b border-slate-100 bg-slate-50/60">
                <h3 className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
                  Executive Summary
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {analysis?.high_level_summary || "No summary available."}
                </p>
              </div>

              {(analysis?.patient_info ||
                analysis?.provider_info ||
                analysis?.bill_info) && (
                <div className="p-5 space-y-4">
                  <h3 className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                    Extracted Information
                  </h3>

                  <div className="grid gap-3">
                    {analysis.patient_info &&
                      Object.keys(analysis.patient_info).some(
                        (key) => analysis.patient_info[key]
                      ) && (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <h4 className="text-xs font-semibold text-slate-900 mb-2">
                            Patient Information
                          </h4>
                          <div className="space-y-1 text-xs text-slate-600">
                            {analysis.patient_info.name && (
                              <p>
                                <span className="font-medium">Name:</span>{" "}
                                {analysis.patient_info.name}
                              </p>
                            )}
                            {analysis.patient_info.account_number && (
                              <p>
                                <span className="font-medium">Account #:</span>{" "}
                                {analysis.patient_info.account_number}
                              </p>
                            )}
                            {analysis.patient_info.dob && (
                              <p>
                                <span className="font-medium">DOB:</span>{" "}
                                {analysis.patient_info.dob}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                    {analysis.provider_info &&
                      Object.keys(analysis.provider_info).some(
                        (key) => analysis.provider_info[key]
                      ) && (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <h4 className="text-xs font-semibold text-slate-900 mb-2">
                            Provider Information
                          </h4>
                          <div className="space-y-1 text-xs text-slate-600">
                            {analysis.provider_info.name && (
                              <p>
                                <span className="font-medium">Name:</span>{" "}
                                {analysis.provider_info.name}
                              </p>
                            )}
                            {analysis.provider_info.billing_dept && (
                              <p>
                                <span className="font-medium">
                                  Department:
                                </span>{" "}
                                {analysis.provider_info.billing_dept}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                    {analysis.bill_info &&
                      Object.keys(analysis.bill_info).some(
                        (key) => analysis.bill_info[key]
                      ) && (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <h4 className="text-xs font-semibold text-slate-900 mb-2">
                            Bill Details
                          </h4>
                          <div className="space-y-1 text-xs text-slate-600">
                            {analysis.bill_info.bill_date && (
                              <p>
                                <span className="font-medium">Date:</span>{" "}
                                {analysis.bill_info.bill_date}
                              </p>
                            )}
                            {analysis.bill_info.total_amount && (
                              <p>
                                <span className="font-medium">Total:</span>{" "}
                                {analysis.bill_info.total_amount}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* Issues */}
            <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-rose-100 flex items-center gap-3 bg-rose-50">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 text-sm">
                    Coding Issues Detected
                  </h2>
                  <p className="text-xs text-rose-600 font-medium">
                    {analysis?.potential_issues?.length || 0} line
                    {(analysis?.potential_issues?.length || 0) === 1 ? "" : "s"}{" "}
                    flagged for review
                  </p>
                </div>
              </div>

              {!analysis?.potential_issues?.length ? (
                <div className="p-5 text-sm text-slate-500">
                  No clear coding issues were detected. You can still use the
                  summary to talk with your provider if something feels off.
                </div>
              ) : (
                <div className="divide-y divide-rose-50">
                  {analysis.potential_issues.map((issue, idx) => (
                    <label
                      key={idx}
                      className={`block px-5 py-4 cursor-pointer transition-all border-l-4 ${
                        selectedIssues.has(idx)
                          ? "bg-rose-50 border-l-rose-500"
                          : "bg-white hover:bg-slate-50 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {issue.can_patient_dispute && (
                          <input
                            type="checkbox"
                            className="mt-1 w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                            checked={selectedIssues.has(idx)}
                            onChange={() => toggleIssueSelection(idx)}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-100 text-xs font-mono font-semibold text-rose-700">
                                Issue #{idx + 1}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-medium text-slate-700">
                                {issue.issue_type}
                              </span>
                            </div>
                            <div
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                issue.can_patient_dispute
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {issue.can_patient_dispute
                                ? "Disputable"
                                : "Non-disputable"}
                            </div>
                          </div>

                          <div className="bg-white border border-rose-100 rounded-lg p-3 text-xs text-slate-700 mb-2">
                            <p className="uppercase tracking-wide text-[10px] text-rose-600 font-semibold mb-1">
                              Line Item
                            </p>
                            <p className="mb-2">{issue.line_snippet}</p>

                            <p className="uppercase tracking-wide text-[10px] text-rose-600 font-semibold mb-1">
                              Why this might be incorrect
                            </p>
                            <p className="whitespace-pre-wrap mb-2">
                              {issue.dispute_rationale}
                            </p>

                            <p className="uppercase tracking-wide text-[10px] text-rose-600 font-semibold mb-1">
                              Financial Impact
                            </p>
                            <p>{issue.patient_impact}</p>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            {issue.codes?.length > 0 && (
                              <span className="text-slate-500">
                                Codes: {issue.codes.join(", ")}
                              </span>
                            )}
                            <span className="font-semibold text-emerald-600">
                              Potential savings: ~$50–200
                            </span>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom action bar */}
          {analysis?.potential_issues?.some(
            (issue) => issue.can_patient_dispute
          ) && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-xl border border-slate-200 rounded-full px-6 py-3 flex items-center gap-6 max-w-full z-50">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">
                  Charges under review
                </div>
                <div className="text-lg font-semibold text-emerald-600">
                  ${totalSavings}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetAnalysis}
                  className="text-xs px-3 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Reset Analysis
                </button>
                <button
                  onClick={generateDisputeEmail}
                  disabled={selectedIssues.size === 0 || emailLoading}
                  className={`text-xs px-4 py-2 rounded-full flex items-center gap-1 ${
                    selectedIssues.size === 0 || emailLoading
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {emailLoading ? "Generating..." : "Draft Appeal"}
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Call simulator modal */}
        <BillingCallSimulator
          open={showCallSim}
          onClose={() => setShowCallSim(false)}
          analysis={analysis}
          script={callScript}
        />
      </div>
    );
  }

  // --------------------------------------------------
  // STEP 3 – Draft appeal
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="max-w-5xl mx-auto pb-24">
        <button
          onClick={() => setStep("results")}
          className="mb-6 flex items-center text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to analysis
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Appeal letter draft
        </h1>
        <p className="text-slate-600 mb-6 text-sm">
          You can edit this letter before copying and sending it to your
          provider or insurance company.
        </p>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-4">
          <textarea
            value={generatedEmail || ""}
            onChange={(e) => setGeneratedEmail(e.target.value)}
            className="w-full min-h-[400px] text-sm leading-relaxed border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-vertical bg-slate-50"
            placeholder="Your appeal letter will appear here..."
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={copyAppealToClipboard}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600"
          >
            <Copy className="w-4 h-4" />
            Copy to clipboard
          </button>

          <button
            onClick={openMailto}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
          >
            <Send className="w-4 h-4" />
            Open in Email App
          </button>
        </div>
      </div>
    </div>
  );
}

export default BillAnalyzer;
