"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";
import { sendChatMessage, subscribeToChat } from "@/lib/data";

// THE PORCH — live talk beside the window. Twitch's layout, the barn's
// materials: a paper rail, inked names, no avatars, no glow. Message
// colors rotate through the palette's three quiet accents by name hash.
const NAME_COLORS = ["var(--dusk)", "var(--sage)", "var(--ember-deep)"];

function nameColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return NAME_COLORS[h % NAME_COLORS.length];
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatPanel({
  slug,
  className = "",
  style,
}: {
  slug: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const stickRef = useRef(true);

  useEffect(() => {
    try {
      setName(localStorage.getItem("porch-name") ?? "");
    } catch {}
    return subscribeToChat(slug, setMsgs);
  }, [slug]);

  // Stick to the bottom unless the reader scrolled up on purpose.
  useEffect(() => {
    const el = listRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  function onScroll() {
    const el = listRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    const n = (name.trim() || "porch-guest").slice(0, 24);
    if (!t) return;
    try {
      localStorage.setItem("porch-name", n);
    } catch {}
    setName(n);
    setText("");
    setErr(null);
    try {
      await sendChatMessage(slug, n, t.slice(0, 240));
    } catch {
      setErr("That didn't land — try again in a moment.");
    }
  }

  return (
    <aside
      className={
        "flex min-h-0 flex-col border-l border-edge bg-paper " + className
      }
      style={style}
      aria-label="The Porch — live chat with everyone watching"
    >
      <header className="flex items-baseline gap-2.5 border-b border-edge bg-paper-2 px-4 py-2.5">
        <h2 className="font-display text-lg font-black leading-none">The Porch</h2>
        <p className="text-[0.78rem] text-ink-3">everyone watching, talking</p>
      </header>

      <ol
        ref={listRef}
        onScroll={onScroll}
        className="m-0 flex-1 list-none overflow-y-auto overscroll-contain px-4 py-3"
        aria-live="polite"
      >
        {msgs.map((m) => (
          <li key={m.id} className="mb-1.5 break-words text-[0.9rem] leading-snug">
            <span className="tnum mr-1.5 hidden text-[0.68rem] text-ink-3 sm:inline">
              {timeLabel(m.at)}
            </span>
            <span className="font-bold" style={{ color: nameColor(m.name) }}>
              {m.name}
            </span>
            <span className="text-ink-3">: </span>
            <span className={m.own ? "font-bold text-ink" : "text-ink"}>{m.text}</span>
          </li>
        ))}
      </ol>

      <form onSubmit={send} className="border-t border-edge bg-paper-2 px-3 py-2.5">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="your name"
            maxLength={24}
            aria-label="Your name on the porch"
            className="w-[8.5rem] min-w-0 border border-edge bg-paper px-2 py-1.5 text-[0.82rem] text-ink placeholder:text-ink-3"
          />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Say something…"
            maxLength={240}
            aria-label="Message"
            className="min-w-0 flex-1 border border-edge bg-paper px-2 py-1.5 text-[0.9rem] text-ink placeholder:text-ink-3"
          />
          <button
            type="submit"
            className="border border-edge bg-ember px-3 py-1.5 text-[0.82rem] font-bold text-paper transition-transform duration-[120ms] ease-thunk active:translate-y-[2px]"
          >
            Send
          </button>
        </div>
        <p className="mt-1.5 text-[0.72rem] text-ink-3">
          {err ?? "Be kind — the bats can't hear you, but the humans can."}
        </p>
      </form>
    </aside>
  );
}
