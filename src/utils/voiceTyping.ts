export interface VoiceTypingOptions {
  language?: string;
  onStart?: () => void;
  onResult: (text: string, isFinal: boolean) => void;
  onError?: (errorMsg: string) => void;
  onEnd?: () => void;
}

export function startRealVoiceTyping(options: VoiceTypingOptions) {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (options.onError) {
      options.onError("Speech recognition is not supported on this browser/device. Please use Google Chrome, Microsoft Edge, or Safari with microphone permissions enabled.");
    }
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = options.language || 'en-IN';

    recognition.onstart = () => {
      if (options.onStart) options.onStart();
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const spokenText = (finalTranscript || interimTranscript).trim();
      if (spokenText) {
        // Yield exact spoken text without any AI modifications
        options.onResult(spokenText, !!finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      if (options.onError && event.error !== 'no-speech') {
        options.onError(`Microphone notice: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (options.onEnd) options.onEnd();
    };

    recognition.start();
    return recognition;
  } catch (err: any) {
    console.error("Failed to start voice typing:", err);
    if (options.onError) {
      options.onError("Failed to access microphone. Please allow microphone permissions in your browser.");
    }
    if (options.onEnd) options.onEnd();
    return null;
  }
}

