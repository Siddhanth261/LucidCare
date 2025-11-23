// src/components/BillingCallSimulator.jsx
import React, { useEffect, useRef, useState } from "react";
import { PhoneOff, User, Building2, Volume2 } from "lucide-react";
import { useTTS } from "../hooks/useTTS";

function formatSeconds(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function BillingCallSimulator({
  open,
  onClose,
  analysis,
  selectedIssues = [],
}) {
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [isRepThinking, setIsRepThinking] = useState(false);
  const timerRef = useRef(null);
  const bottomRef = useRef(null);
  const { speak } = useTTS();

  // Scroll transcript to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript, isRepThinking]);

  // Reset + start timer when modal opens
  useEffect(() => {
    if (!open) {
      clearInterval(timerRef.current);
      setSeconds(0);
      setTranscript([]);
      setIsRepThinking(false);
      return;
    }

    setSeconds(0);
    setTranscript([]);
    setIsRepThinking(false);

    timerRef.current = setInterval(() => {
      setSeconds((t) => t + 1);
    }, 1000);

    // Initial greeting (scripted for now)
    const providerName = analysis?.provider_info?.name || "Billing Department";
    const greeting = `Hi, this is the ${providerName} billing office. Thanks for calling. How can I help you today?`;
    addMessage("rep", greeting, true);

    return () => {
      clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const addMessage = (speaker, text, speakAloud = false) => {
    if (!text) return;
    setTranscript((prev) => [...prev, { speaker, text }]);

    if (speakAloud) {
      const mode = speaker === "rep" ? "REP" : "PATIENT";
      speak(text, mode);
    }
  };

  const callGeminiRep = async (updatedTranscript) => {
    setIsRepThinking(true);
    try {
      const res = await fetch("http://localhost:8080/billing-call-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: updatedTranscript,
          analysis,
          selectedIssues,
        }),
      });

      const data = await res.json();
      if (data.error) {
        console.error("Billing call Gemini error:", data.error);
        addMessage(
          "rep",
          "I’m sorry, I’m having trouble pulling up your account right now. Could you try again in a moment?",
          true
        );
      } else if (data.reply) {
        addMessage("rep", data.reply, true);
      }
    } catch (err) {
      console.error("Billing call request failed:", err);
      addMessage(
        "rep",
        "I’m sorry, there seems to be a connection issue on our side. Please try again later.",
        true
      );
    } finally {
      setIsRepThinking(false);
    }
  };

  const sendPatientLine = async (userLine) => {
    if (!userLine) return;
    const updatedTranscript = [...transcript, { speaker: "you", text: userLine }];
    setTranscript(updatedTranscript);
    // Speak the patient's line in a slightly different male-ish voice mode
    speak(userLine, "PATIENT");
    await callGeminiRep(updatedTranscript);
  };

  const mainIssue =
    selectedIssues && selectedIssues.length > 0
      ? selectedIssues[0]
      : null;

  const handleUserSayIntro = () => {
    const line =
      "Hi, I’m calling because I have some questions and concerns about a few charges on my recent bill.";
    sendPatientLine(line);
  };

  const handleUserExplainIssues = () => {
    let issueText = "a few specific line items that look incorrect.";

    if (mainIssue) {
      const codeList = (mainIssue.codes || []).join(", ");
      issueText = `the charges related to codes ${codeList}, which seem like they might be ${mainIssue.issue_type || "incorrectly coded"}.`;
    }

    const userLine = `I’m disputing ${issueText} I’d like to understand why they were billed this way and whether they can be adjusted.`;
    sendPatientLine(userLine);
  };

  const handleUserAskAdjustment = () => {
    const userLine =
      "If the review confirms these shouldn’t have been billed this way, what can you do to fix the charges?";
    sendPatientLine(userLine);
  };

  const handleUserMentionLetter = () => {
    const userLine =
      "I’ve prepared a written appeal outlining these issues. Where should I send it so it gets to the right team?";
    sendPatientLine(userLine);
  };

  const handleEndCall = () => {
    const goodbye =
      "Thank you for calling. We’ll review your concerns and follow up with an updated bill or written response. Have a good day.";
    addMessage("rep", goodbye, true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!open) return null;

  const providerName = analysis?.provider_info?.name || "Billing Department";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full mx-4 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">
                {providerName} — Billing
              </div>
              <div className="text-xs text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Simulated call in progress</span>
              </div>
            </div>
          </div>
          <div className="text-xs font-mono bg-slate-800/80 px-2 py-1 rounded">
            {formatSeconds(seconds)}
          </div>
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto px-5 py-4 bg-slate-50">
          {transcript.length === 0 && (
            <div className="text-xs text-slate-500 text-center py-8">
              Connecting to billing simulation...
            </div>
          )}

          {transcript.map((msg, idx) => (
            <div
              key={idx}
              className={`flex mb-3 ${
                msg.speaker === "you" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.speaker === "rep" && (
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-slate-800 shadow-sm">
                    {msg.text}
                  </div>
                </div>
              )}
              {msg.speaker === "you" && (
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="bg-slate-900 text-white rounded-2xl rounded-tr-sm px-3 py-2 text-xs shadow-sm">
                    {msg.text}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isRepThinking && (
            <div className="flex justify-start mb-3">
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-slate-500 italic">
                  Rep is reviewing your account…
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Controls */}
        <div className="px-5 py-4 border-t border-slate-200 bg-white space-y-3">
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100">
              <Volume2 className="w-3 h-3" />
              Rep voice powered by your TTS
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100">
              Patient lines are also spoken with a separate male voice style
            </span>
            {selectedIssues.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                {selectedIssues.length} issue
                {selectedIssues.length > 1 ? "s" : ""} referenced in this call
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleUserSayIntro}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left"
            >
              “I’m calling about some charges…”
            </button>
            <button
              onClick={handleUserExplainIssues}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left"
            >
              Explain which line items you’re disputing
            </button>
            <button
              onClick={handleUserAskAdjustment}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left"
            >
              Ask: “What can you do to fix this?”
            </button>
            <button
              onClick={handleUserMentionLetter}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left"
            >
              Mention your written appeal letter
            </button>
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="text-[11px] text-slate-500">
              This is a <span className="font-semibold">simulated</span> call
              for practice only.
            </div>
            <button
              onClick={handleEndCall}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-rose-600 text-white text-xs font-medium hover:bg-rose-700"
            >
              <PhoneOff className="w-4 h-4" />
              End Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
