import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Check, Copy, Link as LinkIcon } from "@/app/lib/lucide-icons";

// Small field-demo building blocks shared by the Form Controls / Textarea /
// Date Picker / OTP / Dropdown showcases: a form-field label (the app's
// existing .slds-form-label token class, already used by DialogSection.tsx)
// with an optional required asterisk and a de-emphasized note suffix; a
// size/variant caption line above a demo; and a field-level error message.
// Centralizing these once means every "N states x 2 sizes" gallery renders
// real Label/`<p>` elements with consistent classNames instead of each
// section re-typing the same inline style object per row.
// FieldLabel / ErrorMessage now live in the shared ui layer (ui/field.tsx)
// so product forms use the same implementation documented here.
export {
  FieldLabel,
  FieldError as ErrorMessage,
} from "../../ui/field";

export function SizeCaption({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="mb-1 text-[length:var(--slds-g-font-size-1)] text-[var(--slds-g-color-text-weak)]">
      {children}
    </p>
  );
}

/**
 * PatternFilterContext
 * Consumed by ShowcaseCard (and AlertRow in ComponentsTabContent) to
 * hide themselves when the active filter string doesn't match their id.
 * ComponentsTabContent is the Provider owner; the string is the current
 * search/filter query (empty = show all).
 */
export const PatternFilterContext =
  React.createContext<string>("");

/**
 * PatternSection
 * Wraps an entire section (header + cards). When a filter is active it
 * hides itself unless the filter text starts with one of the given
 * prefixes — so "BRD-01" keeps the Breadcrumbs section visible while
 * every other section collapses to nothing.
 * Pass the same ID prefixes used in the ShowcaseCards inside (e.g. "BRD").
 */
export function PatternSection({
  prefixes,
  children,
}: {
  prefixes: string[];
  children: React.ReactNode;
}) {
  const filter = useContext(PatternFilterContext);
  if (
    filter &&
    !prefixes.some((p) =>
      filter.toUpperCase().startsWith(p.toUpperCase()),
    )
  ) {
    return null;
  }
  return <>{children}</>;
}

const BASE_URL = "https://mchdemo01.figma.site/design-tokens";

function clipboardWrite(text: string) {
  const fallback = () => {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  };
  (
    navigator.clipboard?.writeText(text) ?? Promise.reject()
  ).catch(fallback);
}

/**
 * CopyCSSBtn
 * Standalone per-item CSS copy button. Wrap a parent with group/item to
 * control visibility: className="opacity-0 group-hover/item:opacity-100 transition-opacity"
 */
