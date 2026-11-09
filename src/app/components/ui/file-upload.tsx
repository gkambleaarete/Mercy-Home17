"use client";

import * as React from "react";
import { Upload, FileText } from "@/app/lib/lucide-icons";

import { cn } from "./utils";

// Same token family as the other Form Controls (Input/Select): border-base-1
// border, --slds-c-input-radius-border radius, the app's real hover/focus/
// error colors. `state` is an optional, additive override -- omit it and the
// dropzone responds to real :hover/:focus-within like any other input;
// pass it only for a static demo that needs to force a look no mouse/
// keyboard is actually driving (mirrors the `focused` escape hatch already
// used on Input/SelectTrigger).
export type FileUploadState =
  "default" | "hover" | "focus" | "error";

const STATE_CLASSES: Record<FileUploadState, string> = {
  default: "border-[var(--slds-g-color-border-base-1)]",
  hover:
    "border-[#b0adab] bg-[var(--slds-g-color-background-alt)]",
  focus:
    "border-[#145F33] shadow-[0_0_0_3px_rgba(20,95,51,0.2)]",
  error: "border-[#A82031]",
};

interface FileUploadProps {
  variant?: "dropzone" | "compact" | "browse";
  state?: FileUploadState;
  disabled?: boolean;
  fileName?: string;
  placeholder?: string;
  helperText?: string;
  accept?: string;
  onFilesSelected?: (files: FileList) => void;
  className?: string;
  /** Additive: ties the file input to its help/error text and marks it invalid. */
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
  /** Additive: id of the native file input, so an external <label htmlFor>
   *  can name and activate it. */
  id?: string;
  /** Additive: text shown inline when a dropped/picked file doesn't match
   *  `accept`. Defaults to a generic message. */
  rejectedMessage?: string;
}

interface FileUploadBaseProps extends FileUploadProps {
  onRejected?: () => void;
}

