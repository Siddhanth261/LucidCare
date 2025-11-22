import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VoiceVisualizer from './VoiceVisualizer';

export default function DrLucidConsole() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm Dr. Lucid, your medical billing advocate. I've analyzed thousands of medical bills and I'm here to help you understand yours. Upload a bill to get started, or ask me anything about medical billing."
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorDetected, setErrorDetected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Simulate error detection after a few seconds
    const timer = setTimeout(() => {
      setErrorDetected(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on the bill you uploaded, I notice a few discrepancies. The charge code for 'Emergency Care' seems higher than the regional average. Let me break this down for you...",
        "Your insurance should have covered more of this procedure. According to your plan details, this falls under preventive care which should be 100% covered.",
        "I've found 3 potential billing errors in your statement. Would you like me to generate a dispute letter to send to your provider?"
      ];
      
      const aiMessage = {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)]
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleDisputeLetter = () => {
    alert('Generating dispute letter... This would draft a professional letter addressing the billing errors found.');
  };

  return (
    <Card className="flex flex-col h-full bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
               <span className="text-xs font-bold text-white">AI</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Dr. Lucid Console
            </h2>
          </div>
          <div className="px-2 py-1 bg-slate-50 rounded text-[10px] font-medium text-slate-500 uppercase tracking-wider border border-slate-100">
            Live Assistance
          </div>
        </div>

        <VoiceVisualizer isActive={isTyping} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
          >
            <div
              className={`max-w-[85%] ${
                message.role === 'user'
                  ? 'bg-slate-50 text-slate-800 px-5 py-3 rounded-2xl rounded-tr-sm'
                  : 'pr-8'
              }`}
            >
               {message.role === 'assistant' && (
                 <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center mb-2">
                    <span className="text-[10px] font-bold text-white">AI</span>
                 </div>
               )}
              <p className={`leading-7 ${message.role === 'assistant' ? 'text-lg text-slate-900 font-serif' : 'text-sm font-medium'}`}>
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-5 border-t border-slate-100 bg-white">
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask follow-up questions..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-12 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:bg-white transition-all font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 p-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}