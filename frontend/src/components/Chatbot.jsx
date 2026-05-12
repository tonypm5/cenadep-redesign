import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { api } from "../lib/api";
import { useLang } from "../context/LanguageContext";

const SESSION_KEY = "cenadep_chat_session";

export const Chatbot = () => {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [sessionId] = useState(() => {
    let s = localStorage.getItem(SESSION_KEY);
    if (!s) { s = crypto.randomUUID(); localStorage.setItem(SESSION_KEY, s); }
    return s;
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", text: t.chatbot.welcome }]);
    }
  }, [open, lang, messages.length, t.chatbot.welcome]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const r = await api.post("/chat", { session_id: sessionId, message: userMsg.text, lang });
      setMessages((m) => [...m, { role: "assistant", text: r.data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: lang === "fr" ? "Désolé, une erreur est survenue." : "Sorry, an error occurred." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        data-testid="chatbot-toggle"
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-6 z-[60] w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#1A8F4D] text-white shadow-[0_18px_40px_-12px_rgba(26,143,77,0.55)] hover:scale-110 transition-transform flex items-center justify-center"
        aria-label="Chat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
      {open && (
        <div className="fixed bottom-28 right-6 z-50 w-[min(380px,calc(100vw-32px))] chat-bubble flex flex-col" data-testid="chatbot-window" style={{ height: 520 }}>
          <div className="p-4 border-b border-black/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1A8F4D] flex items-center justify-center text-white font-bold" style={{ fontFamily: "Montserrat" }}>C</div>
            <div>
              <p className="font-semibold text-[#0A0A0A]" style={{ fontFamily: "Montserrat" }}>{t.chatbot.title}</p>
              <p className="text-xs text-[#736B63]">Gemini 3 · CENADEP</p>
            </div>
          </div>
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3" data-testid="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user" ? "bg-[#1A8F4D] text-white rounded-br-md" : "bg-[#F8F9FA] text-[#0A0A0A] rounded-bl-md"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#F8F9FA] px-4 py-2.5 rounded-2xl text-sm text-[#736B63]">…</div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-black/5 flex gap-2">
            <input
              data-testid="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t.chatbot.placeholder}
              className="flex-1 px-4 py-2.5 rounded-full bg-[#F8F9FA] border border-black/5 focus:border-[#1A8F4D] focus:outline-none text-sm"
            />
            <button
              data-testid="chatbot-send"
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-11 h-11 rounded-full bg-[#1A8F4D] text-white flex items-center justify-center disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
