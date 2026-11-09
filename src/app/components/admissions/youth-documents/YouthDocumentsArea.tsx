import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChevronDown,
  FileText,
  Lock,
  Upload,
} from "@/app/lib/lucide-icons";
import { Alert, AlertDescription } from "../../ui/alert";
import { Button } from "../../ui/button";
import { ColumnFilter } from "../../ui/column-filter";
import { EmptyState } from "../../ui/empty-state";
import { PaginationInfo } from "../../ui/pagination";
import { Skeleton } from "../../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { TablePaginationBar } from "../../ui/table-toolbar";
import { isoToMdy } from "../../../lib/dateFormat";
import { uploadAvailability } from "../../../lib/youthDocumentsAvailability";
import {
  scopeKey,
  youthScope,
} from "../../../lib/youthDocumentOwner";
import { gatewaySupportsAdmissionOwner } from "../../../data/youthDocumentGateway";
import type { DocumentOwnerScope } from "../../../data/youthDocumentTypes";
import {
  applyFilters,
  BLANK,
  DOC_COLUMNS,
  filterOptions,
  groupByFolder,
  paginateGroups,
  pruneFilters,
  type DocColumn,
  type DocFilters,
  type SortDir,
} from "../../../lib/youthDocumentsView";
import {
  can,
  useDocumentAccess,
} from "../../../data/youthDocumentAccess";
import {
  getCatalog,
  getCatalogProvider,
} from "../../../data/youthDocumentCatalog";
import { getDocumentGateway } from "../../../data/youthDocumentGateway";
import {
  listYouthDocuments,
  useYouthDocuments,
} from "../../../data/youthDocumentStore";
import { useOwnerDocuments } from "../../../data/constituentDocumentStore";
import { installYouthDocumentsDemo } from "../../../data/demo/youthDocumentFixtures";
import {
  installDemoPersonas,
  seedDemoRestrictedDocument,
} from "../../../data/demo/youthDocumentPersonas";
import {
  PersonaSwitchProvider,
  YouthDocumentsPersonaSwitcher,
} from "./YouthDocumentsPersonaSwitcher";
import { YouthDocumentFormDialog } from "./YouthDocumentFormDialog";
import { YouthDocumentRecordDialog } from "./YouthDocumentRecordDialog";

// Youth Documents (US 20147) — Youth's Profile > Admissions > Overview >
// Documents. Rows are the Youth's AUTHORIZED documents grouped by effective
// folder, with Excel-style filters on each column header.

const PAGE_SIZE = 10;

// This Figma Make project is a browser prototype. Its document catalog and
// file storage must also initialize in a built preview/published demo,
// where Vite sets DEV to false. Set this explicit demo switch to false
// when the approved catalog and real storage integration are supplied.
const ENABLE_DOCUMENTS_DEMO = true;

// Only bootstrap an unconfigured prototype. Never replace an available
// catalog or an installed storage gateway with demo fixtures.
if (
  ENABLE_DOCUMENTS_DEMO &&
  typeof window !== "undefined" &&
  getCatalog().status === "unavailable" &&
  getDocumentGateway() === null
) {
  installYouthDocumentsDemo();
}

// Persona simulation and elevated restricted-document access remain
// development-only; enabling the demo storage does not grant permissions.
if (import.meta.env.DEV) {
  installDemoPersonas();
}

type Load = "loading" | "ready" | "error";

/** The six approved columns as a static header: used wherever the table
 *  structure must stay visible but there is nothing to sort or filter. */
