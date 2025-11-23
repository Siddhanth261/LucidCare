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
    <div className="bg-white border-b border-gray-200 rounded-2xl border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gray-900 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-800 rounded-lg">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-base text-lg">LucidCare Assistant</div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                {isActive && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                <span className="text-sm">{isActive ? 'Active Session' : 'Ready'}</span>
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
              <p className="text-white font-semibold text-base mb-2">AI Assistant Ready</p>
              <p className="text-gray-300 text-sm">Upload a medical report to receive detailed analysis and personalized explanations</p>
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
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {msg}
                    </p>
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

      {/* Chat Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {isActive && !isComplete && messages.length > 0 && (
          <button
            onClick={handleNextSection}
            disabled={isLoading}
            className={`w-full bg-gray-900 text-white py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all font-medium text-sm ${
              isLoading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-gray-800'
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