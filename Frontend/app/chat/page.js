"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const API_BASE = "http://127.0.0.1:8000";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icon = {
  Send: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Bot: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={16} height={16}>
      <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" />
      <line x1="12" y1="7" x2="12" y2="11" /><line x1="8" y1="15" x2="8" y2="17" /><line x1="16" y1="15" x2="16" y2="17" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={16} height={16}>
      <circle cx="12" cy="7" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" />
    </svg>
  ),
  Chevron: ({ open }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={13} height={13}
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={12} height={12}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" width={16} height={16}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  File: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={13} height={13}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={15} height={15}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={13} height={13}>
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={13} height={13}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// ─── Upload Status Badge ───────────────────────────────────────────────────────
function UploadBadge({ status }) {
  const styles = {
    uploading: { bg: "rgba(124,111,247,0.15)", color: "var(--accent)", label: "Uploading…" },
    processing: { bg: "rgba(245,158,11,0.15)", color: "var(--warning)", label: "Processing…" },
    success: { bg: "rgba(34,197,94,0.15)", color: "var(--success)", label: "Stored ✓" },
    error: { bg: "rgba(248,113,113,0.15)", color: "#f87171", label: "Failed ✗" },
  };
  const s = styles[status] || styles.uploading;
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
      padding: "2px 8px", borderRadius: 4,
      background: s.bg, color: s.color,
    }}>{s.label}</span>
  );
}

