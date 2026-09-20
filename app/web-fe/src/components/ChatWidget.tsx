import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { streamChat } from "../api/chat";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

function nextId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Xin chào, mình là trợ lý AuraScent. Bạn muốn hỏi về nến thơm hay chính sách cửa hàng?",
    },
  ]);

  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const send = async (event?: FormEvent) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || busy) {
      return;
    }

    const userMessage: ChatMessage = {
      id: nextId(),
      role: "user",
      content: text,
    };
    const assistantId = nextId();
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setBusy(true);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      await streamChat(
        text,
        (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: msg.content + chunk }
                : msg,
            ),
          );
        },
        abort.signal,
      );
    } catch (error) {
      if (abort.signal.aborted) {
        return;
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
              ...msg,
              content:
                msg.content ||
                "Hiện chưa kết nối được trợ lý. Bạn thử lại sau giúp mình nhé.",
            }
            : msg,
        ),
      );
      console.error(error);
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="chat-widget">
      {open ? (
        <section className="chat-panel" aria-label="Chat AuraScent">
          <header className="chat-panel-header">
            <div>
              <p className="chat-panel-kicker">AuraScent</p>
              <h2 className="text-white">Trợ lý hương thơm</h2>
            </div>
            <button
              type="button"
              className="chat-icon-btn"
              onClick={() => setOpen(false)}
              aria-label="Đóng chat"
            >
              <X size={18} />
            </button>
          </header>

          <div className="chat-messages" ref={listRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble chat-bubble-${msg.role}`}
              >
                {msg.content || (busy ? "..." : "")}
              </div>
            ))}
          </div>

          <form className="chat-composer" onSubmit={send}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về nến, giá, đổi trả..."
              maxLength={2000}
              disabled={busy}
              aria-label="Nội dung tin nhắn"
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={busy || !input.trim()}
              aria-label="Gửi"
            >
              <Send size={16} />
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Đóng chat" : "Mở chat AuraScent"}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}