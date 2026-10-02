import { FileText, Scale, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const UPDATED = "2 October 2026";
const CONTACT_EMAIL = "support@texnet.example"; // TODO: ganti dengan email kamu

// ---------------------------------------------------------------------------
// Konten
// ---------------------------------------------------------------------------
const PAGES = {
  terms: {
    path: "/terms",
    tab: "Terms of Service",
    icon: FileText,
    title: "Terms of Service",
    intro:
      "These terms explain how you may use TEXNet. By creating an account or browsing as a guest, you agree to them.",
    sections: [
      {
        h: "Using TEXNet",
        p: [
          "TEXNet is a platform for sharing and learning networking guides: topology, installation, maintenance, and hardware. You can read guides as a guest, or sign up to publish guides, build quizzes, and keep a reading list.",
          "You must provide accurate information when registering and keep your password private. You are responsible for activity under your account.",
        ],
      },
      {
        h: "Accounts and roles",
        p: [
          "Guest accounts can read content and use tools such as the subnet calculator, but cannot publish guides or build exams. Registered users (Guiders) can publish and manage their own guides. Administrators can post announcements and moderate content.",
          "We may suspend or remove accounts that break these terms or the Content Policy.",
        ],
      },
      {
        h: "Your content",
        p: [
          "You keep ownership of the guides, comments, and quizzes you publish. By publishing, you give TEXNet a non-exclusive licence to host, display, and distribute that content on the platform so other users can read it.",
          "You are responsible for what you publish. Only post content you wrote or have the right to share.",
        ],
      },
      {
        h: "Technical guidance and safety",
        p: [
          "Guides are written by community members and are provided for learning. Network equipment can be damaged, and networks can be disrupted, by wrong configuration. Test changes in a safe environment first. TEXNet is not responsible for loss or damage caused by following a guide.",
          "Only run configurations on networks and devices you own or have permission to manage.",
        ],
      },
      {
        h: "Acceptable use",
        p: [
          "Do not attempt to break into the service, scrape it at scale, overload it, or access accounts that are not yours. Do not use TEXNet to plan or carry out unauthorised access to other people's networks.",
        ],
      },
      {
        h: "Third-party links and brands",
        p: [
          "The Reference brands section links to external sites such as MikroTik, Ubiquiti, and TP-Link. Those brands belong to their owners, are shown for reference only, and imply no endorsement. We do not control those sites.",
        ],
      },
      {
        h: "Availability and changes",
        p: [
          "We try to keep TEXNet running but do not guarantee uninterrupted access. We may update features or these terms. When we make important changes, we will post an announcement. Continuing to use TEXNet after a change means you accept it.",
        ],
      },
      {
        h: "Disclaimer and liability",
        p: [
          "TEXNet is provided as is, without warranties of any kind. To the extent allowed by law, we are not liable for indirect or consequential losses arising from your use of the service.",
        ],
      },
    ],
  },

  privacy: {
    path: "/privacy",
    tab: "Privacy Policy",
    icon: Shield,
    title: "Privacy Policy",
    intro:
      "This policy describes what information TEXNet collects, why, and the choices you have.",
    sections: [
      {
        h: "Information we collect",
        list: [
          "Account details: name, email address, password (stored hashed), job title, and profile photo if you add one.",
          "Content you create: guides, quizzes, quiz results, reading-list items, and pins.",
          "Usage data: guide view counts and which pages you open, used for Total reads and Trending.",
          "Guest sessions: a guest account is created so you can browse without registering. It holds no personal details.",
        ],
      },
      {
        h: "Information stored on your device",
        p: [
          "TEXNet saves a few preferences in your browser's local storage: your sidebar state (collapsed or expanded), your theme, and which announcements you have already read. This stays on your device and is not sent to us.",
          "The Signal condition card reads your browser's network information (connection type, speed estimate, and latency) locally to display it. We do not store it.",
        ],
      },
      {
        h: "How we use information",
        list: [
          "To run your account and show your guides, quizzes, and reading list.",
          "To show public author information on guides you publish.",
          "To rank guides (Trending), count reads, and improve the service.",
          "To send announcements and respond to support requests.",
        ],
      },
      {
        h: "What is public",
        p: [
          "Your name, title, avatar, and the guides you publish are visible to other users. Your email address is not shown publicly. Your reading list and quiz results are private to you.",
        ],
      },
      {
        h: "Sharing",
        p: [
          "We do not sell your personal data. We share it only with service providers that host or operate TEXNet, when required by law, or to protect the safety and security of users and the service.",
        ],
      },
      {
        h: "Retention and deletion",
        p: [
          "We keep your data while your account is active. You can ask us to delete your account and associated personal data at any time using the contact below. Guides you published may be removed with the account.",
        ],
      },
      {
        h: "Security",
        p: [
          "We use reasonable safeguards such as hashed passwords and encrypted connections. No system is completely secure, so please use a strong, unique password.",
        ],
      },
      {
        h: "Your choices",
        p: [
          "You can edit your profile, remove your content, or clear browser storage at any time. To access, correct, or delete your data, contact us.",
        ],
      },
    ],
  },

  policy: {
    path: "/content-policy",
    tab: "Content Policy",
    icon: Scale,
    title: "Content Policy",
    intro:
      "TEXNet works because guides are accurate, original, and safe to follow. These rules apply to everything you publish.",
    sections: [
      {
        h: "What we expect",
        list: [
          "Write original guides, or credit your sources clearly.",
          "Be accurate. Mention device models, firmware versions, and prerequisites that matter.",
          "Flag risky steps (resets, firmware flashing, changes that can cut connectivity) before the reader reaches them.",
          "Choose the right category and useful tags so readers can find your guide.",
        ],
      },
      {
        h: "What is not allowed",
        list: [
          "Guides that help break into networks, bypass authentication on devices you do not own, or intercept other people's traffic.",
          "Copied material from books, courses, or vendor documentation without permission.",
          "Spam, advertising, or repeated low-effort posts.",
          "Harassment, hate speech, or personal attacks in guides, comments, or quizzes.",
          "Malware, or instructions to deploy it.",
          "Personal or confidential data such as real IP plans, passwords, or customer information. Mask or replace them in examples.",
        ],
      },
      {
        h: "Security-related topics",
        p: [
          "Defensive topics such as hardening, firewall rules, VLAN segmentation, and monitoring are welcome. Educational content about attacks is allowed only when it focuses on understanding and defence, and states clearly that it is for use on your own lab.",
        ],
      },
      {
        h: "Quizzes and exams",
        p: [
          "Questions must be fair and have correct answers. Do not publish leaked exam content from certification providers.",
        ],
      },
      {
        h: "Reporting and enforcement",
        p: [
          `If you find content that breaks these rules, email ${CONTACT_EMAIL} with the link to the guide. We may edit, unpublish, or remove content, and may warn, suspend, or ban repeat offenders.`,
        ],
      },
      {
        h: "Copyright",
        p: [
          "If you believe your work was published without permission, send us the link and proof of ownership. We will review the request and remove infringing content.",
        ],
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Layout (publik, tanpa sidebar — bisa dibuka dari halaman login/register)
// ---------------------------------------------------------------------------
const LegalLayout = ({ page }) => {
  const Current = PAGES[page];

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <main className="mx-auto max-w-7xl p-0 md:!p-6">
        <nav aria-label="Legal pages" className="mb-4 flex flex-wrap gap-2">
          {Object.entries(PAGES).map(([key, item]) => {
            const Icon = item.icon;
            const active = key === page;
            return (
              <Link
                key={key}
                to={item.path}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition active:scale-[0.99] ${
                  active
                    ? "border-transparent bg-blue-600 text-white dark:bg-gradient-to-br dark:from-blue-400 dark:to-blue-100 dark:text-slate-900"
                    : "border-slate-400 bg-slate-200 text-gray-600 hover:bg-slate-300 dark:border-white/15 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                }`}
              >
                <Icon size={14} />
                {item.tab}
              </Link>
            );
          })}
        </nav>

        <article className="w-full rounded-2xl border border-slate-300 bg-slate-200 p-5 dark:border-white/10 dark:bg-white/5 md:p-5">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{Current.title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Last updated: {UPDATED}</p>
          <p className="mt-5 max-w-[90%] leading-relaxed text-slate-700 dark:text-gray-300">
            {Current.intro}
          </p>

          <div className="mt-8 space-y-8">
            {Current.sections.map((s) => (
              <section key={s.h}>
                <h2 className="text-lg font-semibold tracking-tight">{s.h}</h2>
                {s.p?.map((text, i) => (
                  <p
                    key={i}
                    className="mt-2 max-w-[90%] leading-relaxed text-slate-700 dark:text-gray-300"
                  >
                    {text}
                  </p>
                ))}
                {s.list && (
                  <ul className="mt-2 max-w-[90%] list-disc space-y-1.5 pl-5 leading-relaxed text-slate-700 dark:text-gray-300">
                    {s.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="mt-10 border-t border-slate-300 pt-5 text-sm text-slate-600 dark:border-white/10 dark:text-gray-400">
            Questions about this page? Email{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-blue-700 underline dark:text-blue-300"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </div>
        </article>
      </main>
    </div>
  );
};

export const TermsPage = () => <LegalLayout page="terms" />;
export const PrivacyPage = () => <LegalLayout page="privacy" />;
export const ContentPolicyPage = () => <LegalLayout page="policy" />;