// ─── Upload Drop Zone ──────────────────────────────────────────────────────────
function UploadPanel({ onUploadComplete }) {
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState([]);   // [{name, status, chunks, error}]
  const fileInputRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setQueue(q => [...q, { name: file.name, status: "error", error: "Not a PDF" }]);
      return;
    }

    const entry = { name: file.name, status: "uploading", chunks: 0, error: null };
    setQueue(q => [...q, entry]);

    const form = new FormData();
    form.append("file", file);

    try {
      setQueue(q => q.map(x => x.name === file.name ? { ...x, status: "processing" } : x));
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      setQueue(q => q.map(x => x.name === file.name ? { ...x, status: "success", chunks: data.chunks_stored } : x));
      onUploadComplete?.();
    } catch (err) {
      setQueue(q => q.map(x => x.name === file.name ? { ...x, status: "error", error: err.message } : x));
    }
  }, [onUploadComplete]);

  const handleFiles = (files) => {
    [...files].forEach(processFile);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 10,
          padding: "18px 12px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? "var(--accent-glow)" : "var(--bg-elevated)",
          transition: "all 0.2s",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          style={{ display: "none" }}
          onChange={e => handleFiles(e.target.files)}
          id="pdf-file-input"
        />
        <div style={{ color: dragging ? "var(--accent)" : "var(--text-muted)", fontSize: 20, marginBottom: 6 }}>
          <Icon.Upload />
        </div>
        <p style={{ fontSize: 11, color: dragging ? "var(--accent)" : "var(--text-muted)", lineHeight: 1.5 }}>
          Drop PDFs here<br />or click to browse
        </p>
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 160, overflowY: "auto" }}>
          {queue.slice().reverse().map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 8px", borderRadius: 7,
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
            }}>
              <span style={{ color: "var(--text-muted)", flexShrink: 0 }}><Icon.File /></span>
              <span style={{
                fontSize: 11, color: "var(--text-secondary)",
                flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }} title={item.name}>{item.name}</span>
              {item.status === "success" && (
                <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>
                  {item.chunks} chunks
                </span>
              )}
              <UploadBadge status={item.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Source Card ──────────────────────────────────────────────────────────────
function SourceCard({ source, index }) {
  const [open, setOpen] = useState(false);
  const score = Math.round((source.score ?? 0) * 100);
  const filename = (source.source || "Unknown").split(/[/\\]/).pop();

  return (
    <div style={{
      background: "var(--source-bg)", border: "1px solid var(--border-accent)",
      borderRadius: 8, overflow: "hidden", marginBottom: 5,
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 7,
        padding: "7px 11px", background: "none", border: "none",
        cursor: "pointer", color: "var(--text-secondary)", fontSize: 11, textAlign: "left",
      }}>
        <Icon.Search />
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          [{index + 1}] {filename}
        </span>
        <span style={{
          background: score >= 70 ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
          color: score >= 70 ? "var(--success)" : "var(--warning)",
          padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600, flexShrink: 0,
        }}>{score}%</span>
        <Icon.Chevron open={open} />
      </button>
      {open && (
        <div style={{
          padding: "6px 11px 10px",
          fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.65,
          borderTop: "1px solid var(--border)",
        }}>
          <p style={{ paddingTop: 6, fontFamily: "monospace", wordBreak: "break-word" }}>
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
      display: "flex", gap: 11,
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-start", marginBottom: 20,
      animation: "fadeIn 0.22s ease",
    }}>
      {/* Avatar */}
      <div style={{
        width: 33, height: 33, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: isUser
          ? "linear-gradient(135deg,#4f46e5,#7c3aed)"
          : "linear-gradient(135deg,#1a1a30,#2a2a50)",
        border: "1px solid var(--border)",
        color: isUser ? "#fff" : "var(--accent)",
      }}>
        {isUser ? <Icon.User /> : <Icon.Bot />}
      </div>

      {/* Body */}
      <div style={{ maxWidth: "74%", display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{
          padding: "11px 15px",
          borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
          background: isUser ? "var(--user-bubble)" : "var(--ai-bubble)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
          fontSize: 14, lineHeight: 1.7,
          boxShadow: isUser ? "0 0 0 1px rgba(124,111,247,0.18)" : "none",
          wordBreak: "break-word", whiteSpace: "pre-wrap",
        }}>
          {msg.text}
        </div>

        {!isUser && msg.sources?.length > 0 && (
          <div>
            <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 5, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Sources
            </p>
            {msg.sources.map((s, i) => <SourceCard key={i} source={s} index={i} />)}
          </div>
        )}

        {!isUser && msg.queryType && (
          <span style={{
            alignSelf: "flex-start", fontSize: 10,
            letterSpacing: "0.07em", textTransform: "uppercase",
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
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", marginBottom: 20 }}>
      <div style={{
        width: 33, height: 33, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg,#1a1a30,#2a2a50)",
        border: "1px solid var(--border)", color: "var(--accent)",
      }}><Icon.Bot /></div>
      <div style={{
        padding: "13px 17px",
        borderRadius: "4px 18px 18px 18px",
        background: "var(--ai-bubble)",
        border: "1px solid var(--border)",
        display: "flex", gap: 5, alignItems: "center",
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--accent)",
            animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
            display: "block",
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ onNewChat, onUploadComplete, documents }) {
  const [docsOpen, setDocsOpen] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(true);

  return (
    <aside style={{
      width: 248, flexShrink: 0,
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 16px 12px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, var(--accent), #5a54c4)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
            boxShadow: "0 0 16px var(--accent-glow)",
          }}>🔬</div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>Research AI</p>
            <p style={{ fontSize: 10, color: "var(--text-muted)" }}>Local · Private · Fast</p>
          </div>
        </div>
      </div>

      {/* New Chat */}
      <div style={{ padding: "12px 12px 8px" }}>
        <button
          id="new-chat-btn"
          onClick={onNewChat}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "9px 14px", borderRadius: 9, width: "100%",
            background: "var(--accent-glow)", border: "1px solid var(--border-accent)",
            color: "var(--accent)", fontSize: 13, fontWeight: 600,
            cursor: "pointer", transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(124,111,247,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--accent-glow)"}
        >
          <Icon.Plus /> New Chat
        </button>
      </div>

      {/* Upload Section */}
      <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)" }}>
        <button
          onClick={() => setUploadOpen(o => !o)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", background: "none", border: "none",
            cursor: "pointer", padding: "6px 4px", borderRadius: 6,
            color: "var(--text-secondary)", fontSize: 11,
            fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon.Upload /> Upload PDFs
          </span>
          <Icon.Chevron open={uploadOpen} />
        </button>
        {uploadOpen && (
          <div style={{ marginTop: 8 }}>
            <UploadPanel onUploadComplete={onUploadComplete} />
          </div>
        )}
      </div>

      {/* Documents Section */}
      <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)", flex: 1 }}>
        <button
          onClick={() => setDocsOpen(o => !o)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", background: "none", border: "none",
            cursor: "pointer", padding: "6px 4px", borderRadius: 6,
            color: "var(--text-secondary)", fontSize: 11,
            fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Icon.File /> Documents ({documents.length})
          </span>
          <Icon.Chevron open={docsOpen} />
        </button>
        {docsOpen && (
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
            {documents.length === 0 ? (
              <p style={{ fontSize: 11, color: "var(--text-muted)", padding: "6px 4px" }}>
                No documents yet. Upload a PDF to get started.
              </p>
            ) : (
              documents.map((doc, i) => {
                const name = doc.split(/[/\\]/).pop();
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "5px 7px", borderRadius: 6,
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                  }}>
                    <span style={{ color: "var(--accent)", flexShrink: 0 }}><Icon.File /></span>
                    <span style={{
                      fontSize: 11, color: "var(--text-secondary)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                    }} title={name}>{name}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid var(--border)",
        fontSize: 10, color: "var(--text-muted)",
        display: "flex", flexDirection: "column", gap: 5,
      }}>
        {[["Qdrant", "Local"], ["Ollama", "tinyllama"], ["BGE", "bge-small-en"]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success)", flexShrink: 0, display: "block" }} />
            <span>{k}</span>
            <span style={{ marginLeft: "auto", color: "var(--text-muted)" }}>{v}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ─── Main Chat ─────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/docs-list`);
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch {
      /* backend not running yet */
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const clearChat = () => {
    setMessages([]);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const sendMessage = async () => {
    const query = input.trim();
    if (!query || loading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", text: query }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/ask?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: "ai",
        text: data.answer || "No answer returned.",
        sources: data.sources || [],
        queryType: data.query_type || "research",
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "ai",
        text: "⚠️ Could not reach the backend. Is uvicorn running on port 8000?",
        sources: [], queryType: null,
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:.5} 40%{transform:translateY(-6px);opacity:1} }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-base)" }}>
        <Sidebar
          onNewChat={clearChat}
          onUploadComplete={fetchDocuments}
          documents={documents}
        />

        {/* Main column */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* Header */}
          <header style={{
            padding: "13px 22px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-surface)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
          }}>
            <div>
              <h1 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>
                AI Research Chat
              </h1>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {documents.length > 0
                  ? `${documents.length} document${documents.length > 1 ? "s" : ""} in knowledge base`
                  : "Upload PDFs using the sidebar to get started"}
              </p>
            </div>
            {messages.length > 0 && (
              <button onClick={clearChat} style={{
                fontSize: 12, color: "var(--text-muted)",
                background: "none", border: "1px solid var(--border)",
                padding: "4px 12px", borderRadius: 6, cursor: "pointer", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-accent)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
              >Clear</button>
            )}
          </header>

          {/* Messages */}
          <section style={{ flex: 1, overflowY: "auto", padding: "22px 24px", display: "flex", flexDirection: "column" }}>
            {messages.length === 0 && !loading && (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 16, textAlign: "center",
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 18,
                  background: "linear-gradient(135deg, var(--accent), #5a54c4)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                  boxShadow: "0 0 48px var(--accent-glow)",
                }}>🔬</div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                    Ask your research papers
                  </h2>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 360, lineHeight: 1.7 }}>
                    Upload PDFs on the left, then ask questions — I'll retrieve relevant passages and cite sources.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                  {[
                    "What is the attention mechanism?",
                    "Summarize transformer architecture",
                    "Hello!",
                  ].map(q => (
                    <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      style={{
                        fontSize: 12, color: "var(--text-secondary)",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        padding: "8px 14px", borderRadius: 20, cursor: "pointer", transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--border-accent)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                    >{q}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </section>

          {/* Input */}
          <footer style={{
            padding: "14px 22px",
            borderTop: "1px solid var(--border)",
            background: "var(--bg-surface)", flexShrink: 0,
          }}>
            <div style={{
              display: "flex", gap: 10, alignItems: "flex-end",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 14, padding: "10px 13px",
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
                placeholder="Ask about your research papers…"
                disabled={loading}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "var(--text-primary)", fontSize: 14, lineHeight: 1.6,
                  resize: "none", minHeight: 24, maxHeight: 140, fontFamily: "inherit",
                }}
              />
              <button
                id="send-btn"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                title="Send (Enter)"
                style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: loading || !input.trim()
                    ? "var(--bg-hover)"
                    : "linear-gradient(135deg, var(--accent), var(--accent-dim))",
                  border: "none",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  color: loading || !input.trim() ? "var(--text-muted)" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (!loading && input.trim()) e.currentTarget.style.transform = "scale(1.06)"; }}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <Icon.Send />
              </button>
            </div>
            <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 7, textAlign: "center" }}>
              Enter to send · Shift+Enter for new line · All processing is local
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}