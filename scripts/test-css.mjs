import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { readFileSync, writeFileSync } from "fs";

const css = readFileSync("/home/z/my-project/src/app/globals.css", "utf8");
try {
  const result = await postcss([tailwindcss()]).process(css, {
    from: "/home/z/my-project/src/app/globals.css",
  });
  const out = result.css;
  writeFileSync("/tmp/tw-out.css", out);
  console.log("compiled OK, length:", out.length);
  console.log("has text-gradient:", out.includes("text-gradient"));
  console.log("has brand-500 token:", out.includes("--color-brand-500"));
  console.log("has marquee keyframes:", out.includes("@keyframes marquee"));
} catch (e) {
  console.error("COMPILE FAILED:", e.message);
  if (e.source) console.error("line:", e.line, "column:", e.column);
}
