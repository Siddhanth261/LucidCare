import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  ChevronRight,
  Loader2,
  Phone,
  PhoneOff,
  PhoneCall,
} from "lucide-react";
import { useTTS } from "../hooks/useTTS";

function ComfortAssistant({
  messages = [],
  isActive,
  onNextSection,
  progress,
  isComplete,
  mode = "THERAPIST", // passed from parent (emotion)
}) {
  const messagesEndRef = useRef(null);
  const previousMessagesRef = useRef(messages);
  const { speak } = useTTS();

  const [isLoading, setIsLoading] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);

  // ---- NEW: Fake call state ----
  const [callStatus, setCallStatus] = useState("idle"); // idle | dialing | in_call | ended
  const [callTranscript, setCallTranscript] = useState([]); // {from: 'rep'|'you'|'system', text: string}
  const callTimeoutRef = useRef(null);
  const callStatusRef = useRef(callStatus);

  // Scripted fake call conversation
  const scriptedCall = useRef([
    {
      from: "system",
      text: "Dialing the hospital billing department...",
      delay: 1500,
    },
    {
      from: "rep",
      text: "Hello, this is Alex from UW Health Billing. Thanks for calling today. How can I help you?",
      delay: 4500,
    },
    {
      from: "you",
      text: "Hi, I’m calling because I have some questions about a few charges on my recent hospital bill.",
      delay: 3500,
    },
    {
      from: "rep",
      text: "Absolutely, I’d be glad to review that with you. I see several services listed, including lab tests and an emergency room visit. Which charges are you most concerned about?",
      delay: 5000,
    },
    {
      from: "you",
      text: "I’m especially worried about the higher-level ER visit code and a few lab tests that might not have been necessary.",
      delay: 3500,
    },
    {
      from: "rep",
      text: "I understand. From what I’m seeing, some of these codes may qualify for review. If you’d like, you can submit a written appeal explaining why these charges look incorrect, and we’ll perform a coding review.",
      delay: 5000,
    },
    {
      from: "you",
      text: "Yes, I’d like to do that. I have a letter drafted that explains each issue clearly.",
      delay: 3000,
    },
    {
      from: "rep",
      text: "That’s perfect. Please send that letter to our billing office address or upload it through your patient portal. Once we receive it, we’ll review the charges and let you know if any adjustments can be made.",
      delay: 5000,
    },
    {
      from: "you",
      text: "Thank you for your help and for explaining the process.",
      delay: 2500,
    },
    {
      from: "rep",
      text: "You’re very welcome. We appreciate you reaching out about this. Have a good day, and we’ll follow up once the review is complete.",
      delay: 4000,
    },
    {
      from: "system",
      text: "Call ended.",
      delay: 0,
    },
  ]);

  // Keep a ref of callStatus to avoid stale closures in timeouts
  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  const clearCallTimeout = () => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
  };

  const playCallTurn = (index) => {
    const script = scriptedCall.current;
    if (index >= script.length || callStatusRef.current === "ended") {
      setCallStatus("ended");
      clearCallTimeout();
      return;
    }

    const turn = script[index];

    setCallTranscript((prev) => [...prev, turn]);

    // Speak only the billing rep's lines
    if (turn.from === "rep" && turn.text) {
      speak(turn.text, "LAWYER");
    }

    if (turn.delay > 0) {
      callTimeoutRef.current = setTimeout(() => {
        // Only continue if call wasn't ended manually
        if (callStatusRef.current !== "ended") {
          setCallStatus("in_call");
          playCallTurn(index + 1);
        }
      }, turn.delay);
    } else {
      // Last turn (no delay)
      setCallStatus("ended");
    }
  };

  const handleStartCall = () => {
    clearCallTimeout();
    setCallTranscript([]);
    setCallStatus("dialing");
    // Start scripted call after a short delay
    callTimeoutRef.current = setTimeout(() => {
      if (callStatusRef.current === "dialing") {
        playCallTurn(0);
      }
    }, 300);
  };

  const handleEndCall = () => {
    clearCallTimeout();
    setCallStatus("ended");
    setCallTranscript((prev) =>
      prev.some((p) => p.text === "Call manually ended.")
        ? prev
        : [...prev, { from: "system", text: "Call manually ended." }]
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCallTimeout();
    };
  }, []);

  // ----- Existing scroll + loading logic for report explanation -----
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (messages.length > previousMessageCount) {
      setIsLoading(false);
    }
    setPreviousMessageCount(messages.length);
  }, [messages, previousMessageCount]);

  // Play TTS for normal assistant messages
  useEffect(() => {
    if (messages.length > previousMessagesRef.current.length) {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg) {
        speak(latestMsg, mode);
      }
    }
    previousMessagesRef.current = messages;
  }, [messages, mode, speak]);

  const handleNextSection = () => {
    setIsLoading(true);
    onNextSection();
  };

  // Helper for call status label
  const callStatusLabel =
    callStatus === "idle"
      ? "No call in progress"
      : callStatus === "dialing"
      ? "Calling billing office..."
      : callStatus === "in_call"
      ? "In call with billing representative"
      : "Call finished";

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gray-900 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-base">
                LucidCare Assistant
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                {isActive && (
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                )}
                <span>{isActive ? "Active Session" : "Ready"}</span>
              </div>
            </div>
          </div>
          {progress && (
            <div className="text-white text-xs bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
              {progress}
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-800">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-4 bg-gray-800 rounded-xl">
              <Bot size={40} className="text-white" />
            </div>
            <div className="max-w-md">
              <p className="text-white font-semibold text-base mb-2">
                AI Assistant Ready
              </p>
              <p className="text-gray-300 text-sm">
                Upload a medical report to receive detailed analysis and
                personalized explanations.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="bg-white border border-gray-200 rounded-xl rounded-tl-md p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{msg}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="bg-white border border-gray-200 rounded-xl rounded-tl-md p-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-sm">Analyzing and processing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* NEW: Simulated Call Panel */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-gray-900 text-white">
                {callStatus === "in_call" || callStatus === "dialing" ? (
                  <PhoneCall size={14} />
                ) : (
                  <Phone size={14} />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  Simulated Call with Billing Office
                </p>
                <p className="text-[11px] text-gray-500">{callStatusLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(callStatus === "in_call" || callStatus === "dialing") && (
                <button
                  type="button"
                  onClick={handleEndCall}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  <PhoneOff size={12} />
                  End Call
                </button>
              )}

              {(callStatus === "idle" || callStatus === "ended") && (
                <button
                  type="button"
                  onClick={handleStartCall}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                >
                  <PhoneCall size={12} />
                  Start Call
                </button>
              )}
            </div>
          </div>

          {callTranscript.length > 0 && (
            <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs space-y-2">
              {callTranscript.map((turn, idx) => (
                <div key={idx} className="flex gap-2">
                  <span
                    className={`mt-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      turn.from === "rep"
                        ? "text-blue-700"
                        : turn.from === "you"
                        ? "text-gray-700"
                        : "text-gray-400"
                    }`}
                  >
                    {turn.from === "rep"
                      ? "Billing Rep"
                      : turn.from === "you"
                      ? "You"
                      : "System"}
                  </span>
                  <p className="text-[11px] text-gray-700 leading-snug">
                    {turn.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {isActive && !isComplete && messages.length > 0 && (
          <button
            onClick={handleNextSection}
            disabled={isLoading}
            className={`w-full bg-gray-900 text-white py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all font-medium text-sm ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Continue to Next Section</span>
                <ChevronRight size={16} />
              </>
            )}
          </button>
        )}

        {isComplete && (
          <div className="text-center text-sm text-green-700 bg-green-50 py-3 px-4 rounded-lg border border-green-200">
            ✓ Report analysis complete
          </div>
        )}
      </div>
    </div>
  );
}

export default ComfortAssistant;
