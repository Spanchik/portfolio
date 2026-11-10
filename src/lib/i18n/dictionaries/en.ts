import { casesEn } from "./cases.en";
import type { Dictionary } from "./uk";

export const en: Dictionary = {
  meta: {
    title: "Website development, process automation and AI agents",
    description:
      "I build websites, internal systems and AI agents for business. Integrations with accounting, databases and external services. Cases: an HR assistant, an HR platform, a BAS Retail to Glovo exchange.",
  },
  topbar: {
    langNav: "Site language",
    mainNav: "Site sections",
    cases: "Cases",
    about: "About",
    faq: "FAQ",
    contact: "Discuss a task",
  },
  hero: {
    title: "I build websites and systems that work for\u00a0you.",
    subtitle: "I develop websites, internal systems and AI agents and connect them to your data: accounting, databases, external services.",
    portraitAlt: "Developer portrait",
    titleAccent: "work",
    ctaPrimary: "Discuss a task",
    ctaSecondary: "See the cases",
  },
  story: {
    hint: "Scroll to see how it works",
    cta: "See the cases",
    breakHint: "Switch a block off: requests queue up instead of getting lost",
    offline: "offline",
    sceneLabel: "3D diagram of a typical automation architecture",
    stages: [
      { k: "Request", title: "An employee writes in Telegram", text: "An ordinary message in a messenger, with no forms and no paper requests." },
      { k: "Data", title: "The agent checks the role and reads the balance from 1C", text: "Access is decided by code, not by the model. The answer comes in seconds." },
      { k: "Process", title: "The request goes for approval by itself", text: "The manager gets the request, and the system tracks deadlines and escalation." },
      { k: "System", title: "One system instead of ten spreadsheets", text: "This is a request from the first case. The systems in the cases below are built the same way." },
    ],
    tags: { role: "role: employee ✓", balance: "balance: 14 days", approved: "approved ✓" },
    chat: {
      title: "HR Assistant",
      status: "bot · online",
      messages: [
        { from: "user", at: 1, text: "How many vacation days do I have left?" },
        { from: "bot", at: 2, text: "Balance: 14 days. File a request?" },
        { from: "user", at: 3, text: "Yes, May 12 to 18" },
        { from: "bot", at: 3, text: "Request #204 created and sent to your manager." },
      ],
      approved: "Approved · document generated",
    },
  },
  machine: {
    label: "Isometric diagram of a typical automation architecture",
    caption: "Typical automation architecture · illustration",
    pause: "Pause animation",
    subs: {
      tg: "chat bot",
      web: "portal",
      api: "HTTP",
      rbac: "roles",
      agent: "tool calling",
      tools: "connectors",
      c1: "accounting",
      sheets: "SQL",
      approval: "approvals",
    },
  },
  about: {
    title: "About me",
    text: "I build websites, internal systems and AI agents for business. I work solo, with AI tools in development: that gives speed, and I review every change myself. I take the whole job, from mapping the process to deployment and support, and integrate with what the company already runs: 1C/BAS, databases, external services.",
    servicesLabel: "What I do",
    services: [
      { t: "Websites and web apps", d: "Landing pages, portfolios, customer areas and internal portals: from design to deployment." },
      { t: "Internal systems and integrations", d: "Data exchange between 1C/BAS, databases and external services, admin panels and reports." },
      { t: "AI agents and bots", d: "Assistants in Telegram and on the web that answer requests and take actions in your systems." },
    ],
  },
  cases: casesEn,
  contact: {
    title: "Let's talk about your task",
    text: "Tell me what you need: a website, an internal system or a process automated. I'll suggest a solution and estimate the timeline.",
    write: "Message me on Telegram",
    direct: "Or directly",
    copy: "Copy address",
    copied: "Copied",
    form: {
      title: "Describe the task",
      name: "Name",
      contact: "How to reach you",
      contactHint: "Telegram, phone or e-mail",
      task: "What needs to be done",
      taskPlaceholder: "For example: a bot for vacation requests with data from 1C",
      sendTg: "Send via Telegram",
      sendMail: "Send by e-mail",
      note: "Telegram or your mail app will open with the text ready. All that is left is to press Send.",
      subject: "Task from the portfolio site",
    },
  },
  faq: {
    title: "Questions people ask",
    items: [
      { q: "How long does a project take?", a: "It depends on the task. After a short review I name the timeline and split the work into stages: each stage ends with a working part you can check." },
      { q: "Do you work with our 1C or BAS?", a: "Yes. I connect to the existing configuration through HTTP services, OData or directly to the database, with no rewriting of your accounting." },
      { q: "How are data and access protected?", a: "Access is checked by code, not by the model: roles, filtering of available actions, a second check before every call and an audit log." },
      { q: "You work solo. What if the task is big?", a: "I work solo, with AI tools in development, and review every change myself. I split a big task into stages so the first result appears early, not at the end." },
      { q: "What happens after launch?", a: "I keep supporting the system: fixes, improvements, new integrations. We agree on the support format before the work starts." },
    ],
  },
  footer: {
    top: "Back to top",
  },
};
