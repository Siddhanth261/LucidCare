import { useEffect, useRef, useState, useCallback } from 'react';

export const useWebSocket = (summary, stableEmotion) => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const websocket = useRef(null);
  const summaryRef = useRef(summary);
  const currentMessageRef = useRef("");

  useEffect(() => {
    summaryRef.current = summary;
  }, [summary]);

  useEffect(() => {
    currentMessageRef.current = currentMessage;
  }, [currentMessage]);

  const startComfortStream = useCallback((reportSummary) => {
    if (websocket.current) websocket.current.close();
    
    if (reportSummary) {
      summaryRef.current = reportSummary;
    }
    
    websocket.current = new WebSocket("ws://localhost:8080/comfort-stream");
    
    websocket.current.onopen = () => {
      console.log("WebSocket connected");
      setIsActive(true);
      setMessages([]);
      setCurrentMessage("");
      currentMessageRef.current = "";
      setIsComplete(false);
      
      setTimeout(() => {
        if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
          const initMessage = {
            action: "init",
            summary: summaryRef.current,
            emotion: stableEmotion
          };
          console.log("Sending init message:", { action: "init", emotion: stableEmotion, summaryLength: summaryRef.current?.length });
          websocket.current.send(JSON.stringify(initMessage));
        }
      }, 100);
    };
    
    websocket.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data.type);
        
        if (data.type === "message") {
          setCurrentMessage(prev => {
            const newMessage = prev + data.text;
            currentMessageRef.current = newMessage;
            return newMessage;
          });
        } else if (data.type === "end") {
          const finalMessage = currentMessageRef.current.trim();
          if (finalMessage) {
            setMessages(msgs => [...msgs, finalMessage]);
          }
          setCurrentMessage("");
          currentMessageRef.current = "";
          setProgress(data.progress || "");
        } else if (data.type === "complete") {
          const finalMessage = currentMessageRef.current.trim();
          if (finalMessage) {
            setMessages(msgs => [...msgs, finalMessage]);
          }
          setCurrentMessage("");
          currentMessageRef.current = "";
          setIsComplete(true);
          setIsActive(false);
        } else if (data.error) {
          console.error("WebSocket error:", data.error);
          setMessages(prev => [...prev, `⚠️ Error: ${data.error}`]);
          setCurrentMessage("");
          currentMessageRef.current = "";
          setIsActive(false);
        }
      } catch (e) {
        const text = event.data;
        if (!text.includes("[END]")) {
          setCurrentMessage(prev => {
            const newMessage = prev + text;
            currentMessageRef.current = newMessage;
            return newMessage;
          });
        } else {
          setCurrentMessage(prev => {
            const finalMessage = prev.trim();
            if (finalMessage) {
              setMessages(msgs => [...msgs, finalMessage]);
            }
            currentMessageRef.current = "";
            return "";
          });
        }
      }
    };

    websocket.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsActive(false);
    };

    websocket.current.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setIsActive(false);
    };
  }, [stableEmotion]);

  const requestNextSection = useCallback(() => {
    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      console.log("Requesting next section with emotion:", stableEmotion);
      
      websocket.current.send(JSON.stringify({
        action: "next",
        emotion: stableEmotion,
        summary: summaryRef.current
      }));
    }
  }, [stableEmotion]);

  useEffect(() => {
    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
    };
  }, []);

  const allMessages = currentMessage 
    ? [...messages, currentMessage]
    : messages;

  return { 
    messages: allMessages, 
    isActive,
    progress,
    isComplete,
    startComfortStream,
    requestNextSection
  };
};
