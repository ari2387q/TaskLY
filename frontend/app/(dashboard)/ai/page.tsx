"use client";

import { useEffect, useRef, useState } from "react";
import { aiApi } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
useEffect(() => {
  const loadHistory = async () => {
    try {
      const data = await aiApi.getHistory();
      setMessages(data.messages || []);
    } catch {
      // silent fail
    }
  };

  loadHistory();
}, []);

const sendMessage = async () => {
  if (!input.trim() || loading) return;

  const userMessage: Message = { role: "user", content: input };

  setMessages(prev => [...prev, userMessage]);
  setInput("");
  setLoading(true);

  try {
    const data = await aiApi.send(userMessage.content);

    setMessages(prev => [
      ...prev,
      { role: "assistant", content: data.response },
    ]);
  } catch {
    setMessages(prev => [
      ...prev,
      { role: "assistant", content: "⚠️ AI request failed." },
    ]);
  } finally {
    setLoading(false);
  }
};

  const renderMessageContent = (content: string) => {
    return content.split("\n").map((line, idx) => {
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="font-bold text-blue-700">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <span key={idx} className="block min-h-[1.25rem]">
          {parts.length > 0 ? parts : line}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] md:h-[calc(100vh-6rem)] rounded-3xl border border-border overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 shadow-xl">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur bg-background/80 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
            <h1 className="text-xl font-extrabold tracking-tight">
              BROSkill <span className="text-xs font-semibold text-primary px-2.5 py-0.5 bg-primary/10 rounded-full ml-2">AI Assistant</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-secondary text-secondary-foreground rounded-br-none font-medium"
                    : "bg-card text-foreground border border-border rounded-bl-none font-normal"
                }`}
              >
                {msg.role === "assistant" ? renderMessageContent(msg.content) : msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border px-5 py-4 rounded-2xl shadow text-muted-foreground animate-pulse text-sm">
                AI is thinking<span className="ml-1">...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="border-t border-border bg-background/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-end gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-md focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-300">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask TaskLY AI anything…"
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none text-sm max-h-40 text-foreground placeholder:text-muted-foreground"
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition shrink-0"
            >
              Send
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
