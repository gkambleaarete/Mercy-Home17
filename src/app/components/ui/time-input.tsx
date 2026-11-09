import { useState } from "react";
import { Input } from "./input";
import { cn } from "./utils";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  id?: string;
  /** Emitted value format. "12h" (default) emits "h:mm AM/PM"; "24h" emits
   *  "HH:mm" for forms whose stored value is a 24-hour string. Display is
   *  always 12-hour and either format is accepted as `value`. */
  format?: "12h" | "24h";
  disabled?: boolean;
  /** Forwarded to Input; "base" renders the white page surface. */
  surface?: React.ComponentProps<typeof Input>["surface"];
  /** Additive, optional accessibility/validation state for the Input. */
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
}

export type TimeParse =
  | { status: "ok"; value: string }
  /** Valid clock time but no AM/PM given (e.g. "4:30"): the user must choose.
   *  Never guessed from the current time of day. */
  | { status: "ambiguous"; hour: number; minute: number }
  | { status: "invalid" }
  | { status: "empty" };

const fmt12 = (h: number, m: number, ap: "AM" | "PM") =>
  `${h}:${m.toString().padStart(2, "0")} ${ap}`;

/**
 * Deterministic time parser: identical input always gives identical output,
 * independent of the current time. Accepts "h:mm AM/PM" (also "4pm",
 * "430p"), and unambiguous 24-hour entries ("14", "14:30", "1430", "00:15").
 * Entries with no AM/PM whose hour is 1-12 are "ambiguous".
 */
export function parseTimeDetailed(input: string): TimeParse {
  if (!input.trim()) return { status: "empty" };
  const upper = input.toUpperCase().trim();

  // Already formatted: "4:00 PM", "12:30 AM"
  const formatted = upper.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (formatted) {
    const h = parseInt(formatted[1]);
    const m = parseInt(formatted[2]);
    if (h >= 1 && h <= 12 && m >= 0 && m <= 59)
      return { status: "ok", value: fmt12(h, m, formatted[3] as "AM" | "PM") };
    return { status: "invalid" };
  }

  // 24-hour entries: "14", "14:30", "0:15", "00:15" (no AM/PM suffix).
  const h24 = upper.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (h24 && (h24[2] !== undefined || h24[1].length === 2)) {
    const h = parseInt(h24[1]);
    const m = h24[2] !== undefined ? parseInt(h24[2]) : 0;
    if ((h === 0 || h >= 13) && h <= 23 && m >= 0 && m <= 59)
      return { status: "ok", value: fmt12(h % 12 === 0 ? 12 : h % 12, m, h >= 12 ? "PM" : "AM") };
  }

  // Explicit AM/PM suffix
  let explicit: "AM" | "PM" | null = null;
  if (upper.endsWith("PM") || upper.endsWith("P")) explicit = "PM";
  else if (upper.endsWith("AM") || upper.endsWith("A")) explicit = "AM";

  const digits = input.replace(/\D/g, "");
  if (!digits) return { status: "invalid" };

  let hours: number, minutes: number;
  switch (digits.length) {
    case 1:
      hours = parseInt(digits);
      minutes = 0;
      break;
    case 2:
      hours = parseInt(digits);
      minutes = 0;
      break;
    case 3:
      // "430" → 4:30, "915" → 9:15
      hours = parseInt(digits[0]);
      minutes = parseInt(digits.slice(1));
      break;
    case 4:
      hours = parseInt(digits.slice(0, 2));
      minutes = parseInt(digits.slice(2, 4));
      // "1430" → 2:30 PM, "0015" → 12:15 AM (24-hour, unambiguous)
      if (!explicit && (hours === 0 || hours >= 13) && hours <= 23 && minutes <= 59)
        return { status: "ok", value: fmt12(hours % 12 === 0 ? 12 : hours % 12, minutes, hours >= 12 ? "PM" : "AM") };
      break;
    default:
      return { status: "invalid" };
  }

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59)
    return { status: "invalid" };
  if (explicit) return { status: "ok", value: fmt12(hours, minutes, explicit) };
  return { status: "ambiguous", hour: hours, minute: minutes };
}

