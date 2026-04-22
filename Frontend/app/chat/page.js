"use client";

import { useState, useRef, useEffect } from "react";

const API_BASE = "http://127.0.0.1:8000";

// ─── Icons ────────────────────────────────────────────────────────────────────
function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={18} height={18}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <line x1="12" y1="7" x2="12" y2="11" />
      <line x1="8" y1="15" x2="8" y2="17" />
      <line x1="16" y1="15" x2="16" y2="17" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={18} height={18}>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ─── Source Card ──────────────────────────────────────────────────────────────
function SourceCard({ source, index }) {
  const [open, setOpen] = useState(false);
  const score = Math.round((source.score ?? 0) * 100);
  const filename = (source.source || "Unknown").split(/[/\\]/).pop();

  return (
    <div style={{
      background: "var(--source-bg)",
      border: "1px solid var(--border-accent)",
      borderRadius: 8,
      overflow: "hidden",
      marginBottom: 6,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-secondary)",
          fontSize: 12,
          textAlign: "left",
        }}
      >
        <SearchIcon />
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          [{index + 1}] {filename}
        </span>
        <span style={{
          background: score >= 70 ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
          color: score >= 70 ? "var(--success)" : "var(--warning)",
          padding: "1px 6px", borderRadius: 4, fontSize: 11, fontWeight: 600,
        }}>
          {score}%
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div style={{
          padding: "0 12px 10px",
          fontSize: 12,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          borderTop: "1px solid var(--border)",
        }}>
          <p style={{ paddingTop: 8, fontFamily: "monospace", wordBreak: "break-word" }}>
            {source.snippet || "No preview available."}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div style={{
      display: "flex",
      gap: 12,
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-start",
      marginBottom: 20,
      animation: "fadeSlideIn 0.25s ease",
    }}>
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isUser
          ? "linear-gradient(135deg, #4f46e5, #7c3aed)"
          : "linear-gradient(135deg, #1a1a30, #2a2a50)",
        border: "1px solid var(--border)",
        color: isUser ? "#fff" : "var(--accent)",
      }}>
        {isUser ? <UserIcon /> : <BotIcon />}
      </div>

      {/* Content */}
      <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{
          padding: "12px 16px",
          borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
          background: isUser ? "var(--user-bubble)" : "var(--ai-bubble)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
          fontSize: 14,
          lineHeight: 1.7,
          boxShadow: isUser ? "0 0 0 1px rgba(124,111,247,0.2)" : "none",
          wordBreak: "break-word",
        }}>
          {msg.text}
        </div>

        {/* Sources */}
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Sources
            </p>
            {msg.sources.map((s, i) => (
              <SourceCard key={i} source={s} index={i} />
            ))}
          </div>
        )}

        {/* Query type badge */}
        {!isUser && msg.queryType && (
          <span style={{
            alignSelf: "flex-start",
            fontSize: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: msg.queryType === "casual" ? "var(--success)" : "var(--accent)",
            background: msg.queryType === "casual" ? "rgba(34,197,94,0.08)" : "var(--accent-glow)",
            padding: "2px 8px", borderRadius: 4,
          }}>
            {msg.queryType === "casual" ? "Chat" : "Research"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a30, #2a2a50)",
        border: "1px solid var(--border)", color: "var(--accent)",
      }}>
        <BotIcon />
      </div>
      <div style={{
        padding: "14px 18px",
        borderRadius: "4px 18px 18px 18px",
        background: "var(--ai-bubble)",
        border: "1px solid var(--border)",
        display: "flex", gap: 5, alignItems: "center",
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--accent)",
            animation: `bounce 1.2s ${i * 0.2}s infinite`,
            display: "block",
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ onNewChat }) {
  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      padding: "20px 14px",
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 28, paddingLeft: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, var(--accent), #5a54c4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 16 }}>🔬</span>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>Research AI</p>
            <p style={{ fontSize: 10, color: "var(--text-muted)" }}>Local · Private · Fast</p>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <button
        id="new-chat-btn"
        onClick={onNewChat}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px", borderRadius: 10,
          background: "var(--accent-glow)",
          border: "1px solid var(--border-accent)",
          color: "var(--accent)", fontSize: 13, fontWeight: 600,
          cursor: "pointer", width: "100%",
          transition: "background 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(124,111,247,0.2)"}
        onMouseLeave={e => e.currentTarget.style.background = "var(--accent-glow)"}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Chat
      </button>

      <div style={{ flex: 1 }} />

      {/* Status indicators */}
      <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "block" }} />
          Qdrant · Local
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "block" }} />
          Ollama · tinyllama
        </div>
      </div>
    </aside>
  );
}

