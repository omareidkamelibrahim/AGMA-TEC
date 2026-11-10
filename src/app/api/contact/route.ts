import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your full name").max(120),
  email: z.string().email("Please enter a valid email address").max(200),
  company: z.string().max(160).optional().or(z.literal("")),
  service: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(10, "Please tell us a bit more (min. 10 characters)").max(4000),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { ok: false, error: first?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, company, service, message } = parsed.data;

    await db.contactMessage.create({
      data: {
        name,
        email,
        company: company || null,
        service: service || null,
        message,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Thanks — our team will get back to you within one business day.",
    });
  } catch (err) {
    console.error("contact POST failed", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
