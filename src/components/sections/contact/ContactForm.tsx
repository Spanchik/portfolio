"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries/uk";
import { site } from "@/lib/site";

type FormDict = Dictionary["contact"]["form"];

/**
 * Short brief form, drawn straight on the dark section (no card). There is no backend:
 * on submit the visitor's own Telegram or mail client opens with the message already
 * written, addressed to the site owner. Nothing is stored or sent by the page itself.
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

  // underlined fields: the form reads as part of the section, not as a widget pasted onto it
  const field =
    "w-full rounded-none border-0 border-b-[1.5px] border-fg/35 bg-transparent px-0 text-[17px] text-fg placeholder:text-fg/35 transition-colors hover:border-fg/60 focus:border-accent focus:outline-none";
  const label = "block text-xs font-semibold tracking-[0.12em] text-muted uppercase";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-7">
      <p className="font-display text-xl font-medium tracking-[-0.01em] md:text-2xl">{dict.title}</p>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-8">
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
          rows={3}
          placeholder={dict.taskPlaceholder}
          className={`${field} mt-1 resize-y py-3 leading-relaxed`}
        />
      </label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <button
          type="submit"
          value={telegram ? "tg" : "mail"}
          className="btn-iso inline-flex h-14 items-center justify-center gap-2 rounded-full bg-fg px-7 font-display text-sm font-bold text-ink hover:bg-accent"
        >
          {telegram ? dict.sendTg : dict.sendMail}
          <ArrowUpRight size={18} strokeWidth={2.2} />
        </button>
        {telegram && (
          <button
            type="submit"
            value="mail"
            className="inline-flex h-11 items-center justify-center text-sm font-semibold underline decoration-fg/40 decoration-2 underline-offset-4 hover:decoration-accent"
          >
            {dict.sendMail}
          </button>
        )}
      </div>
      <p className="max-w-[52ch] text-[13px] leading-relaxed text-fg/60">{dict.note}</p>
    </form>
  );
}