// ─── Main Chat Page ────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const clearChat = () => {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  };

  const sendMessage = async () => {
    const query = input.trim();
    if (!query || loading) return;

    setInput("");
    setError(null);
    setMessages(prev => [...prev, { role: "user", text: query }]);
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/ask?query=${encodeURIComponent(query)}`
      );

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          role: "ai",
          text: data.answer || "No answer returned.",
          sources: data.sources || [],
          queryType: data.query_type || "research",
        },
      ]);
    } catch (err) {
      setError(err.message);
      setMessages(prev => [
        ...prev,
        { role: "ai", text: "⚠️ Failed to connect to the backend. Make sure the server is running.", sources: [], queryType: null },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <Sidebar onNewChat={clearChat} />

        {/* Main area */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Header */}
          <header style={{
            padding: "14px 24px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-surface)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                AI Research Chat
              </h1>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Ask questions about your ingested papers
              </p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                style={{
                  fontSize: 12, color: "var(--text-muted)",
                  background: "none", border: "1px solid var(--border)",
                  padding: "4px 12px", borderRadius: 6, cursor: "pointer",
                  transition: "color 0.2s, border-color 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-accent)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                Clear
              </button>
            )}
          </header>

          {/* Messages */}
          <section style={{
            flex: 1, overflowY: "auto",
            padding: "24px",
            display: "flex", flexDirection: "column",
          }}>
            {messages.length === 0 && !loading && (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 16, textAlign: "center",
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: "linear-gradient(135deg, var(--accent), #5a54c4)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                  boxShadow: "0 0 40px var(--accent-glow)",
                }}>
                  🔬
                </div>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                    Research AI
                  </h2>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 380, lineHeight: 1.7 }}>
                    Ask questions about your research papers. I'll find relevant context and cite my sources.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
                  {["What is attention mechanism?", "Summarize transformer architecture", "Hello!"].map(q => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      style={{
                        fontSize: 12, color: "var(--text-secondary)",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        padding: "8px 14px", borderRadius: 20, cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-accent)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {loading && <TypingIndicator />}

            <div ref={bottomRef} />
          </section>

          {/* Input Bar */}
          <footer style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--border)",
            background: "var(--bg-surface)",
          }}>
            {error && (
              <p style={{ fontSize: 12, color: "#f87171", marginBottom: 10 }}>⚠️ {error}</p>
            )}
            <div style={{
              display: "flex", gap: 10, alignItems: "flex-end",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "10px 14px",
              transition: "border-color 0.2s",
            }}
              onFocusCapture={e => e.currentTarget.style.borderColor = "var(--border-accent)"}
              onBlurCapture={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <textarea
                id="chat-input"
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your research papers..."
                disabled={loading}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "var(--text-primary)", fontSize: 14, lineHeight: 1.6,
                  resize: "none", minHeight: 24, maxHeight: 140,
                  fontFamily: "inherit",
                }}
              />
              <button
                id="send-btn"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: loading || !input.trim()
                    ? "var(--bg-hover)"
                    : "linear-gradient(135deg, var(--accent), var(--accent-dim))",
                  border: "none", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  color: loading || !input.trim() ? "var(--text-muted)" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                  transform: "translateY(0)",
                }}
                onMouseEnter={e => { if (!loading && input.trim()) e.currentTarget.style.transform = "scale(1.05)"; }}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <SendIcon />
              </button>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}>
              Enter to send · Shift+Enter for new line · Powered by Ollama + Qdrant
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}