// DEMO PERSONAS — DEVELOPMENT ONLY (US 20147).
//
// Fictional personas that let the Documents demo exercise restricted-document
// behaviour by hand. They are NOT a role policy: which real roles may view,
// mark, edit or un-restrict restricted documents is still undecided.
//
// Safety rules:
//  - Everything here is inert unless `import.meta.env.DEV` is true; a
//    production build drops the elevated personas and the switcher.
//  - The selection lives in memory only. No query parameter, localStorage or
//    other saved setting can choose or enable a persona.
//  - The default persona has no restricted-document access.

import { useSyncExternalStore } from "react";
import { setDocumentAccessProvider } from "../youthDocumentAccess";
import {
  createYouthDocument,
  listYouthDocuments,
} from "../youthDocumentStore";
import { findEntryByTypeAndName } from "../youthDocumentCatalog";
import type {
  DocumentAccess,
  DocumentCapability,
} from "../youthDocumentTypes";
import { localTodayIso } from "../../lib/dateFormat";

export type DemoPersonaId =
  | "standard"
  | "restricted-viewer"
  | "restricted-editor";

export interface DemoPersona {
  id: DemoPersonaId;
  label: string;
  description: string;
  access: DocumentAccess;
}

const actor = (id: string, name: string) => ({ id, name });
const caps = (...c: DocumentCapability[]) => new Set(c);

// Empty outside development, so a production build carries no elevated
// persona at all (the whole array is dead code there).
export const DEMO_PERSONAS: readonly DemoPersona[] = !import.meta.env.DEV
  ? []
  : [
  {
    id: "standard",
    label: "Demo: Standard staff (no restricted access)",
    description:
      "View, upload and edit unrestricted documents. Restricted documents are hidden.",
    access: {
      actor: actor("demo-standard", "Demo Standard Staff"),
      capabilities: caps("view", "upload", "edit"),
    },
  },
  {
    id: "restricted-viewer",
    label: "Demo: Restricted viewer (view only)",
    description:
      "Can also see and open restricted documents, but cannot edit them.",
    access: {
      actor: actor("demo-restricted-viewer", "Demo Restricted Viewer"),
      capabilities: caps("view", "upload", "edit", "view-restricted"),
    },
  },
  {
    id: "restricted-editor",
    label: "Demo: Restricted editor",
    description:
      "Can view, edit, restrict and un-restrict restricted documents.",
    access: {
      actor: actor("demo-restricted-editor", "Demo Restricted Editor"),
      capabilities: caps(
        "view",
        "upload",
        "edit",
        "view-restricted",
        "edit-restricted",
        "mark-restricted",
        "unrestrict",
      ),
    },
  },
    ];

// In-memory only.
let current: DemoPersonaId = "standard";
const listeners = new Set<() => void>();

const byId = (id: DemoPersonaId): DemoPersona | undefined =>
  DEMO_PERSONAS.find((p) => p.id === id) ?? DEMO_PERSONAS[0];

function applyProvider(): void {
  const access = byId(current)?.access;
  if (!access) return;
  // Re-installing the provider notifies every subscriber (the Documents
  // store and area re-filter immediately).
  setDocumentAccessProvider(() => access);
}

/** Install the demo personas as the access source (development only). */
export function installDemoPersonas(): void {
  if (!import.meta.env.DEV) return;
  applyProvider();
}

export function getDemoPersonaId(): DemoPersonaId {
  return current;
}

export function setDemoPersona(id: DemoPersonaId): void {
  if (!import.meta.env.DEV) return;
  if (!DEMO_PERSONAS.some((p) => p.id === id)) return;
  current = id;
  applyProvider();
  listeners.forEach((l) => l());
}

export function useDemoPersonaId(): DemoPersonaId {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => current,
  );
}

// ── Fictional restricted document ──────────────────────────────────────

// Edit mode cannot change a stored file name, so it is the stable marker
// that stops a reload from seeding a second copy.
export const DEMO_SEED_FILE_NAME = "demo-restricted-sample.png";

export const DEMO_SEED_DESCRIPTOR =
  "DEMO SEED: fictional restricted sample (not a real record)";

async function demoImage(): Promise<File> {
  const w = 480;
  const h = 300;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d");
  if (g) {
    g.fillStyle = "#fff8e1";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#A82031";
    g.lineWidth = 6;
    g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = "#A82031";
    g.font = "bold 26px sans-serif";
    g.textAlign = "center";
    g.fillText("FICTIONAL DEMO DOCUMENT", w / 2, 120);
    g.font = "20px sans-serif";
    g.fillText("Restricted sample, not a real record", w / 2, 160);
  }
  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/png"),
  );
  if (!blob) throw new Error("no canvas");
  return new File([blob], DEMO_SEED_FILE_NAME, {
    type: "image/png",
  });
}

let seeding: Promise<void> | null = null;

/** Create the fictional restricted document once (idempotent across
 *  reloads: the seed file name is checked first). Runs in development
 *  only, as the restricted-editor persona, without changing the selected
 *  persona afterwards. */
export function seedDemoRestrictedDocument(youthId: string): Promise<void> {
  if (!import.meta.env.DEV) return Promise.resolve();
  seeding ??= (async () => {
    const editor = byId("restricted-editor")?.access;
    if (!editor) return;
    if (
      listYouthDocuments(youthId, editor).some(
        (d) => d.file.name === DEMO_SEED_FILE_NAME,
      )
    )
      return;
    if (!findEntryByTypeAndName("Legal", "Court Paperwork")) return;
    let file: File;
    try {
      file = await demoImage();
    } catch {
      return;
    }
    // The service re-checks access after its awaits, so the editor identity
    // is held for the whole (first-run-only) seed and then put back.
    setDocumentAccessProvider(() => editor);
    try {
      await createYouthDocument({
        youthId,
        requestId: `demo-seed-${youthId}`,
        documentType: "Legal",
        documentName: "Court Paperwork",
        restricted: true,
        dateFiled: localTodayIso(),
        dateExecuted: "2026-01-15",
        expirationDate: "",
        descriptor: DEMO_SEED_DESCRIPTOR,
        file,
      });
    } finally {
      applyProvider();
    }
  })().catch(() => {
    seeding = null;
  });
  return seeding;
}