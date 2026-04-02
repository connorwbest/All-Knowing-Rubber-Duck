"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function RubberDuck() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSpeechSupported(
      !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    );
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startListening = () => {
    setError("");
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser. Try Chrome or Edge.",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      const current = finalTranscript + interim;
      transcriptRef.current = current;
      setTranscript(current);
    };

    recognition.onerror = (event: Event) => {
      setIsListening(false);
      const errorEvent = event as Event & { error?: string };
      if (errorEvent.error === "not-allowed") {
        setError(
          "Microphone access denied. Allow microphone permissions to speak to the duck.",
        );
      } else {
        setError(`Speech recognition error: ${errorEvent.error || "unknown"}.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
    transcriptRef.current = "";
  };

  const duckSounds = [
    "/sounds/duck-quack-short-gfx-sounds-3-3-00-00.mp3",
    "/sounds/quack-cartoon-duck-soundroll-3-3-00-01.mp3",
    "/sounds/rubber-duck-laughing-quacks-joshua-chivers-1-00-01.mp3",
  ];

  const playRandomQuack = () => {
    const sound = duckSounds[Math.floor(Math.random() * duckSounds.length)];
    new Audio(sound).play();
  };

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage.trim() },
    ];
    setMessages(newMessages);
    setTranscript("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      playRandomQuack();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      playRandomQuack();
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Quack! Something went wrong. Try again?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const stopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    await sendMessage(transcriptRef.current);
  };

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8">
      {/* Duck with glow */}
      <div className="relative">
        {/* Ambient glow behind duck */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "340px",
            height: "340px",
            background:
              "radial-gradient(circle, rgba(160,120,20,0.10) 0%, rgba(160,120,20,0.03) 40%, transparent 70%)",
            animation: isListening
              ? "glow-pulse-listening 1.5s ease-in-out infinite"
              : "glow-pulse 4s ease-in-out infinite",
            filter: "blur(25px)",
          }}
        />

        {/* Soundwave rings when listening */}
        {isListening && (
          <>
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-600/15"
              style={{
                width: "200px",
                height: "200px",
                animation: "ring-expand 2s ease-out infinite",
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-600/10"
              style={{
                width: "200px",
                height: "200px",
                animation: "ring-expand 2s ease-out infinite 0.6s",
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-700/8"
              style={{
                width: "200px",
                height: "200px",
                animation: "ring-expand 2s ease-out infinite 1.2s",
              }}
            />
          </>
        )}

        {/* Floating particles */}
        <div
          className="absolute bottom-8 left-1/4 h-1.5 w-1.5 rounded-full bg-amber-500/30"
          style={{ animation: "float-up 4s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-12 right-1/4 h-1 w-1 rounded-full bg-amber-500/20"
          style={{ animation: "float-up-2 5s ease-in-out infinite 1s" }}
        />
        <div
          className="absolute bottom-6 left-1/3 h-1 w-1 rounded-full bg-amber-600/25"
          style={{ animation: "float-up-3 3.5s ease-in-out infinite 2s" }}
        />

        {/* Duck image */}
        <div
          className="relative"
          style={{
            animation: isListening
              ? "duck-wobble 1.2s ease-in-out infinite"
              : "duck-bob 3s ease-in-out infinite",
            filter: `drop-shadow(0 0 ${isListening ? "25px" : "10px"} rgba(160,120,20,${isListening ? "0.3" : "0.12"}))`,
            transition: "filter 0.5s ease",
          }}
        >
          <img
            src="/images/rubber-duck.png"
            alt="Rubber Duck"
            width={280}
            height={280}
            className="relative z-10"
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="animate-slide-up w-full rounded-lg border border-red-900/30 bg-red-950/20 px-5 py-3 text-sm text-red-400/70 backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Listen button */}
      {speechSupported && (
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isLoading}
          className={`group relative flex items-center gap-3 rounded-full px-8 py-4 text-base font-semibold tracking-wide transition-all duration-300 ${
            isListening
              ? "border border-red-900/40 bg-red-950/30 text-red-300/80 shadow-[0_0_25px_rgba(200,50,50,0.08)] hover:bg-red-950/40 hover:shadow-[0_0_35px_rgba(200,50,50,0.12)]"
              : isLoading
                ? "cursor-not-allowed border border-amber-800/10 bg-[#0a0800] text-amber-300/25"
                : "border border-amber-700/20 bg-[#0a0800] text-amber-200/70 shadow-[0_0_25px_rgba(160,120,20,0.04)] hover:border-amber-600/30 hover:bg-amber-950/30 hover:shadow-[0_0_35px_rgba(160,120,20,0.08)]"
          }`}
        >
          {isListening ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-50" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500/80" />
              </span>
              Stop & Send
            </>
          ) : isLoading ? (
            <>
              <SpinnerIcon />
              The duck ponders...
            </>
          ) : (
            <>
              <MicIcon />
              Speak to Him
            </>
          )}
        </button>
      )}

      {/* Live transcript */}
      {(isListening || transcript) && (
        <div className="animate-slide-up w-full rounded-lg border border-amber-800/15 bg-[#080700] p-5 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500/70" />
            </span>
            <p className="font-mono text-xs tracking-widest text-amber-500/40 uppercase">
              Listening
            </p>
          </div>
          <p className="font-mono text-sm leading-relaxed text-amber-200/50">
            {transcript || "Start speaking..."}
          </p>
        </div>
      )}

      {/* Unsupported browser */}
      {!speechSupported && (
        <div className="w-full rounded-lg border border-amber-800/15 bg-[#080700] p-5 text-center text-sm text-amber-300/30 backdrop-blur-sm">
          Your browser doesn&apos;t support speech recognition. Use Chrome or
          Edge to speak to the duck.
        </div>
      )}

      {/* Conversation */}
      {messages.length > 0 && (
        <div className="flex w-full flex-col gap-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`animate-slide-up rounded-lg p-4 ${
                msg.role === "user"
                  ? "self-end border border-neutral-800/40 bg-[#080808] text-neutral-300/70 backdrop-blur-sm"
                  : "self-start border border-amber-900/20 bg-[#080700] text-amber-100/60 backdrop-blur-sm"
              }`}
            >
              <p
                className={`mb-1.5 font-mono text-[10px] font-bold tracking-widest uppercase ${
                  msg.role === "user"
                    ? "text-neutral-500/40"
                    : "text-amber-500/30"
                }`}
              >
                {msg.role === "user" ? "You" : "Duck"}
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content}
              </p>
            </div>
          ))}
          {isLoading && (
            <div className="animate-slide-up self-start rounded-lg border border-amber-900/20 bg-[#080700] p-4 backdrop-blur-sm">
              <p className="mb-1.5 font-mono text-[10px] font-bold tracking-widest text-amber-500/30 uppercase">
                Duck
              </p>
              <div className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500/40"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500/40"
                  style={{ animationDelay: "200ms" }}
                />
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500/40"
                  style={{ animationDelay: "400ms" }}
                />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}

function MicIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-70"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin opacity-40"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75" />
    </svg>
  );
}