function FileUploadBase({
  variant = "dropzone",
  state,
  disabled,
  fileName,
  placeholder = "Drag & drop or click to upload",
  helperText,
  accept,
  onFilesSelected,
  className,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  "aria-required": required,
  id,
  onRejected,
}: FileUploadBaseProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  // Drag & drop: only the first matching file is passed on, filtered by the
  // same `accept` list the picker uses.
  const accepts = (f: File) => {
    if (!accept) return true;
    return accept
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .some((t) =>
        t.startsWith(".")
          ? f.name.toLowerCase().endsWith(t)
          : t.endsWith("/*")
            ? f.type.startsWith(t.slice(0, -1))
            : f.type === t,
      );
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files).filter(
      accepts,
    );
    if (files.length === 0) {
      if (e.dataTransfer.files.length > 0) onRejected?.();
      return;
    }
    const dt = new DataTransfer();
    dt.items.add(files[0]);
    onFilesSelected?.(dt.files);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      // The picker's `accept` is advisory ("All files" is allowed): hold the
      // selection to the same list as a drop.
      if (!Array.from(e.target.files).every(accepts)) {
        e.target.value = "";
        onRejected?.();
        return;
      }
      onFilesSelected?.(e.target.files);
    }
  };

  const hiddenInput = (
    <input
      ref={inputRef}
      id={id}
      type="file"
      accept={accept}
      aria-required={required}
      disabled={disabled}
      aria-describedby={describedBy}
      aria-invalid={invalid || state === "error" || undefined}
      onChange={handleChange}
      className="sr-only"
    />
  );

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex min-h-7 flex-wrap items-center gap-x-2 gap-y-1",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
      >
        <label
          className={cn(
            "flex h-7 shrink-0 items-center gap-1.5 rounded-[var(--slds-c-input-radius-border)] border px-2.5 text-[length:var(--slds-g-font-size-3)]",
            "bg-[var(--slds-g-color-background-base)] border-[var(--slds-g-color-border-base-1)]",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
            state === "error" && "border-[#A82031]",
          )}
        >
          <Upload
            className={cn(
              "h-3.5 w-3.5",
              state === "error"
                ? "text-[#A82031]"
                : "text-[var(--slds-g-color-text-weak)]",
            )}
          />
          Choose File
          {hiddenInput}
        </label>
        <span
          className={cn(
            "min-w-[8rem] max-w-full flex-1 text-[length:var(--slds-g-font-size-3)] [overflow-wrap:anywhere]",
            fileName
              ? "text-[var(--slds-g-color-text-default)]"
              : "text-[var(--slds-g-color-text-weak)]",
          )}
        >
          {fileName || "No file chosen"}
        </span>
      </div>
    );
  }

  if (variant === "browse") {
    return (
      <label
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "block min-w-0 max-w-full rounded border-2 border-dashed px-4 py-6 text-center transition-colors",
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer",
          dragging
            ? "border-[#145F33] bg-[#f0f9f4]"
            : state === "error"
              ? "border-[#c23934] bg-[var(--slds-g-color-background-alt)]"
              : "border-[var(--slds-g-color-border-base-1)] bg-[var(--slds-g-color-background-alt)]",
          !disabled &&
            "focus-within:border-[#145F33] focus-within:shadow-[0_0_0_3px_rgba(20,95,51,0.2)]",
          className,
        )}
      >
        {!disabled && hiddenInput}
        {fileName ? (
          <div className="flex min-w-0 items-center justify-center gap-2">
            <FileText className="h-5 w-5 shrink-0 text-[#145F33]" />
            <span className="min-w-0 text-left text-[length:var(--slds-g-font-size-4)] [overflow-wrap:anywhere]">
              {fileName}
            </span>
            {!disabled && (
              <span className="shrink-0 text-[length:var(--slds-g-font-size-3)] font-medium text-[#0176d3]">
                Replace
              </span>
            )}
          </div>
        ) : (
          <>
            <Upload className="mx-auto mb-2 h-6 w-6 text-[var(--slds-g-color-text-weak)]" />
            <p className="text-[length:var(--slds-g-font-size-4)]">
              Drag and drop a file here, or
            </p>
            <p className="mt-1 text-[length:var(--slds-g-font-size-3)] font-medium text-[#0176d3]">
              Browse Files
            </p>
          </>
        )}
      </label>
    );
  }

  return (
    <label
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex min-w-0 max-w-full flex-col items-center justify-center gap-1 rounded-[var(--slds-c-input-radius-border)] border border-dashed p-5 text-center transition-colors",
        "bg-[var(--slds-g-color-background-base)]",
        !disabled &&
          "hover:border-[#b0adab] hover:bg-[var(--slds-g-color-background-alt)]",
        !disabled &&
          "focus-within:border-[#145F33] focus-within:shadow-[0_0_0_3px_rgba(20,95,51,0.2)]",
        disabled
          ? "cursor-not-allowed bg-[#f3f2f2] border-[var(--slds-g-color-border-base-1)]"
          : "cursor-pointer",
        !disabled &&
          fileName &&
          "border-solid border-[var(--slds-g-color-border-base-1)]",
        dragging &&
          STATE_CLASSES.focus +
            " bg-[var(--slds-g-color-background-alt)]",
        state && STATE_CLASSES[state],
        className,
      )}
    >
      {!disabled && hiddenInput}
      {fileName ? (
        <>
          <FileText
            className={cn(
              "mb-1 h-6 w-6",
              state === "error"
                ? "text-[#A82031]"
                : "text-[#145F33]",
            )}
          />
          <span className="max-w-full text-[length:var(--slds-g-font-size-4)] font-medium [overflow-wrap:anywhere]">
            {fileName}
          </span>
        </>
      ) : (
        <>
          <Upload
            className={cn(
              "mb-1 h-6 w-6",
              state === "error"
                ? "text-[#A82031]"
                : disabled
                  ? "text-[var(--slds-g-color-text-weak)]"
                  : "text-[var(--slds-g-color-text-weak)] group-focus-within:text-[#145F33]",
            )}
          />
          <span className="text-[length:var(--slds-g-font-size-4)]">
            {disabled ? "Upload disabled" : placeholder}
          </span>
          {helperText && (
            <span className="text-[length:var(--slds-g-font-size-2)] text-[var(--slds-g-color-text-weak)]">
              {helperText}
            </span>
          )}
        </>
      )}
    </label>
  );
}

/**
 * Same control as before, plus an inline rejection message. A rejected file
 * never replaces the previous selection; the message clears on the next
 * valid selection.
 */
function FileUpload(props: FileUploadProps) {
  const [rejected, setRejected] = React.useState(false);
  const msgId = React.useId();
  const message =
    props.rejectedMessage ?? "Unsupported file type.";
  return (
    <>
      <FileUploadBase
        {...props}
        state={rejected ? "error" : props.state}
        aria-invalid={
          props["aria-invalid"] || rejected || undefined
        }
        aria-describedby={
          [
            props["aria-describedby"],
            rejected ? msgId : undefined,
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
        onRejected={() => setRejected(true)}
        onFilesSelected={(files) => {
          setRejected(false);
          props.onFilesSelected?.(files);
        }}
      />
      {rejected && (
        <p
          id={msgId}
          role="alert"
          className="mt-1 text-[length:var(--slds-g-font-size-2)] text-[#A82031]"
        >
          {message}
        </p>
      )}
    </>
  );
}

export { FileUpload };