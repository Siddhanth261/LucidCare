import React, { useEffect, useRef } from 'react';
import { Bot, ChevronRight } from 'lucide-react';

function ComfortAssistant({ messages = [], isActive, onNextSection, progress, isComplete }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-96">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Bot size={16} /> LucidCare Assistant
          {isActive && (
            <span className="ml-2 text-xs font-normal bg-green-100 text-green-700 px-2 py-0.5 rounded">
              LIVE
            </span>
          )}
        </h2>
        {progress && (
          <span className="text-xs text-slate-500">
            Section {progress}
          </span>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto mb-4 space-y-3 bg-slate-50 rounded-lg p-4 border border-gray-100">
        {messages.length === 0 ? (
          <div className="text-slate-500 text-sm text-center py-8">
            Upload a medical report to begin the conversation...
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <Bot size={16} className="text-indigo-600" />
              </div>
              <div className="flex-grow">
                <div className="text-sm text-slate-700 leading-relaxed">
                  {msg}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Next Section Button */}
      {isActive && !isComplete && messages.length > 0 && (
        <button
          onClick={onNextSection}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          Continue to Next Section
          <ChevronRight size={16} />
        </button>
      )}

      {isComplete && (
        <div className="text-center text-sm text-green-700 bg-green-50 py-2 px-4 rounded-lg">
          ✓ Report explanation complete
        </div>
      )}
    </div>
  );
}

export default ComfortAssistant;
