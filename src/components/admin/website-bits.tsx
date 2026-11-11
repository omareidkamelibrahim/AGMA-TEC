"use client";

import { ICON_MAP, ICON_NAMES } from "@/lib/icon-map";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Icon picker over the curated allowlist (value = icon name). */
export function IconSelect({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (name: string) => void;
  id?: string;
}) {
  const Active = ICON_MAP[value] ?? ICON_MAP.Boxes;
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full bg-ink-900/60">
        <span className="flex items-center gap-2.5">
          <Active className="size-4 text-brand-accent" />
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent className="max-h-72 bg-ink-900">
        {ICON_NAMES.map((name) => {
          const Icon = ICON_MAP[name];
          return (
            <SelectItem key={name} value={name}>
              <span className="flex items-center gap-2.5">
                <Icon className="size-4 text-brand-accent" />
                {name}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

/** Published toggle with a live "on the site / hidden" label. */
export function PublishedSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-label="Published on website"
      />
      <Label asChild>
        <span
          className={cn(
            "text-[12px] font-medium",
            checked ? "text-emerald-500" : "text-muted-foreground",
          )}
        >
          {checked ? "Live on the site" : "Hidden from the site"}
        </span>
      </Label>
    </div>
  );
}

export const ACCENT_OPTIONS = [
  { value: "from-brand-600", label: "Deep brand (600)" },
  { value: "from-brand-400", label: "Bright brand (400)" },
  { value: "from-brand-300", label: "Light brand (300)" },
] as const;
