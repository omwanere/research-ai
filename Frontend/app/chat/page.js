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
  Stop: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={14} height={14}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" width={15} height={15}>
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={14} height={14}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Copy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={13} height={13}>
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={13} height={13}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={13} height={13}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Warn: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={15} height={15}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

// ─── Toast Notification ───────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div style={{
      position: "fixed", bottom: 90, right: 20, zIndex: 100,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 10,
          background: t.type === "error" ? "rgba(248,113,113,0.12)" : "rgba(34,197,94,0.12)",
          border: `1px solid ${t.type === "error" ? "rgba(248,113,113,0.3)" : "rgba(34,197,94,0.3)"}`,
          backdropFilter: "blur(12px)",
          color: t.type === "error" ? "#f87171" : "var(--success)",
          fontSize: 13, minWidth: 240, maxWidth: 360,
          animation: "slideInRight 0.25s ease",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>
          <span style={{ flexShrink: 0 }}>
            {t.type === "error" ? <Icon.Warn /> : <Icon.Check />}
          </span>
          <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
          <button onClick={() => removeToast(t.id)} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "inherit", opacity: 0.6, flexShrink: 0, padding: 2,
          }}><Icon.X /></button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = "error") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
  }, []);
  const remove = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), []);
  return { toasts, add, remove };
}