// Exported standalone parser: the normalized "h:mm AM/PM" string, or null
// when the input is empty, invalid, or still needs an AM/PM choice.
export function parseTimeInput(input: string): string | null {
  const r = parseTimeDetailed(input);
  return r.status === "ok" ? r.value : null;
}

// "h:mm AM/PM" (as returned by parseTimeInput) → zero-padded 24-hour "HH:mm".
function to24Hour(time12: string): string {
  const m = time12.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/);
  if (!m) return time12;
  let h = parseInt(m[1]);
  if (m[3] === "PM" && h !== 12) h += 12;
  if (m[3] === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

// Convert a 24-hour "HH:MM" value to "H:MM AM/PM" for display.
// Values already containing AM/PM are returned unchanged.
function to12Hour(val: string): string {
  if (!val || val.includes("AM") || val.includes("PM"))
    return val;
  const match = val.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return val;
  let h = parseInt(match[1]);
  const m = match[2];
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${ampm}`;
}

export function TimeInput({
  value,
  onChange,
  className,
  style,
  placeholder = "",
  id,
  format = "12h",
  disabled,
  surface,
  ...aria
}: TimeInputProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  // Text the user typed that is not a valid time. It stays visible with an
  // inline explanation instead of silently reverting to the old value.
  const [invalidText, setInvalidText] = useState<string | null>(null);
  // Typed time that needs an explicit AM/PM choice.
  const [pending, setPending] = useState<{ hour: number; minute: number } | null>(null);
  const messageId = `${id ?? "time-input"}-error`;

  const displayValue = editing
    ? draft
    : invalidText !== null
      ? invalidText
      : to12Hour(value ?? "");

  const handleFocus = () => {
    setEditing(true);
    setDraft(invalidText ?? to12Hour(value ?? ""));
  };

  const commit = (parsed: string) =>
    onChange(format === "24h" ? to24Hour(parsed) : parsed);

  const handleBlur = () => {
    setEditing(false);
    const r = parseTimeDetailed(draft);
    if (r.status === "ok") commit(r.value);
    else if (r.status === "empty") onChange("");
    else if (r.status === "ambiguous") {
      setInvalidText(draft);
      setPending({ hour: r.hour, minute: r.minute });
    } else setInvalidText(draft);
  };

  const choose = (ap: "AM" | "PM") => {
    if (!pending) return;
    commit(fmt12(pending.hour, pending.minute, ap));
    setPending(null);
    setInvalidText(null);
  };

  const invalid = invalidText !== null;
  const input = (
    <Input
      id={id}
      type="text"
      value={displayValue}
      onChange={(e) => {
        setDraft(e.target.value);
        setInvalidText(null);
        setPending(null);
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn("h-9 slds-text-4", className)}
      style={style}
      surface={surface}
      disabled={disabled}
      placeholder={placeholder}
      {...aria}
      aria-invalid={invalid || aria["aria-invalid"] || undefined}
      aria-describedby={
        invalid
          ? [aria["aria-describedby"], messageId].filter(Boolean).join(" ")
          : aria["aria-describedby"]
      }
    />
  );
  // The input stays at a fixed position in the tree so it keeps focus while
  // the message appears and disappears.
  return (
    <>
      {input}
      {invalid && (
        <p
          id={messageId}
          role="alert"
          className="mt-1 text-xs flex flex-wrap items-center gap-2"
          style={{ color: "var(--slds-g-color-error-base-50)" }}
        >
          {pending ? (
            <>
              <span>
                Is {pending.hour}:{pending.minute.toString().padStart(2, "0")} AM or PM?
              </span>
              {(["AM", "PM"] as const).map((ap) => (
                <button
                  key={ap}
                  type="button"
                  onClick={() => choose(ap)}
                  className="rounded border px-2 py-0.5 text-xs font-medium bg-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  style={{
                    borderColor: "var(--slds-g-color-border-base-2)",
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  {ap}
                </button>
              ))}
            </>
          ) : (
            "Enter a time like 2:30 PM or 14:30."
          )}
        </p>
      )}
    </>
  );
}
