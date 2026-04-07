import { useState, useRef, useCallback } from 'react';

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [volume, setVolume] = useState(0);          // 0-1 live volume
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  const startRecording = useCallback(async () => {
    chunksRef.current = [];
    setAudioBlob(null);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Volume analyser
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const tick = () => {
      const buf = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += Math.abs(v - 128);
      setVolume(Math.min(1, (sum / buf.length) / 40));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioBlob(blob);
      stream.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(rafRef.current);
      setVolume(0);
    };
    recorder.start(100);
    mediaRef.current = recorder;
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRef.current && isRecording) {
      mediaRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return { isRecording, audioBlob, volume, startRecording, stopRecording };
}
