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
  },
  hero: {
    title: "AI solutions and business process automation.",
    subtitle: "I connect 1C, databases and APIs into a single system — and hand the routine over to AI agents.",
    portraitAlt: "Developer portrait",
    titleAccent: "automation",
  },
  story: {
    hint: "Scroll to see how it works",
    breakHint: "Click a block to switch it off",
    offline: "offline",
    sceneLabel: "3D diagram of a typical automation architecture",
    chaos: {
      k: "From chaos",
      title: "Spreadsheets, e-mails and messages — into one stream",
      text: "Scattered documents become structured data that the system works with from then on.",
    },
    steps: [
      { k: "Input", title: "Requests arrive from any channel", text: "Telegram, a web portal or an external service via API — everything lands in one system." },
      { k: "AI agent", title: "The agent understands what needs doing", text: "It picks the right tools, while access rights are checked by code, not by the model." },
      { k: "Data", title: "Data is taken where it lives", text: "Integrations with 1C, databases and external services via API — no manual copying." },
      { k: "Process", title: "Then the process runs itself", text: "Approvals, notifications, reports — routine steps happen automatically." },
      { k: "System", title: "One system instead of ten spreadsheets", text: "Channels, the AI agent, integrations and processes work as a single mechanism." },
    ],
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
    text: "I build systems where data doesn't get lost between applications and routine operations run on their own. I integrate 1C, databases and external services via API, automate business processes and deploy AI agents — with access control enforced in code.",
  },
  cases: casesEn,
  contact: {
    title: "Let's talk about your automation",
    text: "Tell me where your team loses time on routine work — I'll suggest what can be automated.",
    write: "Write to me",
    copy: "Copy address",
    copied: "Copied",
  },
  footer: {
    top: "Back to top",
  },
};
