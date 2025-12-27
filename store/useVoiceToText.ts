import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";

export const useVoiceToText = () => {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const runningRef = useRef(false);

const checkMic = async () => {
  const status = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
  );
  console.log("🎤 Mic permission status:", status);
  return status;
};

  const requestMicPermission = async () => {
    if (Platform.OS !== "android") return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: "Microphone Permission",
        message: "App needs microphone access for voice input",
        buttonPositive: "OK",
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  // 🎧 RESULT EVENT
  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript;
    console.log("🎧 RESULT:", transcript);

    if (transcript) {
      setText(transcript);
      stop(); // auto stop after result
    }
  });

  // ❌ ERROR EVENT
  useSpeechRecognitionEvent("error", (e) => {
    console.log("❌ Speech error:", e);
    stop();
  });

  // 🎤 START
 const start = async () => {
  if (runningRef.current) return;

  const alreadyGranted = await checkMic();
  if (!alreadyGranted) {
    const hasPermission = await requestMicPermission();
    if (!hasPermission) {
      console.log("❌ Mic permission denied");
      return;
    }
  }

  try {
    setText("");
    setListening(true);
    runningRef.current = true;

    await ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: false,
    });

    console.log("✅ Speech started");
  } catch (e) {
    console.log("❌ Start failed", e);
    stop();
  }
};



  // 🛑 STOP
  const stop = async () => {
    if (!runningRef.current) return;

    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch { }

    setListening(false);
    runningRef.current = false;
  };

  // 🧹 CLEANUP
  useEffect(() => {
    return () => {
      ExpoSpeechRecognitionModule.stop?.();
      runningRef.current = false;
    };
  }, []);

  return { text, start, stop, listening };
};
