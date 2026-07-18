import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How New Era Presentation handles participant data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="PRIVACY / TRUST BY DESIGN"
      title="Privacy Policy"
      updated="July 18, 2026"
      intro="New Era Presentation collects only the information needed to make a presentation participatory, memorable, and safe."
      sections={[
        {
          heading: "Information we collect",
          body: <p>We may collect a display name, email address, authentication provider, verification status, marketing consent, comments, questions, reactions, the slide associated with an interaction, and technical session identifiers.</p>,
        },
        {
          heading: "Guest participation",
          body: <p>Guests can participate without providing an email address. Guest comments and reactions are stored with the chosen display name and a technical visitor identifier, but they are not marked as verified.</p>,
        },
        {
          heading: "Verified participation",
          body: <p>Email, Google, and ChatGPT sign-in are used to verify identity and provide a personal presentation history. Google OAuth requests only <code>openid</code>, <code>email</code>, and <code>profile</code>. We do not receive or store your Google or ChatGPT password.</p>,
        },
        {
          heading: "How information is used",
          body: <p>Information is used to show live audience feedback, connect interactions to the relevant slide, provide the participant’s My Page, moderate the session, maintain access controls, and—only with opt-in—send presentation follow-up messages.</p>,
        },
        {
          heading: "Email and marketing",
          body: <p>Verification and campaign email is sent from <strong>newEraPresentation@lvnsk.jp</strong> through Cloudflare Email Service. Marketing messages are sent only to opted-in participants and include an unsubscribe mechanism. Service and security messages are separate from marketing consent.</p>,
        },
        {
          heading: "Storage and processors",
          body: <p>Application records are stored in ChatGPT Sites D1. Authentication and delivery may involve OpenAI, Google, and Cloudflare as service providers. Tokens used for sessions and email verification are stored as cryptographic hashes.</p>,
        },
        {
          heading: "Control and deletion",
          body: <p>Participants may unsubscribe using the link in a campaign email. Requests to access, correct, or delete personal information can be sent to the contact address below. Administrators may hide comments and manage participant records to keep the experience safe.</p>,
        },
        {
          heading: "Changes",
          body: <p>This policy may be updated as the product evolves. Material changes will be reflected by a new date on this page.</p>,
        },
      ]}
    />
  );
}