// ─── Upload Panel ─────────────────────────────────────────────────────────────
function UploadPanel({ onUploadComplete, addToast }) {
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState([]);
  const fileInputRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      addToast(`"${file.name}" is not a PDF`, "error");
      return;
    }
    const key = `${file.name}-${Date.now()}`;
    setQueue(q => [...q, { key, name: file.name, status: "uploading", chunks: 0 }]);
    const form = new FormData();
    form.append("file", file);
    try {
      setQueue(q => q.map(x => x.key === key ? { ...x, status: "processing" } : x));
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      setQueue(q => q.map(x => x.key === key ? { ...x, status: "success", chunks: data.chunks_stored } : x));
      addToast(`✓ "${file.name}" ingested (${data.chunks_stored} chunks)`, "success");
      onUploadComplete?.();
    } catch (err) {
      setQueue(q => q.map(x => x.key === key ? { ...x, status: "error" } : x));
      addToast(`Upload failed: ${err.message}`, "error");
    }
  }, [addToast, onUploadComplete]);

  const handleFiles = fs => [...fs].forEach(processFile);
  const onDrop = e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); };

  const statusStyle = {
    uploading: { bg: "rgba(124,111,247,0.15)", color: "var(--accent)", label: "Uploading…" },
    processing: { bg: "rgba(245,158,11,0.15)", color: "var(--warning)", label: "Embedding…" },
    success: { bg: "rgba(34,197,94,0.15)", color: "var(--success)", label: "Stored ✓" },
    error: { bg: "rgba(248,113,113,0.15)", color: "#f87171", label: "Failed ✗" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 10, padding: "16px 10px", textAlign: "center",
          cursor: "pointer",
          background: dragging ? "var(--accent-glow)" : "var(--bg-elevated)",
          transition: "all 0.2s",
        }}
      >
        <input ref={fileInputRef} type="file" accept=".pdf" multiple
          style={{ display: "none" }} id="pdf-file-input"
          onChange={e => handleFiles(e.target.files)} />
        <p style={{ fontSize: 22, marginBottom: 4 }}>📄</p>
        <p style={{ fontSize: 11, color: dragging ? "var(--accent)" : "var(--text-muted)", lineHeight: 1.5 }}>
          Drop PDFs here or <span style={{ textDecoration: "underline" }}>browse</span>
        </p>
      </div>
      {queue.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 150, overflowY: "auto" }}>
          {queue.slice().reverse().map(item => {
            const s = statusStyle[item.status] || statusStyle.uploading;
            return (
              <div key={item.key} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 8px", borderRadius: 7,
                background: "var(--bg-elevated)", border: "1px solid var(--border)",
              }}>
                <span style={{ color: "var(--text-muted)", flexShrink: 0 }}><Icon.File /></span>
                <span style={{
                  fontSize: 11, color: "var(--text-secondary)", flex: 1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }} title={item.name}>{item.name}</span>
                {item.status === "success" && (
                  <span style={{ fontSize: 10, color: "var(--text-muted)", flexShrink: 0 }}>
                    {item.chunks}
                  </span>
                )}
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "1px 6px",
                  borderRadius: 4, background: s.bg, color: s.color, flexShrink: 0,
                }}>{s.label}</span>
              </div>
            );
          })}
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
        padding: "7px 10px", background: "none", border: "none",
        cursor: "pointer", color: "var(--text-secondary)", fontSize: 11, textAlign: "left",
      }}>
        <Icon.Search />
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          [{index + 1}] {filename}
        </span>
        <span style={{
          background: score >= 70 ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
          color: score >= 70 ? "var(--success)" : "var(--warning)",
          padding: "1px 5px", borderRadius: 4, fontSize: 10, fontWeight: 600, flexShrink: 0,
        }}>{score}%</span>
        <Icon.Chevron open={open} />
      </button>
      {open && (
        <div style={{
          padding: "6px 10px 10px", fontSize: 11,
          color: "var(--text-secondary)", lineHeight: 1.65,
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

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  };
  return (
    <button onClick={copy} title="Copy" style={{
      background: "none", border: "none", cursor: "pointer",
      color: copied ? "var(--success)" : "var(--text-muted)",
      padding: 4, borderRadius: 4, transition: "color 0.2s",
      display: "flex", alignItems: "center",
    }}>
      {copied ? <Icon.Check /> : <Icon.Copy />}
    </button>
  );
}

// ─── Cursor blink ─────────────────────────────────────────────────────────────
function StreamCursor() {
  return (
    <span style={{
      display: "inline-block", width: 2, height: "1em",
      background: "var(--accent)", marginLeft: 1,
      animation: "cursorBlink 1s step-end infinite",
      verticalAlign: "text-bottom", borderRadius: 1,
    }} />
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const isStreaming = msg.streaming;

  return (
    <div style={{
      display: "flex", gap: 11,
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-start", marginBottom: 20,
      animation: "fadeIn 0.22s ease",
    }}>
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

      <div style={{ maxWidth: "74%", display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{
          padding: "11px 15px",
          borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
          background: isUser ? "var(--user-bubble)" : "var(--ai-bubble)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)", fontSize: 14, lineHeight: 1.75,
          boxShadow: isUser ? "0 0 0 1px rgba(124,111,247,0.18)" : "none",
          wordBreak: "break-word", whiteSpace: "pre-wrap",
          position: "relative",
        }}>
          {msg.text || (isStreaming ? "" : "…")}
          {isStreaming && <StreamCursor />}

          {/* Copy button — only for finished AI messages */}
          {!isUser && !isStreaming && msg.text && (
            <div style={{ position: "absolute", top: 8, right: 10, opacity: 0.5 }}
              onMouseEnter={e => e.currentTarget.style.opacity = "1"}
              onMouseLeave={e => e.currentTarget.style.opacity = "0.5"}
            >
              <CopyButton text={msg.text} />
            </div>
          )}
        </div>

        {!isUser && !isStreaming && msg.sources?.length > 0 && (
          <div>
            <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 5, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Sources
            </p>
            {msg.sources.map((s, i) => <SourceCard key={i} source={s} index={i} />)}
          </div>
        )}

        {!isUser && !isStreaming && msg.queryType && (
          <span style={{
            alignSelf: "flex-start", fontSize: 10, letterSpacing: "0.07em",
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

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ onNewChat, onUploadComplete, documents, addToast }) {
  const [docsOpen, setDocsOpen] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(true);

  const SectionHeader = ({ icon, label, open, onToggle }) => (
    <button onClick={onToggle} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      width: "100%", background: "none", border: "none",
      cursor: "pointer", padding: "6px 4px", borderRadius: 6,
      color: "var(--text-secondary)", fontSize: 10,
      fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>{icon}{label}</span>
      <Icon.Chevron open={open} />
    </button>
  );

  return (
    <aside style={{
      width: 248, flexShrink: 0,
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, var(--accent), #5a54c4)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
            boxShadow: "0 0 20px var(--accent-glow)",
          }}>🔬</div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>Research AI</p>
            <p style={{ fontSize: 10, color: "var(--text-muted)" }}>Local · Private · Streaming</p>
          </div>
        </div>
      </div>

      {/* New Chat */}
      <div style={{ padding: "12px 12px 8px" }}>
        <button id="new-chat-btn" onClick={onNewChat} style={{
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

      {/* Upload */}
      <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)" }}>
        <SectionHeader
          icon={<Icon.Upload />}
          label="Upload PDFs"
          open={uploadOpen}
          onToggle={() => setUploadOpen(o => !o)}
        />
        {uploadOpen && (
          <div style={{ marginTop: 8 }}>
            <UploadPanel onUploadComplete={onUploadComplete} addToast={addToast} />
          </div>
        )}
      </div>

      {/* Documents */}
      <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)", flex: 1 }}>
        <SectionHeader
          icon={<Icon.File />}
          label={`Documents (${documents.length})`}
          open={docsOpen}
          onToggle={() => setDocsOpen(o => !o)}
        />
        {docsOpen && (
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
            {documents.length === 0 ? (
              <p style={{ fontSize: 11, color: "var(--text-muted)", padding: "6px 4px", lineHeight: 1.5 }}>
                No documents yet.<br />Upload a PDF to get started.
              </p>
            ) : (
              documents.map((doc, i) => {
                const name = doc.split(/[/\\]/).pop();
                return (
                  <div key={i} title={name} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "5px 7px", borderRadius: 6,
                    background: "var(--bg-elevated)", border: "1px solid var(--border)",
                  }}>
                    <span style={{ color: "var(--accent)", flexShrink: 0 }}><Icon.File /></span>
                    <span style={{
                      fontSize: 11, color: "var(--text-secondary)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                    }}>{name}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Status */}
      <div style={{
        padding: "12px 16px", borderTop: "1px solid var(--border)",
        fontSize: 10, color: "var(--text-muted)",
        display: "flex", flexDirection: "column", gap: 5,
      }}>
        {[["Qdrant", "Local"], ["Ollama", "tinyllama"], ["BGE", "bge-small-en"]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--success)", flexShrink: 0, display: "block" }} />
            <span>{k}</span>
            <span style={{ marginLeft: "auto" }}>{v}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ─── Main Chat Page ────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [documents, setDocuments] = useState([]);
  const abortRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { toasts, add: addToast, remove: removeToast } = useToast();

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/docs-list`);
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch { /* backend not ready */ }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setStreaming(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const stopStream = () => {
    abortRef.current?.abort();
    setStreaming(false);
    setMessages(prev => prev.map((m, i) =>
      i === prev.length - 1 && m.streaming ? { ...m, streaming: false } : m
    ));
  };

  const sendMessage = async () => {
    const query = input.trim();
    if (!query || streaming) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", text: query }]);
    setStreaming(true);

    // Placeholder for the AI message
    const aiId = Date.now();
    setMessages(prev => [...prev, { id: aiId, role: "ai", text: "", sources: [], queryType: null, streaming: true }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(
        `${API_BASE}/ask/stream?query=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      );

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";  // keep incomplete line

        let eventName = "";
        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventName = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            const raw = line.slice(5).trim();
            try {
              const payload = JSON.parse(raw);
              if (eventName === "token") {
                setMessages(prev => prev.map(m =>
                  m.id === aiId ? { ...m, text: (m.text || "") + payload.token } : m
                ));
              } else if (eventName === "sources") {
                setMessages(prev => prev.map(m =>
                  m.id === aiId
                    ? { ...m, sources: payload.sources, queryType: payload.query_type }
                    : m
                ));
              } else if (eventName === "error") {
                addToast(payload.message, "error");
              }
            } catch { /* malformed JSON */ }
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        addToast("Cannot reach backend. Is uvicorn running on port 8000?", "error");
        setMessages(prev => prev.map(m =>
          m.id === aiId
            ? { ...m, text: "⚠️ Backend connection failed.", streaming: false }
            : m
        ));
      }
    } finally {
      setMessages(prev => prev.map(m =>
        m.id === aiId ? { ...m, streaming: false } : m
      ));
      setStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const EXAMPLES = [
    "What is the attention mechanism?",
    "Explain transformer architecture",
    "Hello!",
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      <Toast toasts={toasts} removeToast={removeToast} />

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-base)" }}>
        <Sidebar
          onNewChat={clearChat}
          onUploadComplete={fetchDocuments}
          documents={documents}
          addToast={addToast}
        />

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
                  ? `${documents.length} document${documents.length !== 1 ? "s" : ""} indexed · streaming enabled`
                  : "Upload PDFs to start asking questions"}
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
            {messages.length === 0 && (
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
                    Upload PDFs on the left, then ask questions — answers stream in real time with source citations.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                  {EXAMPLES.map(q => (
                    <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }} style={{
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

            {messages.map((msg, i) => <MessageBubble key={msg.id ?? i} msg={msg} />)}
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
              background: "var(--bg-elevated)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "10px 13px", transition: "border-color 0.2s",
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
                disabled={streaming}
                style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  color: "var(--text-primary)", fontSize: 14, lineHeight: 1.6,
                  resize: "none", minHeight: 24, maxHeight: 140, fontFamily: "inherit",
                  opacity: streaming ? 0.5 : 1,
                }}
              />
              {streaming ? (
                <button id="stop-btn" onClick={stopStream} title="Stop generating" style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)",
                  cursor: "pointer", color: "#f87171",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}>
                  <Icon.Stop />
                </button>
              ) : (
                <button id="send-btn" onClick={sendMessage} disabled={!input.trim()} title="Send (Enter)" style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: !input.trim() ? "var(--bg-hover)" : "linear-gradient(135deg, var(--accent), var(--accent-dim))",
                  border: "none", cursor: !input.trim() ? "not-allowed" : "pointer",
                  color: !input.trim() ? "var(--text-muted)" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { if (input.trim()) e.currentTarget.style.transform = "scale(1.06)"; }}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <Icon.Send />
                </button>
              )}
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