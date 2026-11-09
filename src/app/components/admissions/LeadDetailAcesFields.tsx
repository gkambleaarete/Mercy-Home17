import { useRef } from "react";
import { Eye, File, Trash2, Upload } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";

// ACEs assessment (US 20063) — the ten questions in the approved order and
// wording, each answered Yes / No / Null. TOTAL NUMBER OF ACES is entered by
// the user and is never calculated from the answers.
export const ACES_QUESTIONS = [
  "Did a parent or other adult in the household often or very often swear at you, insult you, put you down, or humiliate you?",
  "Did a parent or other adult in the household often or very often hit, kick, beat, or physically hurt you in any way?",
  "Did an adult or person over 5 years older than you ever touch you sexually, try to make you touch them sexually or force you to have sex?",
  "Did you often or very often feel that no adult in your household made you feel safe and protected?",
  "Did you often or very often feel that no adult in your household made sure your basic needs were met?",
  "Were your parents ever separated or divorced?",
  "Did your parents or other adults in your home slap, hit, kick, punch, or beat each other up?",
  "Did you live with anyone who was a problem drinker or alcoholic, used illegal street drugs, or abused prescription medications?",
  "Did you live with anyone who was depressed, mentally ill, or suicidal?",
  "Did you live with anyone who served time or was sentenced to serve time in a prison, jail, or other correctional facility?",
];

export const ACES_ANSWERS = ["Yes", "No", "Null"] as const;
export type AcesAnswer = (typeof ACES_ANSWERS)[number];

export interface AcesFormData {
  /** Keyed by question number (1–10); unanswered questions are absent. */
  answers: Record<number, AcesAnswer>;
  totalAces: string;
  commentary: string;
}

export interface AcesDocument {
  id: number;
  name: string;
  size: number;
  type: string;
  uploadedDate: string;
  url: string;
}

export const emptyAcesFormData = (): AcesFormData => ({
  answers: {},
  totalAces: "0",
  commentary: "",
});

const labelClass =
  "block text-[12px] font-semibold mb-1.5 uppercase";
const weak = { color: "var(--slds-g-color-text-weak)" };
const text = { color: "var(--slds-g-color-text-default)" };
// Selected indicator in brand green (#145F33), scoped to these radio groups.
const brandRadio = {
  "--color-primary": "#145F33",
} as React.CSSProperties;

export function LeadDetailAcesFields({
  acesFormData,
  setAcesFormData,
  acesDocuments,
  onFilesSelected,
  onRemoveDocument,
  onViewDocument,
}: {
  acesFormData: AcesFormData;
  setAcesFormData: React.Dispatch<
    React.SetStateAction<AcesFormData>
  >;
  acesDocuments: AcesDocument[];
  onFilesSelected: (files: File[]) => void;
  onRemoveDocument: (id: number) => void;
  onViewDocument: (docs: AcesDocument[], index: number) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      {/* ACEs Assessment */}
      <div>
        <h3
          className="text-[13px] font-semibold uppercase"
          style={text}
        >
          ACEs Assessment
        </h3>
        <p
          className="text-[12px] font-semibold uppercase mt-2 mb-4"
          style={weak}
        >
          While you were growing up, during your first 18 years
          of life:
        </p>
        <ol className="space-y-5">
          {ACES_QUESTIONS.map((question, i) => {
            const n = i + 1;
            const qId = `aces-q${n}`;
            return (
              <li key={n}>
                <p
                  id={qId}
                  className="text-[12px] font-semibold uppercase mb-2"
                  style={text}
                >
                  {n}. {question}
                </p>
                <RadioGroup
                  aria-labelledby={qId}
                  value={acesFormData.answers[n] ?? ""}
                  onValueChange={(v) =>
                    setAcesFormData((f) => ({
                      ...f,
                      answers: {
                        ...f.answers,
                        [n]: v as AcesAnswer,
                      },
                    }))
                  }
                  className="flex gap-6"
                  style={brandRadio}
                >
                  {ACES_ANSWERS.map((answer) => {
                    const id = `${qId}-${answer.toLowerCase()}`;
                    return (
                      <div
                        key={answer}
                        className="flex items-center gap-2"
                      >
                        <RadioGroupItem
                          value={answer}
                          id={id}
                        />
                        <Label
                          htmlFor={id}
                          className="text-[13px] font-normal cursor-pointer"
                          style={text}
                        >
                          {answer}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Total Number of ACEs — entered manually, never calculated */}
      <div
        className="border-t pt-4"
        style={{
          borderColor: "var(--slds-g-color-border-base-1)",
        }}
      >
        <Label
          htmlFor="aces-total"
          className={labelClass}
          style={weak}
        >
          Total Number of ACEs
        </Label>
        <Input
          id="aces-total"
          type="text"
          value={acesFormData.totalAces}
          onChange={(e) =>
            setAcesFormData((f) => ({
              ...f,
              totalAces: e.target.value,
            }))
          }
          className="max-w-[12rem]"
        />
      </div>

      {/* Commentary */}
      <div>
        <Label
          htmlFor="aces-commentary"
          className={labelClass}
          style={weak}
        >
          Commentary
        </Label>
        <Textarea
          id="aces-commentary"
          value={acesFormData.commentary}
          onChange={(e) =>
            setAcesFormData((f) => ({
              ...f,
              commentary: e.target.value,
            }))
          }
          placeholder="Enter any additional notes or commentary..."
          className="min-h-[100px]"
        />
      </div>

      {/* Document Upload — same pattern as ACT (prototype: files kept in the browser) */}
      <div>
        <Label className={labelClass} style={weak}>
          Document
        </Label>
        <div
          className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
          style={{
            borderColor: "var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload
            className="mx-auto h-8 w-8 mb-2"
            style={weak}
          />
          <p className="text-[13px] mb-2" style={text}>
            Drag and drop test report here, or click to browse
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-8 px-4 rounded-full text-[12px]"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
              backgroundColor:
                "var(--slds-g-color-background-base)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            aria-label="Upload ACEs documents"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) onFilesSelected(files);
              e.target.value = "";
            }}
          />
        </div>

        {/* Uploaded Documents List */}
        {acesDocuments.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label
              className="block text-[12px] font-semibold uppercase"
              style={weak}
            >
              Uploaded Documents ({acesDocuments.length})
            </Label>
            <div
              className="border rounded overflow-hidden"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
                backgroundColor:
                  "var(--slds-g-color-background-base)",
              }}
            >
              {acesDocuments.map((doc, index) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50/50"
                  style={{
                    borderBottom:
                      index < acesDocuments.length - 1
                        ? "1px solid var(--slds-g-color-border-base-1)"
                        : "none",
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File
                      className="h-5 w-5 flex-shrink-0"
                      style={weak}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[13px] font-medium truncate"
                        style={text}
                      >
                        {doc.name}
                      </p>
                      <p className="text-[12px]" style={weak}>
                        {(doc.size / 1024).toFixed(0)} KB •{" "}
                        {doc.uploadedDate}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onViewDocument(acesDocuments, index)
                    }
                    aria-label={`View ${doc.name}`}
                  >
                    <Eye
                      className="h-4 w-4"
                      style={{ color: "#145F33" }}
                    />{" "}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveDocument(doc.id)}
                    className="h-8 w-8 p-0 hover:bg-red-50"
                    aria-label={`Remove ${doc.name}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}