import type { Metadata } from "next";
import { PageHero } from "@/components/agma/page-hero";
import { Contact } from "@/components/agma/contact";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the AGMA TEC team — tell us about your organization and your goals, and we'll get back to you within one business day.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title={
          <>
            Let&apos;s Start the{" "}
            <span className="text-gradient">Conversation.</span>
          </>
        }
        description="Tell us about your organization and your goals — our team will get back to you within one business day."
      />
      <Contact heading={false} />
    </>
  );
}
