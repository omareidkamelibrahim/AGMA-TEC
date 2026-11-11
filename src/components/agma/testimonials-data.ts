/**
 * Static fallback testimonials — anonymized by design (role + sector,
 * no invented names, companies or logos). The live list is DB-managed
 * (see src/lib/site-content.ts) and edited from the admin dashboard;
 * add named, verified quotes to the DB only when client approval exists.
 */
export const QUOTES = [
  {
    quote:
      "AGMA TEC didn't just deliver a platform — they restructured how our teams work. The roadmap was honest, the demos were on time, and the results showed up in our P&L within two quarters.",
    name: "Managing Director",
    org: "Regional retail group",
    initials: "MD",
  },
  {
    quote:
      "We had five disconnected systems and zero visibility. Six months later we run our entire operation from one dashboard. Their engineers felt like part of our own team.",
    name: "Chief Operating Officer",
    org: "Logistics provider",
    initials: "CO",
  },
  {
    quote:
      "The migration was flawless — zero unplanned downtime across all facilities. What impressed us most was the knowledge transfer; our staff now own the system completely.",
    name: "Head of IT",
    org: "Manufacturing group",
    initials: "HI",
  },
];

export type Quote = (typeof QUOTES)[number];
