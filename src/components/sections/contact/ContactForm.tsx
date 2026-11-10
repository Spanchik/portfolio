"use client";

import { useState, type FormEvent } from "react";
import { Mail, Send } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries/uk";
import { site } from "@/lib/site";

type FormDict = Dictionary["contact"]["form"];

/**
 * Short brief form. There is no backend: on submit the visitor's own Telegram or mail
 * client opens with the message already written, addressed to the site owner. Nothing
 * is stored or sent by the page itself.
 */
export function ContactForm({ dict }: { dict: FormDict }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [task, setTask] = useState("");
  const { email, telegram } = site.contacts;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const via = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
    const head = [name.trim() && `${dict.name}: ${name.trim()}`, contact.trim() && `${dict.contact}: ${contact.trim()}`].filter(Boolean);
    const message = [...head, ...(head.length ? [""] : []), task.trim()].join("\n");
    if (via === "tg" && telegram) {
      window.open(`https://t.me/${telegram}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(dict.subject)}&body=${encodeURIComponent(message)}`;
    }
  };

  const field =
    "w-full rounded-xl border-[1.5px] border-ink/25 bg-paper px-3.5 text-[15px] text-ink placeholder:text-ink/40 focus:border-bg focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg";
  const label = "mb-1.5 block text-[13px] font-semibold";

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-2xl border-[1.5px] border-ink bg-white p-5 text-ink shadow-[8px_8px_0_var(--color-bg)] md:p-7"
    >
      <p className="font-display text-lg font-medium tracking-[-0.01em] md:text-xl">{dict.title}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label>
          <span className={label}>{dict.name}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} name="name" autoComplete="name" maxLength={80} className={`${field} h-12`} />
        </label>
        <label>
          <span className={label}>{dict.contact}</span>
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            name="contact"
            maxLength={120}
            placeholder={dict.contactHint}
            className={`${field} h-12`}
          />
        </label>
      </div>

      <label>
        <span className={label}>{dict.task}</span>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          name="task"
          required
          minLength={10}
          maxLength={1500}
          rows={4}
          placeholder={dict.taskPlaceholder}
          className={`${field} resize-y py-3 leading-relaxed`}
        />
      </label>

      <div className="flex flex-wrap gap-3">
        {telegram && (
          <button
            type="submit"
            value="tg"
            className="btn-iso inline-flex h-12 items-center gap-2 rounded-full bg-bg px-5 text-sm font-semibold text-fg hover:bg-accent hover:text-ink"
          >
            <Send size={16} strokeWidth={2.2} />
            {dict.sendTg}
          </button>
        )}
        <button
          type="submit"
          value="mail"
          className="btn-iso inline-flex h-12 items-center gap-2 rounded-full border-[1.5px] border-ink px-5 text-sm font-semibold hover:bg-ink hover:text-fg"
        >
          <Mail size={16} strokeWidth={2.2} />
          {dict.sendMail}
        </button>
      </div>
      <p className="text-[13px] leading-relaxed text-ink/60">{dict.note}</p>
    </form>
  );
}
