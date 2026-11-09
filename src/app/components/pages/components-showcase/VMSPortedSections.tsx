import { useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  PenLine,
  Type as TypeIcon,
  RotateCcw,
  Check,
  ChevronDown,
  Users,
  Calendar,
  Clock,
  MapPin,
} from "@/app/lib/lucide-icons";
import { ShowcaseCard, PatternSection, FieldLabel } from "./ShowcaseCard";
import { Button } from "../../ui/button";
import { StarRating } from "../../ui/star-rating";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { Checkbox } from "../../ui/checkbox";
import { cn } from "../../ui/utils";
import { Textarea } from "../../ui/textarea";
import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Progress } from "../../ui/progress";

/* ────────────────────────────────────────────────────────────────────────
 * Shared local primitives (kept private to this file — mirrors the
 * `.btn` pill convention already established in componentsCssRegistry.ts)
 * ──────────────────────────────────────────────────────────────────────── */

function PillBtn({
  children,
  variant = "primary",
  onClick,
  disabled,
  size = "md",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const bg =
    variant === "primary" ? "#145F33" : variant === "danger" ? "#c23934" : "#ffffff";
  const color = variant === "secondary" ? "#3e3e3c" : "#ffffff";
  const border =
    variant === "secondary" ? "1px solid #dddbda" : "1px solid transparent";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 font-medium transition-colors"
      style={{
        height: size === "sm" ? 28 : 36,
        padding: size === "sm" ? "0 12px" : "0 16px",
        borderRadius: 9999,
        fontSize: size === "sm" ? 12 : 13,
        backgroundColor: disabled ? "#f3f2f2" : bg,
        color: disabled ? "#c9c7c5" : color,
        border: disabled ? "1px solid #dddbda" : border,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * 2. STAR RATING SELECTOR  (prefix: RTG)
 * ──────────────────────────────────────────────────────────────────────── */

export function StarRatingSection() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <PatternSection prefixes={["RTG"]}>
      <div id="sec-star-rating">
        <h3 className="slds-section-title mb-2">Star Rating Selector</h3>
        <p className="mb-4 text-[12px] text-[#706e6b]">
          Used for reference/questionnaire-style scoring. Amber accent
          keeps it visually distinct from brand-green primary actions.
        </p>

        <div className="flex flex-col gap-4">
          <ShowcaseCard
            id="RTG-01"
            title="Interactive — for scoring in a form"
            description="Click to set. Hover previews the value before committing."
            cssCode={`.star-rating { display: flex; align-items: center; gap: 4px; }\n.star-rating__btn { background: none; border: none; padding: 0; cursor: pointer; line-height: 0; }\n.star-rating__icon { width: 20px; height: 20px; color: #dddbda; }\n.star-rating__icon--filled { color: #b28500; fill: #b28500; }`}
          >
            <div className="flex items-center gap-3">
              <StarRating value={hover || rating} onHover={setHover} onSelect={setRating} />
              <span className="text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">
                {rating ? `${rating} of 5` : "Not rated yet"}
              </span>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="RTG-02"
            title="Read-only — for display in a list or record"
            description="Non-interactive, paired with a numeric average and count."
            cssCode={`.star-rating--readonly .star-rating__icon { cursor: default; }\n.star-rating__summary { font-size: 12px; color: #706e6b; margin-left: 6px; }`}
          >
            <div className="flex items-center gap-2">
              <StarRating value={4} size={16} readOnly />
              <span className="text-[length:var(--slds-g-font-size-3)] text-[var(--slds-g-color-text-weak)]">4.0 avg · 3 references</span>
            </div>
          </ShowcaseCard>
        </div>
      </div>
    </PatternSection>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * 4. MASKED SSN FIELD  (prefix: SSN)
 * ──────────────────────────────────────────────────────────────────────── */

export function SSNFieldSection() {
  const [ssn, setSsn] = useState("");
  const [revealed, setRevealed] = useState(false);
  const storedValue = "485-22-9876";

  return (
    <PatternSection prefixes={["SSN"]}>
      <div id="sec-ssn-field">
        <h3 className="slds-section-title mb-2">Masked SSN Field</h3>
        <p className="mb-4 text-[12px] text-[#706e6b]">
          Two distinct states: a masked entry field when a volunteer is
          typing it in, and a reveal/hide toggle when staff view it on a
          saved record.
        </p>

        <div className="flex flex-col gap-4">
          <ShowcaseCard
            id="SSN-01"
            title="Entry — form input"
            description="Masks input as it's typed, like a password field. Optional field, so labeled as such."
            cssCode={`.form-label { display: block; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: #706e6b; margin-bottom: 4px; }\n.ssn-input { width: 100%; height: 36px; padding: 0 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #ffffff; }\n.ssn-input:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.15); outline: none; }\n.ssn-help { font-size: 11px; color: #706e6b; margin-top: 4px; }`}
          >
            <div className="max-w-[260px]">
              <FieldLabel>Social Security Number (optional)</FieldLabel>
              <Input
                type="password"
                size="md"
                value={ssn}
                onChange={(e) => setSsn(e.target.value)}
                placeholder="XXX-XX-XXXX"
                className="w-full"
              />
              <p className="mt-1 text-[length:var(--slds-g-font-size-2)] text-[var(--slds-g-color-text-weak)]">
                Used only for background check verification. Encrypted at rest.
              </p>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="SSN-02"
            title="Display — reveal / hide"
            description="Default masked, staff can reveal on demand. Access should be logged server-side."
            cssCode={`.ssn-display { display: flex; align-items: center; gap: 8px; font-size: 13px; }\n.ssn-display__toggle { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 4px; background: none; border: none; cursor: pointer; color: #706e6b; }\n.ssn-display__toggle:hover { background-color: #f3f2f2; }\n.ssn-display__badge { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 9999px; background-color: #fce4ec; color: #A82031; }`}
          >
            <div>
              <div className="slds-form-label mb-1 text-[var(--slds-g-color-text-weak)]">
                Social Security Number
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[length:var(--slds-g-font-size-4)] font-mono">
                  {revealed ? storedValue : storedValue.replace(/\d/g, "•")}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setRevealed((r) => !r)}
                  className="text-[var(--slds-g-color-text-weak)]"
                  title={revealed ? "Hide SSN" : "Reveal SSN"}
                >
                  {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
                {revealed && <Badge variant="error">Visible — click to hide</Badge>}
              </div>
            </div>
          </ShowcaseCard>
        </div>
      </div>
    </PatternSection>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * 5. DOCUMENT AGREEMENT BLOCK  (prefix: DOC)
 * ──────────────────────────────────────────────────────────────────────── */

export function DocumentAgreementSection() {
  const [agreed, setAgreed] = useState(false);

  return (
    <PatternSection prefixes={["DOC"]}>
      <div id="sec-document-agreement">
        <h3 className="slds-section-title mb-2">Document Agreement Block</h3>
        <p className="mb-4 text-[12px] text-[#706e6b]">
          Scrollable legal/policy text paired with an explicit agreement
          action. Two pieces: the reading panel, and the action bar that
          gates progress on it.
        </p>

        <div className="flex flex-col gap-4">
          <ShowcaseCard
            id="DOC-01"
            title="Scrollable document panel"
            description="Fixed-height panel with internal scroll — keeps the surrounding form layout stable regardless of document length."
            cssCode={`.doc-panel { max-height: 160px; overflow-y: auto; padding: 14px 16px; border: 1px solid #dddbda; border-radius: 8px; background-color: #fafaf9; font-size: 12px; line-height: 1.6; color: #3e3e3c; }`}
          >
            <div className="max-h-[160px] overflow-y-auto rounded-lg border border-[#dddbda] bg-[#fafaf9] p-3.5 text-[12px] leading-[1.6] text-[#3e3e3c]">
              <p className="mb-2.5">
                <strong>Client Confidentiality Agreement.</strong> As a
                volunteer with Mercy Home for Boys &amp; Girls, you will
                have access to sensitive information regarding the
                youth, families, and staff we serve...
              </p>
              <p className="mb-2.5">
                You agree not to disclose any identifying information,
                case details, or personal circumstances of any youth
                outside of your official volunteer duties...
              </p>
              <p>
                This agreement remains in effect for the duration of
                your volunteer service and beyond, in accordance with
                applicable state and federal confidentiality law.
              </p>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="DOC-02"
            title="Agreement action bar"
            description="Continue stays disabled until the checkbox is checked (in production, also gated on scroll-to-bottom of the panel above)."
            cssCode={`.doc-agree-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-top: 12px; border-top: 1px solid #ecebea; }\n.doc-agree-checkbox { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: #3e3e3c; }\n.doc-agree-checkbox input { margin-top: 2px; accent-color: #145F33; }`}
          >
            <div className="flex items-center justify-between gap-4 border-t border-[#ecebea] pt-3">
              <label className="flex items-start gap-2 text-xs text-[#3e3e3c] cursor-pointer">
                <Checkbox
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked === true)}
                  className="mt-0.5"
                />
                I have read and agree to the Client Confidentiality Agreement
              </label>
              <Button disabled={!agreed} className="text-[length:var(--slds-g-font-size-4)]">
                Continue to Signature
              </Button>
            </div>
          </ShowcaseCard>
        </div>
      </div>
    </PatternSection>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * 7. E-SIGNATURE PAD  (prefix: SIG)
 * ──────────────────────────────────────────────────────────────────────── */

function DrawCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  function pos(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  function start(e: React.MouseEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function move(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e);
    ctx.strokeStyle = "#145F33";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  }
  function end() {
    drawing.current = false;
  }
  function clear() {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    setHasDrawn(false);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={320}
        height={110}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        className="w-full max-w-[320px] h-[110px] border border-dashed border-[#c9c7c5] rounded-lg bg-[#fafaf9] cursor-crosshair"
      />
      <div className="flex items-center justify-between mt-2 max-w-[320px]">
        <span className="text-[11px] text-[#706e6b]">Sign above using your mouse or trackpad</span>
        <button
          type="button"
          onClick={clear}
          disabled={!hasDrawn}
          className={cn(
            "flex items-center gap-1 text-[11px] bg-transparent border-0",
            hasDrawn ? "text-[#706e6b] cursor-pointer" : "text-[#c9c7c5] cursor-not-allowed",
          )}
        >
          <RotateCcw className="h-3 w-3" /> Clear
        </button>
      </div>
    </div>
  );
}

export function SignaturePadSection() {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");

  return (
    <PatternSection prefixes={["SIG"]}>
      <div id="sec-signature-pad">
        <h3 className="slds-section-title mb-2">E-Signature Pad</h3>
        <p className="mb-4 text-[12px] text-[#706e6b]">
          Three states: the input pad (draw or type), and the locked
          confirmation view once signed.
        </p>

        <div className="flex flex-col gap-4">
          <ShowcaseCard
            id="SIG-01"
            title="Draw mode"
            description="A live canvas — click and drag to sign."
            cssCode={`.sig-mode-toggle { display: inline-flex; border: 1px solid #dddbda; border-radius: 8px; overflow: hidden; }\n.sig-mode-toggle button { padding: 6px 14px; font-size: 12px; font-weight: 500; background-color: #ffffff; color: #706e6b; border: none; cursor: pointer; }\n.sig-mode-toggle button.active { background-color: #145F33; color: #ffffff; }\n.sig-canvas { width: 100%; max-width: 320px; height: 110px; border: 1px dashed #c9c7c5; border-radius: 8px; background-color: #fafaf9; cursor: crosshair; }`}
          >
            <div>
              <div className="inline-flex border border-[#dddbda] rounded-lg overflow-hidden mb-3">
                <button
                  type="button"
                  onClick={() => setMode("draw")}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-medium border-0",
                    mode === "draw" ? "bg-[var(--color-brand-primary)] text-white" : "bg-white text-[#706e6b]",
                  )}
                >
                  <PenLine className="h-3 w-3 inline mr-1" /> Draw
                </button>
                <button
                  type="button"
                  onClick={() => setMode("type")}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-medium border-0",
                    mode === "type" ? "bg-[var(--color-brand-primary)] text-white" : "bg-white text-[#706e6b]",
                  )}
                >
                  <TypeIcon className="h-3 w-3 inline mr-1" /> Type
                </button>
              </div>
              {mode === "draw" ? (
                <DrawCanvas />
              ) : (
                <div className="max-w-[320px]">
                  <Input
                    size="md"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="Type your full legal name"
                    className="w-full mb-2"
                  />
                  <div className="h-[60px] border border-dashed border-[#c9c7c5] rounded-lg bg-[#fafaf9] flex items-center justify-center">
                    <span
                      className="text-[26px] text-[var(--color-brand-primary)]"
                      style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive" }}
                    >
                      {typedName || "Your signature preview"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="SIG-02"
            title="Signed — locked state"
            description="Once submitted, the pad becomes read-only with an audit line."
            cssCode={`.sig-locked { width: 100%; max-width: 320px; padding: 14px; border: 1px solid #a8d5b8; border-radius: 8px; background-color: #f4faf6; }\n.sig-locked__mark { font-family: 'Segoe Script', 'Brush Script MT', cursive; font-size: 24px; color: #145F33; }\n.sig-locked__meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #706e6b; margin-top: 8px; }\n.sig-locked__reset { font-size: 11px; color: #706e6b; text-decoration: underline; background: none; border: none; cursor: pointer; }`}
          >
            <div className="w-full max-w-[320px] p-3.5 border border-[#a8d5b8] rounded-lg bg-[#f4faf6]">
              <span
                className="text-2xl text-[var(--color-brand-primary)]"
                style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive" }}
              >
                Amara Osei
              </span>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[#706e6b]">
                  <Check className="h-3 w-3 text-[var(--color-brand-primary)]" />
                  Signed May 27, 2026 at 4:12 PM
                </div>
                <button type="button" className="text-[11px] text-[#706e6b] underline bg-transparent border-0 cursor-pointer">
                  Clear &amp; re-sign
                </button>
              </div>
            </div>
          </ShowcaseCard>
        </div>
      </div>
    </PatternSection>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * 9. MENTOR SEARCH, MATCH & ACTIVITY  (prefix: MTR)
 * ──────────────────────────────────────────────────────────────────────── */

export function MentorMatchSection() {
  const [logMode, setLogMode] = useState<"cb" | "wbsb">("cb");

  return (
    <PatternSection prefixes={["MTR"]}>
      <div id="sec-mentor-match">
        <h3 className="slds-section-title mb-2">Mentor Search, Match &amp; Activity</h3>
        <p className="mb-4 text-[12px] text-[#706e6b]">
          The mentorship-specific pattern family: finding a mentor,
          proposing a pairing, and logging session activity against it.
        </p>

        <div className="flex flex-col gap-4">
          <ShowcaseCard
            id="MTR-01"
            title="Mentor search result"
            description="A row in the mentor directory."
            cssCode={`.mentor-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid #dddbda; border-radius: 8px; background: #ffffff; }\n.mentor-row__avatar { width: 36px; height: 36px; border-radius: 9999px; background-color: #145F33; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }\n.mentor-row__name { font-size: 13px; font-weight: 600; color: #080707; }\n.mentor-row__meta { font-size: 11px; color: #706e6b; display: flex; align-items: center; gap: 10px; margin-top: 2px; }`}
          >
            <div className="flex items-center gap-3 p-3 border border-[#dddbda] rounded-lg max-w-[420px]">
              <Avatar size="sm">
                <AvatarFallback size="sm" color="primary">CE</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-[#080707]">Carlos Espinoza</div>
                <div className="flex items-center gap-3 text-[11px] text-[#706e6b] mt-0.5">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Senior Mentor</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 8+ hrs/mo</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Southside Branch</span>
                </div>
              </div>
              <PillBtn variant="secondary" size="sm">View Profile</PillBtn>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="MTR-02"
            title="Match suggestion card"
            description="Compatibility score plus shared attributes, for proposing a mentor/mentee pairing."
            cssCode={`.match-card { width: 320px; padding: 14px; border: 1px solid #dddbda; border-radius: 8px; background: #ffffff; }\n.match-card__score-track { height: 6px; border-radius: 9999px; background-color: #ecebea; overflow: hidden; margin: 8px 0; }\n.match-card__score-fill { height: 100%; background-color: #145F33; border-radius: 9999px; }\n.match-card__tag { font-size: 11px; padding: 2px 8px; border-radius: 9999px; background-color: #f3f2f2; color: #706e6b; }`}
          >
            <div className="w-[320px] p-3.5 border border-[#dddbda] rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#080707]">Carlos Espinoza ↔ Jaylen R.</span>
                <span className="text-xs font-bold text-[var(--color-brand-primary)]">87%</span>
              </div>
              <Progress value={87} tone="primary" trackTone="neutral" className="my-2" />
              <div className="flex flex-wrap gap-1.5 mb-3">
                {["Same campus", "Weekend availability", "Sports interest"].map((t) => (
                  <Badge key={t} variant="neutral">{t}</Badge>
                ))}
              </div>
              <PillBtn variant="primary" size="sm">Propose Match</PillBtn>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="MTR-03"
            title="Activity log — CB vs WB/SB"
            description="Community-Based mentors log a single activity entry; Work/School-Based mentors log recurring sessions in a grid instead."
            cssCode={`.activity-toggle { display: inline-flex; border: 1px solid #dddbda; border-radius: 8px; overflow: hidden; margin-bottom: 12px; }\n.activity-toggle button { padding: 6px 14px; font-size: 12px; font-weight: 500; background-color: #ffffff; color: #706e6b; border: none; cursor: pointer; }\n.activity-toggle button.active { background-color: #145F33; color: #ffffff; }\n.attendance-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #ecebea; font-size: 12px; }\n.attendance-pill { font-size: 11px; padding: 2px 10px; border-radius: 9999px; font-weight: 500; }\n.attendance-pill--present { background-color: #e6f4ea; color: #145F33; }\n.attendance-pill--absent { background-color: #fce4ec; color: #A82031; }`}
          >
            <div>
              <div className="inline-flex border border-[#dddbda] rounded-lg overflow-hidden mb-3">
                <button
                  type="button"
                  onClick={() => setLogMode("cb")}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-medium border-0",
                    logMode === "cb" ? "bg-[var(--color-brand-primary)] text-white" : "bg-white text-[#706e6b]",
                  )}
                >
                  CB — Single Entry
                </button>
                <button
                  type="button"
                  onClick={() => setLogMode("wbsb")}
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-medium border-0",
                    logMode === "wbsb" ? "bg-[var(--color-brand-primary)] text-white" : "bg-white text-[#706e6b]",
                  )}
                >
                  WB/SB — Attendance Grid
                </button>
              </div>

              {logMode === "cb" ? (
                <div className="max-w-[320px] p-3.5 border border-[#dddbda] rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-[#3e3e3c] mb-2">
                    <Calendar className="h-3.5 w-3.5 text-[#706e6b]" /> May 27, 2026 · 90 min
                  </div>
                  <Textarea
                    rows={2}
                    placeholder="What did you work on this session?"
                    size="sm"
                  />
                </div>
              ) : (
                <div className="max-w-[320px] p-3.5 border border-[#dddbda] rounded-lg">
                  <div className="text-[11px] text-[#706e6b] mb-1.5">3 present · 1 absent · 4 total sessions</div>
                  {[
                    { date: "May 5", status: "present" },
                    { date: "May 12", status: "present" },
                    { date: "May 19", status: "absent" },
                    { date: "May 26", status: "present" },
                  ].map((row) => (
                    <div key={row.date} className="flex items-center justify-between py-1.5 border-b border-[#ecebea] text-xs">
                      <span>{row.date}</span>
                      <Badge variant={row.status === "present" ? "success" : "error"}>
                        {row.status === "present" ? "Present" : "Absent"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ShowcaseCard>
        </div>
      </div>
    </PatternSection>
  );
}
