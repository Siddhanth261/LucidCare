import React, { useState } from "react";
import { Upload, FileText, AlertTriangle, CheckCircle2, X, Eye, Download, FileCheck, Clock, DollarSign, Mail, Send } from "lucide-react";

function BillAnalyzer() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [appeal, setAppeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState(new Set());
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const uploadAndAnalyze = async () => {
    if (!file) return alert("Upload a bill first!");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8080/analyze-bill", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setAnalysis(data.analysis);
      setAppeal(data.appeal);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = () => {
    setFile(null);
    setAnalysis(null);
    setAppeal(null);
    setSelectedIssues(new Set());
    setGeneratedEmail(null);
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
      const selectedIssueDetails = Array.from(selectedIssues).map(index => analysis.potential_issues[index]);
      
      const response = await fetch("http://localhost:8080/draft-appeal-letter", {
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
            potential_issues: selectedIssueDetails
          },
          issues_summary: `Selected ${selectedIssues.size} issues for dispute`,
          tone: "firm-but-polite"
        }),
      });

      const data = await response.json();
      setGeneratedEmail(data.letter);
    } catch (error) {
      console.error("Email generation failed:", error);
      alert("Failed to generate email. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const openMailto = () => {
    if (!generatedEmail) return;
    
    const subject = encodeURIComponent("Medical Bill Dispute - Account [Account Number]");
    const body = encodeURIComponent(generatedEmail);
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    
    window.open(mailtoLink);
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-8 py-6">
          <div className="text-2xl font-bold text-white mb-2">Upload Your Medical Bill</div>
          <p className="text-gray-300">Drag and drop your bill or click to browse files</p>
        </div>
        
        <div className="p-8">
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                dragOver 
                  ? "border-blue-400 bg-blue-50 scale-105" 
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              <div className="max-w-md mx-auto">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 transition-all duration-300 ${
                  dragOver ? "bg-blue-100" : "bg-gray-100"
                }`}>
                  <Upload size={40} className={dragOver ? "text-blue-600" : "text-gray-600"} />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {dragOver ? "Drop your file here" : "Choose or drag your file"}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Upload your medical bill in PDF, JPG, or PNG format. Our AI will analyze it for errors and potential savings.
                </p>
                
                <input
                  type="file"
                  accept="application/pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 cursor-pointer font-medium shadow-lg hover:shadow-xl"
                >
                  <FileText size={20} />
                  Select File
                </label>
                
                <p className="text-sm text-gray-500 mt-4">Maximum file size: 10MB</p>
              </div>
            </div>
          ) : (
            <div className="max-w-lg mx-auto">
              {/* File Preview Card */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      <FileCheck size={24} className="text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{file.name}</h4>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-all duration-200"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              {/* Analyze Button */}
              <button
                onClick={uploadAndAnalyze}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                  loading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                    <span>Analyzing Your Bill...</span>
                  </>
                ) : (
                  <>
                    <Eye size={20} />
                    <span>Analyze Bill</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {(analysis || loading) && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="text-2xl font-bold text-white mb-2">Analysis Results</div>
            <p className="text-blue-100">Detailed breakdown of your medical bill</p>
          </div>
          
          <div className="p-8">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6">
                  <div className="w-10 h-10 border-3 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Processing Your Bill</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Our AI is carefully analyzing your medical bill for errors, overcharges, and opportunities for savings.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Executive Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">Executive Summary</h3>
                      <p className="text-blue-800 leading-relaxed">{analysis.high_level_summary}</p>
                    </div>
                  </div>
                </div>

                {/* Extracted Contact Details */}
                {(analysis.patient_info || analysis.provider_info || analysis.bill_info) && (
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Extracted Bill Information</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Patient Info */}
                      {analysis.patient_info && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-3">Patient Information</h4>
                          <div className="space-y-2 text-sm">
                            {analysis.patient_info.name && <p><span className="font-medium">Name:</span> {analysis.patient_info.name}</p>}
                            {analysis.patient_info.address && <p><span className="font-medium">Address:</span> {analysis.patient_info.address}</p>}
                            {analysis.patient_info.city_state_zip && <p><span className="font-medium">City/State:</span> {analysis.patient_info.city_state_zip}</p>}
                            {analysis.patient_info.phone && <p><span className="font-medium">Phone:</span> {analysis.patient_info.phone}</p>}
                            {analysis.patient_info.email && <p><span className="font-medium">Email:</span> {analysis.patient_info.email}</p>}
                            {analysis.patient_info.account_number && <p><span className="font-medium">Account #:</span> {analysis.patient_info.account_number}</p>}
                            {analysis.patient_info.dob && <p><span className="font-medium">DOB:</span> {analysis.patient_info.dob}</p>}
                          </div>
                        </div>
                      )}

                      {/* Provider Info */}
                      {analysis.provider_info && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-3">Provider Information</h4>
                          <div className="space-y-2 text-sm">
                            {analysis.provider_info.name && <p><span className="font-medium">Name:</span> {analysis.provider_info.name}</p>}
                            {analysis.provider_info.billing_dept && <p><span className="font-medium">Department:</span> {analysis.provider_info.billing_dept}</p>}
                            {analysis.provider_info.address && <p><span className="font-medium">Address:</span> {analysis.provider_info.address}</p>}
                            {analysis.provider_info.city_state_zip && <p><span className="font-medium">City/State:</span> {analysis.provider_info.city_state_zip}</p>}
                            {analysis.provider_info.phone && <p><span className="font-medium">Phone:</span> {analysis.provider_info.phone}</p>}
                          </div>
                        </div>
                      )}

                      {/* Bill Info */}
                      {analysis.bill_info && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-3">Bill Details</h4>
                          <div className="space-y-2 text-sm">
                            {analysis.bill_info.bill_date && <p><span className="font-medium">Bill Date:</span> {analysis.bill_info.bill_date}</p>}
                            {analysis.bill_info.due_date && <p><span className="font-medium">Due Date:</span> {analysis.bill_info.due_date}</p>}
                            {analysis.bill_info.total_amount && <p><span className="font-medium">Total Amount:</span> {analysis.bill_info.total_amount}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✅ <strong>Auto-detected:</strong> This information will be automatically included in your dispute letter.
                      </p>
                    </div>
                  </div>
                )}

                {/* Issues Found */}
                {analysis.potential_issues?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle size={24} className="text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Issues Identified</h3>
                        <p className="text-gray-600">{analysis.potential_issues.length} potential problems found</p>
                      </div>
                    </div>
                    
                    <div className="grid gap-6">
                      {analysis.potential_issues.map((issue, idx) => (
                        <div key={idx} className={`bg-gradient-to-br border rounded-xl p-6 transition-all duration-200 ${
                          selectedIssues.has(idx) 
                            ? "from-blue-50 to-indigo-50 border-blue-300 ring-2 ring-blue-200" 
                            : "from-red-50 to-orange-50 border-red-200 hover:border-red-300"
                        }`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {issue.can_patient_dispute && (
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedIssues.has(idx)}
                                    onChange={() => toggleIssueSelection(idx)}
                                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                  <span className="ml-2 text-sm text-gray-700 font-medium">Select for dispute</span>
                                </label>
                              )}
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                Issue #{idx + 1}
                              </span>
                              <span className="px-3 py-1 bg-white/80 text-gray-700 rounded-full text-sm font-medium">
                                {issue.issue_type}
                              </span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              issue.can_patient_dispute
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {issue.can_patient_dispute ? "Disputable" : "Non-disputable"}
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Line Item</h4>
                                <p className="text-gray-700 bg-white/60 rounded-lg p-3">{issue.line_snippet}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Medical Codes</h4>
                                <p className="text-gray-700 bg-white/60 rounded-lg p-3">
                                  {issue.codes?.join(", ") || "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Patient Impact</h4>
                                <p className="text-gray-700 bg-white/60 rounded-lg p-3">{issue.patient_impact}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Dispute Rationale</h4>
                                <p className="text-gray-700 bg-white/60 rounded-lg p-3 leading-relaxed">
                                  {issue.dispute_rationale}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Dispute Actions */}
                    {analysis.potential_issues.some(issue => issue.can_patient_dispute) && (
                      <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-blue-900">Dispute Selected Issues</h3>
                            <p className="text-blue-700">
                              {selectedIssues.size} of {analysis.potential_issues.filter(issue => issue.can_patient_dispute).length} disputable issues selected
                            </p>
                          </div>
                          <button
                            onClick={generateDisputeEmail}
                            disabled={selectedIssues.size === 0 || emailLoading}
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                              selectedIssues.size === 0 || emailLoading
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                            }`}
                          >
                            {emailLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <Mail size={18} />
                                Generate Dispute Email
                              </>
                            )}
                          </button>
                        </div>
                        
                        {selectedIssues.size > 0 && (
                          <div className="text-sm text-blue-800 bg-blue-100/50 rounded-lg p-3">
                            <strong>Selected issues:</strong> {Array.from(selectedIssues).map(idx => `#${idx + 1}`).join(", ")}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generated Dispute Email */}
      {generatedEmail && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white mb-2">Dispute Email Ready</div>
                <p className="text-green-100">Professional dispute letter for selected issues</p>
              </div>
              <button 
                onClick={openMailto}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium"
              >
                <Send size={18} />
                Open in Email App
              </button>
            </div>
          </div>
          
          <div className="p-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="mb-4">
                <h4 className="font-semibold text-green-900 mb-2">Email Preview:</h4>
                <p className="text-sm text-green-700 mb-4">
                  Click "Open in Email App" to launch your default email client with this content pre-filled.
                  You can then add the recipient's email address and make any necessary edits before sending.
                </p>
              </div>
              <div className="prose prose-green max-w-none">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-sans bg-white/60 rounded-lg p-4 border border-green-200">
                  {generatedEmail}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appeal Letter */}
      {appeal && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white mb-2">Generated Appeal Letter</div>
                <p className="text-purple-100">Professional letter ready for submission</p>
              </div>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium">
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>
          
          <div className="p-8">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
              <div className="prose prose-purple max-w-none">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-sans">
                  {typeof appeal === "string" ? appeal : JSON.stringify(appeal, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillAnalyzer;