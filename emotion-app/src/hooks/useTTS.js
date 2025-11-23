// src/hooks/useTTS.js
import { useRef } from "react";

export const useTTS = () => {
  // Queue so voices don't overlap
  const queueRef = useRef(Promise.resolve());

  const speak = (text, mode = "THERAPIST") => {
    if (!text) return Promise.resolve();

    const playOnce = async () => {
      try {
        console.log("TTS Request:", {
          text: text.substring(0, 80) + (text.length > 80 ? "..." : ""),
          mode,
        });

        const res = await fetch("http://localhost:8080/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, mode }),
        });

        console.log("TTS Response status:", res.status, res.statusText);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("TTS failed:", errorText);
          return;
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("audio")) {
          console.error("Invalid content type:", contentType);
          const errorText = await res.text();
          console.error("Response body:", errorText);
          return;
        }

        const blob = await res.blob();
        console.log("TTS Blob:", blob.size, "bytes, type:", blob.type);

        if (blob.size === 0) {
          console.error("Empty audio blob received");
          return;
        }

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        return await new Promise((resolve) => {
          audio.onerror = (e) => {
            console.error("Audio playback error:", e);
            URL.revokeObjectURL(url);
            resolve();
          };

          audio.onended = () => {
            console.log("Audio playback finished");
            URL.revokeObjectURL(url);
            resolve();
          };

          console.log("Starting audio playback...");
          audio
            .play()
            .then(() => {
              console.log("Audio playing successfully");
            })
            .catch((err) => {
              console.error("Audio.play() failed:", err);
              URL.revokeObjectURL(url);
              resolve();
            });
        });
      } catch (err) {
        console.error("TTS error:", err);
      }
    };

    // Chain onto queue
    queueRef.current = queueRef.current.then(playOnce).catch((err) => {
      console.error("TTS queue error:", err);
    });

    return queueRef.current;
  };

  return { speak };
};
