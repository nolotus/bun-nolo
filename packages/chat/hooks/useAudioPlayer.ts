import { useGenerateAudioMutation } from "ai/services";
import React, { useState, useEffect } from "react";

export const useAudioPlayer = (content: string) => {
  const [audioSrc, setAudioSrc] = useState("");
  const [generateAudio, { isLoading, isError }] = useGenerateAudioMutation();

  useEffect(() => {
    // 清除旧的 audio URL，以避免内存泄漏
    return () => {
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, [audioSrc]);

  const handlePlayClick = async () => {
    try {
      const audioUrl = await generateAudio(content).unwrap();
      setAudioSrc(audioUrl);
    } catch (error) {}
  };

  return { audioSrc, handlePlayClick, isLoading, isError };
};
