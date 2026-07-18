import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms for participating in New Era Presentation.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="TERMS / PARTICIPATE WITH CARE"
      title="Terms of Use"
      updated="July 18, 2026"
      intro="By joining a New Era Presentation session, you agree to participate respectfully and to use the service only for its intended live and follow-up experience."
      sections={[
        {
          heading: "Acceptable participation",
          body: <p>Do not submit unlawful, abusive, harassing, deceptive, confidential, or rights-infringing content. Do not impersonate another person or attempt to disrupt the session or its infrastructure.</p>,
        },
        {
          heading: "Your contributions",
          body: <p>You retain ownership of your comments. You grant the service permission to display, store, moderate, and include them in the presentation experience and your personal history.</p>,
        },
        {
          heading: "Moderation",
          body: <p>The presentation administrator may hide or remove contributions and restrict participation when reasonably necessary for safety, relevance, legal compliance, or the integrity of the event.</p>,
        },
        {
          heading: "Accounts and verification",
          body: <p>You are responsible for the accounts you use to authenticate. A verified badge indicates that an email, Google, or ChatGPT identity completed the configured authentication flow; it is not an endorsement by the service.</p>,
        },
        {
          heading: "Availability",
          body: <p>The service is provided as an evolving Build Week project. Features may change, become unavailable, or contain errors. Do not rely on it for emergency, safety-critical, financial, legal, or medical communication.</p>,
        },
        {
          heading: "Liability",
          body: <p>To the maximum extent permitted by law, the service is provided “as is” without warranties. The operator is not liable for indirect, incidental, or consequential losses arising from use of the service.</p>,
        },
        {
          heading: "Changes and contact",
          body: <p>These terms may be updated as the product evolves. Continued use after an update means you accept the revised terms. Questions can be sent to the contact address below.</p>,
        },
      ]}
    />
  );
}
