import React, { useEffect, useRef, useState } from 'react';
import { Bot, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { useTTS } from "../hooks/useTTS";

function ComfortAssistant({ 
  messages = [], 
  isActive, 
  onNextSection, 
  progress, 
  isComplete,
  mode = "THERAPIST"      // ⭐ NEW: passed from parent
}) {

  const messagesEndRef = useRef(null);
  const previousMessagesRef = useRef(messages);
  const { speak } = useTTS();   // ⭐ NEW
  const [isLoading, setIsLoading] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Detect when new message arrives
    if (messages.length > previousMessageCount) {
      setIsLoading(false);
    }
    setPreviousMessageCount(messages.length);
  }, [messages]);

  // ⭐ NEW — detect new messages & play FishAudio TTS
  useEffect(() => {
    if (messages.length > previousMessagesRef.current.length) {
      const latestMsg = messages[messages.length - 1];

      if (latestMsg) {
        speak(latestMsg, mode);    // TTS plays here
      }
    }

    previousMessagesRef.current = messages;
  }, [messages, mode, speak]);

  const handleNextSection = () => {
    setIsLoading(true);
    onNextSection();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white rounded">
              <Bot size={14} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-xs">LucidCare Assistant</h2>
              <div className="flex items-center gap-1 text-xs text-indigo-100">
                {isActive && <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>}
                <span className="text-xs">{isActive ? 'Active' : 'Ready'}</span>
              </div>
            </div>
          </div>
          {progress && (
            <div className="text-white text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {progress}
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gradient-to-b from-slate-50 to-white">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
            <div className="p-2 bg-indigo-50 rounded-full">
              <Sparkles size={24} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-slate-700 font-medium text-xs">Ready to help you understand medical reports</p>
              <p className="text-slate-500 text-xs">Upload a medical report to begin</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx} className="flex gap-2 animate-fadeIn">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="bg-white border border-gray-200 rounded-xl rounded-tl-sm p-2.5 shadow-sm">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {msg}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 animate-fadeIn">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Bot size={14} className="text-white" />
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="bg-white border border-gray-200 rounded-xl rounded-tl-sm p-2.5 shadow-sm">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-xs">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Footer */}
      <div className="p-2 border-t border-gray-200 bg-white rounded-b-2xl">
        {isActive && !isComplete && messages.length > 0 && (
          <button
            onClick={handleNextSection}
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md font-medium text-sm ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg active:scale-95'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Continue to Next Section</span>
                <ChevronRight size={14} />
              </>
            )}
          </button>
        )}

        {isComplete && (
          <div className="text-center text-xs text-green-700 bg-green-50 py-2 px-3 rounded-lg border border-green-200 font-medium">
            ✓ Report explanation complete
          </div>
        )}
      </div>
    </div>
  );
}

export default ComfortAssistant;