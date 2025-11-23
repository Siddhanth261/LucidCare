// src/hooks/useTTS.js
export const useTTS = () => {
  const speak = async (text, mode = "THERAPIST") => {
    if (!text) return;

    try {
      // mode is just a tag we pass to backend: "REP", "PATIENT", "THERAPIST", etc.
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
      console.log("TTS Response headers:", res.headers.get("content-type"));

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

      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        URL.revokeObjectURL(url);
      };

      audio.onended = () => {
        console.log("Audio playback finished");
        URL.revokeObjectURL(url);
      };

      console.log("Starting audio playback...");
      await audio.play();
      console.log("Audio playing successfully");
    } catch (err) {
      console.error("TTS error:", err);
    }
  };

  return { speak };
};
