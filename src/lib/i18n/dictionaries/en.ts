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
    contact: "Discuss a task",
  },
  hero: {
    title: "I build websites and systems that work for you.",
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
    chaos: {
      k: "From chaos",
      title: "Spreadsheets, e-mails and messages — into one stream",
      text: "Scattered documents become structured data that the system works with from then on.",
    },
    steps: [
      { k: "Request", title: "“How many vacation days do I have left?”", text: "An employee writes in Telegram. The agent checks their role in code and picks the tool: the model does not decide access." },
      { k: "Data & process", title: "The answer comes from 1C, the request goes for approval", text: "The agent reads the balance from 1C and answers in seconds. The vacation request goes to the manager by itself and comes back approved." },
      { k: "System", title: "One system instead of ten spreadsheets", text: "This is a request from the first case. The systems in the cases below are built the same way." },
    ],
    script: {
      ask: "How many vacation days do I have left?",
      role: "role: employee ✓",
      tool: "tool: vacation balance",
      balance: "1C: 14 days",
      answer: "Balance: 14 days. File a request?",
      approved: "Request #204 approved ✓",
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
    copy: "Copy address",
    copied: "Copied",
  },
  footer: {
    top: "Back to top",
  },
};
