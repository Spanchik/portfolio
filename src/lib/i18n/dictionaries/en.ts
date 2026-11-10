import { casesEn } from "./cases.en";
import type { Dictionary } from "./uk";

export const en: Dictionary = {
  meta: {
    title: "AI Solutions & Business Process Automation",
    description:
      "1C, database and API integrations, business process automation and AI agents.",
  },
  topbar: {
    langNav: "Site language",
    mainNav: "Site sections",
    cases: "Cases",
    about: "About",
    contact: "Discuss a task",
  },
  hero: {
    title: "I take routine work off your team.",
    subtitle: "I connect 1C, databases and APIs into one system and put AI agents on the repetitive requests: statements, approvals, reports.",
    portraitAlt: "Developer portrait",
    titleAccent: "routine",
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
      { k: "System", title: "One system instead of ten spreadsheets", text: "This is a request from the first case. All three projects below are built the same way." },
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
    text: "I automate internal processes for companies that run on 1C. I take the whole job: from the integration with the accounting database to the AI agent an employee messages in Telegram. I work solo: from mapping the process to deployment and support. Recent projects: an HR assistant with 25+ tools, an HR platform synchronised with 1C, and a BAS Retail to Glovo exchange for 32 stores. In my systems access rights are checked by code, not by the model.",
  },
  cases: casesEn,
  contact: {
    title: "Let's talk about your automation",
    text: "Tell me where your team loses time on routine work — I'll suggest what can be automated.",
    write: "Message me on Telegram",
    copy: "Copy address",
    copied: "Copied",
  },
  footer: {
    top: "Back to top",
  },
};
