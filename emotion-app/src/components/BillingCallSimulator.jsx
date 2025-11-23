// src/components/BillingCallSimulator.jsx
import React, { useEffect, useRef, useState } from "react";
import { PhoneOff, User, Building2, Volume2 } from "lucide-react";
import { useTTS } from "../hooks/useTTS";

function formatSeconds(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - analysis: full bill analysis (for header only)
 * - script: [{ speaker: "rep" | "user", text: string }]
 */
export default function BillingCallSimulator({ open, onClose, analysis, script = [] }) {
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const timerRef = useRef(null);
  const bottomRef = useRef(null);
  const { speak } = useTTS();

  // Scroll transcript to bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript]);

  // Timer + reset on open/close
  useEffect(() => {
    if (!open) {
      clearInterval(timerRef.current);
      setSeconds(0);
      setTranscript([]);
      return;
    }

    setSeconds(0);
    setTranscript([]);

    timerRef.current = setInterval(() => {
      setSeconds((t) => t + 1);
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [open]);

  // Helper to append a message
  const addMessage = (speaker, text) => {
    setTranscript((prev) => [...prev, { speaker, text }]);
  };

  // Auto-play the script using queued TTS
  useEffect(() => {
    if (!open) return;
    if (!script || script.length === 0) return;

    let cancelled = false;

    const run = async () => {
      // Optional: small "ring -> answer" intro
      const providerName = analysis?.provider_info?.name || "Billing Department";
      addMessage("rep", `Hi, this is the ${providerName} billing office. Thanks for calling.`,);
      await speak(
        `Hi, this is the ${providerName} billing office. Thanks for calling.`,
        "BILLING_REP"
      );

      for (let i = 0; i < script.length; i++) {
        if (cancelled) break;
        const turn = script[i];
        const speaker = turn.speaker === "user" ? "you" : "rep";
        const text = turn.text || "";

        addMessage(speaker, text);

        if (turn.speaker === "rep") {
          await speak(text, "BILLING_REP");
        } else {
          await speak(text, "BILLING_USER");
        }
      }

      if (!cancelled) {
        // Small pause then auto-end
        addMessage("rep", "Thanks for calling. We’ll review your concerns and follow up with an updated bill or written response.");
        await speak(
          "Thanks for calling. We’ll review your concerns and follow up with an updated bill or written response.",
          "BILLING_REP"
        );
        setTimeout(() => {
          onClose();
        }, 800);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, script]);

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
          <div ref={bottomRef} />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 bg-white space-y-3">
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100">
              <Volume2 className="w-3 h-3" />
              Two voices: rep (en_male_1) &amp; patient (en_male_2)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
              Fully simulated practice call – no real dialing
            </span>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-[11px] text-slate-500">
              This is a <span className="font-semibold">simulated</span> call
              for practice only.
            </div>
            <button
              onClick={onClose}
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