export function CopyCSSBtn({
  css,
  label,
  className,
}: {
  css: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  function copy() {
    clipboardWrite(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] font-medium leading-[1.4] transition-all ${
        copied
          ? "bg-[#145f33] border-[#145f33] text-white"
          : "bg-white border-[#dddbda] text-[#706e6b]"
      } ${className ?? ""}`}
      title="Copy CSS for this item"
      type="button"
    >
      {copied ? (
        <Check className="h-2.5 w-2.5 flex-shrink-0" />
      ) : (
        <Copy className="h-2.5 w-2.5 flex-shrink-0" />
      )}
      {copied ? "Copied!" : (label ?? "Copy CSS")}
    </button>
  );
}

/**
 * usePatternAnchor
 * -----------------------------------------------------------------------
 * Shared logic behind every ID badge / Copy ID / Copy CSS / deep-link /
 * pulse-highlight behavior on the Component Patterns page. `ShowcaseCard`
 * uses this internally, but a handful of sections (e.g. the Alerts list,
 * which renders via `.map()` instead of individual ShowcaseCards) don't
 * go through ShowcaseCard at all — this hook lets those sections get the
 * exact same ID/copy/deep-link/pulse behavior without duplicating the
 * logic or forcing a layout change onto sections that don't use cards.
 * -----------------------------------------------------------------------
 */
export function usePatternAnchor(id?: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [pulsing, setPulsing] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const [cssCopied, setCssCopied] = useState(false);

  // Scroll into view + pulse when this card is the active filter target.
  // Works for both query-param (?pattern=) and same-page navigation.
  const filter = useContext(PatternFilterContext);
  useEffect(() => {
    if (!id || !filter) return;
    if (id.toUpperCase() !== filter.toUpperCase()) return;
    const timer = setTimeout(() => {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setPulsing(true);
      setTimeout(() => setPulsing(false), 1300);
    }, 80);
    return () => clearTimeout(timer);
  }, [id, filter]);

  function copyText(text: string, onDone: () => void) {
    const fallback = () => {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    };
    (
      navigator.clipboard?.writeText(text) ?? Promise.reject()
    ).catch(fallback);
    onDone();
  }

  function copyId() {
    if (!id) return;
    copyText(`${BASE_URL}?pattern=${id}`, () => {
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 1500);
    });
  }

  function copyCss(cssCode?: string) {
    if (!cssCode) return;
    copyText(cssCode, () => {
      setCssCopied(true);
      setTimeout(() => setCssCopied(false), 1500);
    });
  }

  return { ref, pulsing, idCopied, cssCopied, copyId, copyCss };
}

/**
 * PatternIdBadge
 * -----------------------------------------------------------------------
 * The small green ID pill + Copy ID + (optional) Copy CSS button cluster,
 * factored out so non-ShowcaseCard sections can render the identical
 * control without reimplementing the markup.
 * -----------------------------------------------------------------------
 */
export function PatternIdBadge({
  id,
  idCopied,
  cssCopied,
  onCopyId,
  onCopyCss,
  cssCode,
}: {
  id: string;
  idCopied: boolean;
  cssCopied: boolean;
  onCopyId: () => void;
  onCopyCss: () => void;
  cssCode?: string;
}) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <span className="whitespace-nowrap rounded bg-[#145f33] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.02em] text-white">
        {id}
      </span>
      <button
        onClick={onCopyId}
        className="p-1 rounded hover:bg-[#f3f2f2] transition-colors"
        title="Copy link to this pattern"
        type="button"
      >
        {idCopied ? (
          <Check className="h-3.5 w-3.5 text-[#145f33]" />
        ) : (
          <LinkIcon className="h-3.5 w-3.5 text-[#706e6b]" />
        )}
      </button>
      {cssCode && (
        <button
          onClick={onCopyCss}
          className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium transition-colors ${
            cssCopied
              ? "bg-[#145f33] border-[#145f33] text-white"
              : "bg-white border-[#dddbda] text-[#212529]"
          }`}
          title="Copy CSS"
          type="button"
        >
          {cssCopied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy CSS
            </>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * ShowcaseCard
 * -----------------------------------------------------------------------
 * Shared wrapper for every pattern card on the Component Patterns page.
 *
 * Adds, centrally, for every card that passes an `id`:
 *  - A unique ID badge (e.g. "ACC-01") for referencing this exact card
 *    in Slack, Figma comments, PRs, etc.
 *  - A "Copy ID" button (copies the plain id string, not a URL).
 *  - A "Copy CSS" button (only rendered when `cssCode` is supplied) —
 *    copies the raw, resolved CSS for the pattern's own structural
 *    elements (container/header/footer/etc.), NOT for whatever
 *    consumer-supplied content (buttons, icons, text) happens to be
 *    rendered inside the pattern in this particular demo.
 *  - Deep-link support: visiting the page with `#ACC-01` in the URL
 *    will scroll this exact card into view and trigger a brief pulse
 *    highlight so it's unambiguous which card was linked, even when
 *    several similar-looking cards are on screen at once.
 *
 * `id` is intentionally optional during the incremental rollout across
 * all pattern sections — cards that haven't been converted yet simply
 * render without the badge/buttons/deep-link behavior. Once every call
 * site has been converted, `id` should be made required.
 * -----------------------------------------------------------------------
 */

export function ShowcaseCard({
  id,
  title,
  description,
  children,
  note,
  cssCode,
}: {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  note?: string;
  cssCode?: string;
}) {
  const filter = useContext(PatternFilterContext);
  const { ref, pulsing, idCopied, cssCopied, copyId, copyCss } =
    usePatternAnchor(id);

  if (
    filter &&
    id &&
    !id.toUpperCase().includes(filter.toUpperCase())
  ) {
    return null;
  }

  return (
    <div
      ref={ref}
      id={id}
      className={`scroll-mt-6 rounded-lg border border-[var(--slds-g-color-border-base-1)] bg-white p-4 group${
        pulsing ? " showcase-card-pulse" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-1">
        <h4 className="text-[13px] font-medium text-[#706e6b]">
          {title}
        </h4>
        {id && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
            <PatternIdBadge
              id={id}
              idCopied={idCopied}
              cssCopied={cssCopied}
              onCopyId={copyId}
              onCopyCss={() => copyCss(cssCode)}
              cssCode={cssCode}
            />
          </div>
        )}
      </div>

      {description && (
        <p className="mb-3 text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
          {description}
        </p>
      )}

      <div className="mt-3">{children}</div>

      {note && (
        <p className="mt-3 text-[length:var(--slds-g-font-size-2)] italic text-[var(--slds-g-color-text-weak)]">
          {note}
        </p>
      )}
    </div>
  );
}