function ShellHeader() {
  return (
    <TableHeader>
      <TableRow>
        {DOC_COLUMNS.map((c) => (
          <TableHead
            key={c.key}
            variant="slds"
            className="px-2 whitespace-normal align-top"
          >
            {c.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

/** Table structure with one message row (loading, empty, unavailable). */
function TableShell({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <Table id={id} tabIndex={-1}>
      <ShellHeader />
      <TableBody>
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={DOC_COLUMNS.length}>
            {children}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function PageTitle({
  youthName,
  action,
}: {
  youthName: string | null;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-0 pb-3 border-b border-border">
      <div>
        <h2 className="slds-text-heading-small font-semibold">
          Documents
        </h2>
        {youthName && (
          <p className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
            {youthName}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/**
 * Documents entry point. The view needs a VERIFIED owner scope: a Youth
 * Constituent (optionally with the Admissions records explicitly linked to
 * them) or an Admissions record that has no Youth link yet. Both get the
 * same area. Anything that cannot be verified gets the same shell with an
 * explicit unavailable state, and no document service is called.
 *
 * Pass `scope` (from lib/youthDocumentOwner) or, for a verified Youth
 * Constituent, `youthId`. Never pass an Admissions id as `youthId`.
 */
export function YouthDocumentsArea({
  youthId,
  scope,
  youthName,
}: {
  /** Verified Youth Constituent id (never a name or an Admissions id). */
  youthId?: string | null;
  /** Resolved owner scope (preferred). */
  scope?: DocumentOwnerScope | null;
  youthName?: string | null;
}) {
  // Subscribed, so removing or restoring upload permission updates the
  // unverified shell immediately.
  const access = useDocumentAccess();
  const resolved =
    scope ?? (youthId ? youthScope(youthId) : null);
  if (!resolved) {
    return (
      <div
        className="w-full"
        data-testid="youth-documents-area"
      >
        <PageTitle
          youthName={youthName ?? null}
          action={
            // Same decision as the verified view: hidden without permission,
            // otherwise disabled (nothing verified to upload for).
            uploadAvailability({
              hasOwner: false,
              canUpload: can(access, "upload"),
              catalogReady: false,
              storageReady: false,
            }).state !== "hidden" && (
              <Button
                disabled
                aria-describedby="youth-documents-unlinked"
              >
                <Upload className="h-4 w-4" aria-hidden />
                Upload Document
              </Button>
            )
          }
        />
        <TableShell>
          <p
            id="youth-documents-unlinked"
            role="status"
            className="py-8 text-center text-[var(--slds-g-color-text-weak)]"
          >
            Documents are unavailable because this record could
            not be verified.
          </p>
        </TableShell>
      </div>
    );
  }
  return (
    <VerifiedYouthDocuments
      scope={resolved}
      youthName={youthName ?? ""}
    />
  );
}

/** Read-only legacy records keyed by this verified Youth's Constituent id
 *  (the only authoritative owner). Never reclassified or moved; renders
 *  nothing when there are none. */
function LegacyDocuments({ youthId }: { youthId: string }) {
  const legacy = useOwnerDocuments(youthId);
  if (legacy.length === 0) return null;
  return (
    <section
      aria-label="Legacy documents (read-only)"
      className="mx-4 my-4 rounded border border-border"
    >
      <h3 className="slds-text-3 px-3 py-2 font-semibold uppercase tracking-wide text-[var(--slds-g-color-text-weak)] border-b border-border">
        Legacy documents (read-only)
      </h3>
      <ul className="divide-y divide-border">
        {legacy.map((d) => (
          <li
            key={d.id}
            className="px-3 py-2 text-sm break-words"
          >
            {d.documentName}
            <span className="text-[var(--slds-g-color-text-weak)]">
              {" "}
              · {d.documentType}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function VerifiedYouthDocuments({
  scope,
  youthName,
}: {
  scope: DocumentOwnerScope;
  youthName: string;
}) {
  const ownerKey = scopeKey(scope);
  const youthId =
    scope.primary.kind === "youth" ? scope.primary.id : null;
  const { documents, incomplete } = useYouthDocuments(scope);
  const [load, setLoad] = useState<Load>("loading");
  const [attempt, setAttempt] = useState(0);
  const [sortCol, setSortCol] =
    useState<DocColumn>("dateFiled");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filters, setFilters] = useState<DocFilters>({});
  const [page, setPage] = useState(1);
  const [viewId, setViewId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const uploadBtnRef = useRef<HTMLButtonElement>(null);
  // Unsaved edits / a write in flight, reported by the form dialogs.
  const [activity, setActivity] = useState({
    dirty: false,
    busy: false,
  });
  const linkRefs = useRef(new Map<string, HTMLButtonElement>());
  const tableId = `youth-documents-table-${ownerKey.replace(/[^A-Za-z0-9_-]/g, "_")}`;

  // Reads go through the service; a failure shows an error with Retry.
  useEffect(() => {
    let live = true;
    setLoad("loading");
    Promise.resolve()
      .then(() => {
        listYouthDocuments(scope);
        if (live) setLoad("ready");
      })
      .catch(() => live && setLoad("error"));
    return () => {
      live = false;
    };
  }, [ownerKey, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  // Development only: a fictional restricted sample for Youth 1.
  useEffect(() => {
    if (import.meta.env.DEV && youthId === "1")
      void seedDemoRestrictedDocument(youthId);
  }, [youthId]);

  const access = useDocumentAccess();
  const canView = can(access, "view");
  const catalogState = getCatalog();
  const provider = getCatalogProvider();
  const storageReady = getDocumentGateway() !== null;
  const availability = uploadAvailability({
    hasOwner: true,
    canUpload: can(access, "upload"),
    catalogReady: catalogState.status === "available",
    storageReady,
    ownerIsAdmission: scope.primary.kind === "admission",
    admissionFilingReady: gatewaySupportsAdmissionOwner(),
  });
  const canUpload = availability.state !== "hidden";
  const uploadEnabled = availability.state === "enabled";

  // Filter selections that no longer match authorized data are dropped.
  useEffect(() => {
    setFilters((f) => {
      const next = pruneFilters(documents, f);
      return JSON.stringify(next) === JSON.stringify(f)
        ? f
        : next;
    });
  }, [documents]);

  const filtered = useMemo(
    () => applyFilters(documents, filters),
    [documents, filters],
  );
  const groups = useMemo(
    () => groupByFolder(filtered, sortCol, sortDir),
    [filtered, sortCol, sortDir],
  );
  const result = useMemo(
    () => paginateGroups(groups, page, PAGE_SIZE),
    [groups, page],
  );
  // Keep the page valid (e.g. an edit emptied the last page).
  useEffect(() => {
    if (result.page !== page) setPage(result.page);
  }, [result.page, page]);

  const activeFilters = DOC_COLUMNS.some(
    (c) => (filters[c.key]?.length ?? 0) > 0,
  );
  const viewDoc =
    documents.find((d) => d.id === viewId) ?? null;
  const editDoc =
    documents.find((d) => d.id === editId) ?? null;

  // A record that is no longer authorized (access changed) must not leave
  // its dialogs, or their state, behind.
  useEffect(() => {
    if (viewId && !viewDoc) setViewId(null);
    if (editId && !editDoc) setEditId(null);
  }, [viewId, viewDoc, editId, editDoc]);
  // The Upload dialog can't stay open if the user may no longer upload.
  useEffect(() => {
    if (uploadOpen && !uploadEnabled) setUploadOpen(false);
  }, [uploadOpen, uploadEnabled]);

  function handleSort(col: DocColumn) {
    if (col === sortCol)
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
    setPage(1);
  }

  const optionLabel = (col: DocColumn) => (v: string) =>
    v === BLANK
      ? "Blank"
      : col === "dateFiled" ||
          col === "dateExecuted" ||
          col === "expirationDate"
        ? isoToMdy(v)
        : v;

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  // Called as a function (not a component) so a filter popover keeps its
  // state while selections change and the table re-renders.
  const renderHeader = (col: DocColumn, label: string) => {
    const active = sortCol === col;
    return (
      <TableHead
        key={col}
        variant="slds"
        active={active}
        className="px-2 whitespace-normal align-top"
        aria-sort={
          active
            ? sortDir === "asc"
              ? "ascending"
              : "descending"
            : "none"
        }
      >
        <div className="flex items-start gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="inline"
            onClick={() => handleSort(col)}
            className="min-w-0 shrink justify-start whitespace-normal text-left uppercase leading-tight [font:inherit] [letter-spacing:inherit] hover:bg-transparent hover:text-inherit"
          >
            {label}
            <ChevronDown
              className={`h-3 w-3 ${active ? (sortDir === "asc" ? "rotate-180" : "") : "opacity-30"}`}
            />
          </Button>
          {/* Separate control: filtering never sorts and vice versa. */}
          <ColumnFilter
            label={label}
            options={filterOptions(documents, col)}
            value={filters[col] ?? []}
            getOptionLabel={optionLabel(col)}
            onValueChange={(v) => {
              setFilters((f) => ({ ...f, [col]: v }));
              setPage(1);
            }}
          />
        </div>
      </TableHead>
    );
  };

  const content = (
    <div className="w-full" data-testid="youth-documents-area">
      <PageTitle
        youthName={youthName}
        action={
          canUpload && (
            <Button
              ref={uploadBtnRef}
              disabled={!uploadEnabled}
              aria-describedby={
                availability.state === "disabled"
                  ? "youth-documents-upload-note"
                  : undefined
              }
              onClick={() => setUploadOpen(true)}
            >
              <Upload className="h-4 w-4" aria-hidden />
              Upload Document
            </Button>
          )
        }
      />


      {canView && availability.state === "disabled" && (
        <Alert
          variant="info"
          role="note"
          id="youth-documents-upload-note"
          className="mx-4 mt-3 w-auto"
        >
          <AlertDescription>
            {availability.reason}
          </AlertDescription>
        </Alert>
      )}
      {incomplete.length > 0 && (
        <Alert
          variant="error"
          role="status"
          className="mx-4 mt-3 w-auto"
        >
          <AlertDescription>
            {incomplete.length} upload
            {incomplete.length === 1 ? "" : "s"} did not finish
            and {incomplete.length === 1 ? "is" : "are"} not
            listed below. Retry from the integration tools once
            storage is available.
          </AlertDescription>
        </Alert>
      )}

      {!canView && (
        <TableShell id={tableId}>
          <p
            role="status"
            className="py-8 text-center text-[var(--slds-g-color-text-weak)]"
          >
            You do not have permission to view documents.
          </p>
        </TableShell>
      )}

      {canView && load === "loading" && (
        <TableShell id={tableId}>
          <div
            className="space-y-2 py-2"
            aria-busy="true"
            aria-label="Loading documents"
          >
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </TableShell>
      )}

      {canView && load === "error" && (
        <TableShell id={tableId}>
          <Alert
            variant="error"
            action={{
              label: "Retry",
              onClick: () => setAttempt((n) => n + 1),
            }}
          >
            <AlertDescription>
              Documents could not be loaded.
            </AlertDescription>
          </Alert>
        </TableShell>
      )}

      {/* With no storage connected, an empty list is not an authoritative
          "no documents": say it is unavailable instead. Saved metadata, if
          any, is still listed below. */}
      {canView &&
        load === "ready" &&
        documents.length === 0 &&
        !storageReady && (
          <TableShell id={tableId}>
            <p
              role="status"
              className="py-8 text-center text-[var(--slds-g-color-text-weak)]"
            >
              Documents can’t be shown until Laserfiche storage
              is connected.
            </p>
          </TableShell>
        )}

      {canView &&
        load === "ready" &&
        documents.length === 0 &&
        storageReady && (
          <TableShell id={tableId}>
            <EmptyState
              icon={FileText}
              title="No documents"
              description="No documents have been uploaded for this Youth."
              actionLabel={
                uploadEnabled ? "Upload Document" : undefined
              }
              actionIcon={Upload}
              onAction={
                uploadEnabled
                  ? () => setUploadOpen(true)
                  : undefined
              }
            />
          </TableShell>
        )}

      {canView && load === "ready" && documents.length > 0 && (
        <>
          <div>
            <Table id={tableId} tabIndex={-1}>
              <TableHeader>
                <TableRow>
                  {DOC_COLUMNS.map((c) =>
                    renderHeader(c.key, c.label),
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.totalRows === 0 ? (
                  <TableRow>
                    <TableCell colSpan={DOC_COLUMNS.length}>
                      <div className="flex flex-col items-center gap-2 py-8">
                        <p>
                          No documents match the selected
                          filters.
                        </p>
                        {activeFilters && (
                          <Button
                            variant="link-info"
                            onClick={clearFilters}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  result.groups.map((g) => (
                    <Fragment key={g.folder}>
                      <TableRow className="bg-[var(--slds-g-color-background-alt)] hover:bg-[var(--slds-g-color-background-alt)]">
                        <TableCell
                          colSpan={DOC_COLUMNS.length}
                          className="font-semibold whitespace-normal [overflow-wrap:anywhere]"
                        >
                          {g.folder}{" "}
                          <span className="font-normal text-[var(--slds-g-color-text-weak)]">
                            ({g.total})
                            {g.continued ? " — continued" : ""}
                          </span>
                        </TableCell>
                      </TableRow>
                      {g.rows.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="px-2 max-w-[13rem] whitespace-normal [overflow-wrap:anywhere]">
                            <Button
                              type="button"
                              variant="link"
                              size="inline"
                              ref={(el) => {
                                if (el)
                                  linkRefs.current.set(
                                    d.id,
                                    el,
                                  );
                                else
                                  linkRefs.current.delete(d.id);
                              }}
                              onClick={() => setViewId(d.id)}
                              className="min-w-0 max-w-full justify-start whitespace-normal text-left [overflow-wrap:anywhere]"
                            >
                              {d.documentName}
                            </Button>
                          </TableCell>
                          <TableCell className="px-2 whitespace-normal [overflow-wrap:anywhere]">
                            {d.documentType}
                          </TableCell>
                          <TableCell className="px-2 whitespace-normal [overflow-wrap:anywhere]">
                            <span className="inline-flex items-center gap-1">
                              {d.restricted && (
                                <Lock
                                  className="h-3 w-3"
                                  aria-label="Restricted"
                                />
                              )}
                              {d.effectiveFolder}
                            </span>
                          </TableCell>
                          <TableCell className="px-2 whitespace-nowrap">
                            {isoToMdy(d.dateFiled)}
                          </TableCell>
                          <TableCell className="px-2 whitespace-nowrap">
                            {isoToMdy(d.dateExecuted)}
                          </TableCell>
                          <TableCell className="px-2 whitespace-nowrap">
                            {isoToMdy(d.expirationDate)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="px-4 py-2.5 border-t border-border">
            {result.totalPages > 1 ? (
              <TablePaginationBar
                className="w-full"
                start={result.start}
                end={result.end}
                total={result.totalRows}
                countLabel="Documents"
                currentPage={result.page}
                totalPages={result.totalPages}
                onPrevious={() => setPage(result.page - 1)}
                onNext={() => setPage(result.page + 1)}
              />
            ) : (
              <PaginationInfo
                start={result.start}
                end={result.end}
                total={result.totalRows}
                label="Documents"
              />
            )}
          </div>
        </>
      )}

      {canView && youthId && (
        <LegacyDocuments youthId={youthId} />
      )}

      <YouthDocumentRecordDialog
        document={editId ? null : viewDoc}
        scope={scope}
        youthName={youthName}
        onClose={() => {
          const id = viewId;
          setViewId(null);
          requestAnimationFrame(() =>
            (id ? linkRefs.current.get(id) : null)?.focus(),
          );
        }}
        onEdit={(d) => setEditId(d.id)}
      />

      {/* Mounted only while open so every session starts from a fresh
          form. */}
      {uploadOpen && (
        <YouthDocumentFormDialog
          mode="create"
          scope={scope}
          document={null}
          open
          onActivityChange={setActivity}
          onClose={() => setUploadOpen(false)}
          onSaved={() => {
            setUploadOpen(false);
            setPage(1);
          }}
        />
      )}

      {editDoc && (
        <YouthDocumentFormDialog
          key={editDoc.id}
          mode="edit"
          scope={scope}
          document={editDoc}
          open
          onActivityChange={setActivity}
          onClose={() => setEditId(null)}
          onSaved={() => setEditId(null)}
        />
      )}
    </div>
  );

  // Development only: one guarded handler for every demo persona switcher.
  return import.meta.env.DEV ? (
    <PersonaSwitchProvider
      dirty={activity.dirty}
      busy={activity.busy}
      onSwitched={() => {
        // Close every document dialog; their state unmounts with them.
        setViewId(null);
        setEditId(null);
        setUploadOpen(false);
        setActivity({ dirty: false, busy: false });
      }}
    >
      {content}
    </PersonaSwitchProvider>
  ) : (
    content
  );
}