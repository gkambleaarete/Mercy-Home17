import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { REPORT_DATA } from "../../data/mockReportData"
import { buildTablePdf } from "../../lib/simplePdf"
import {
  Building2,
  ClipboardList,
  Download,
  ExternalLink,
  FileBarChart,
  FileText,
  Home,
  Pill,
  Users,
} from "@/app/lib/lucide-icons"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader } from "../ui/card"
import { EmptyState } from "../ui/empty-state"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb"

// ── Report catalog: category headers with their report links ─────────────
export const REPORT_CATEGORIES: {
  title: string
  subtitle: string
  icon: React.ElementType
  reports: string[]
}[] = [
  {
    title: "Constituent Reports",
    subtitle: "Audits and eligibility.",
    icon: Building2,
    reports: ["DCFS Audit", "CPI Eligibility"],
  },
  {
    title: "Medication Reports",
    subtitle: "Medication, reviews and documentation.",
    icon: Pill,
    reports: [
      "Medication Overview",
      "Medication Last Counts",
      "Medication Review by Youth Physician",
      "Medication Assigned Documentation Errors",
      "Medical Summary Report",
    ],
  },
  {
    title: "Occupancy Reports",
    subtitle: "Population, capacity and movement.",
    icon: Users,
    reports: [
      "Pop Sheet",
      "Occupancy Rate Detail Report",
      "Occupancy Rate Summary Report",
      "Youth Admitted",
      "Youth Discharged",
    ],
  },
  {
    title: "Program Reports",
    subtitle: "Incidents and home visits.",
    icon: Home,
    reports: ["Incident Summary", "Home Visits Report"],
  },
  {
    title: "Admissions Reports",
    subtitle: "Cases and youth information.",
    icon: ClipboardList,
    reports: [
      "Open Admissions Cases Report",
      "Youth Information Overview Report",
      "Youth Medical, Physical & Dietary Needs",
    ],
  },
]

/** URL slug for a report name, e.g. "Pop Sheet" → "pop-sheet". */
export const reportSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

const findReport = (slug: string | undefined) => {
  for (const c of REPORT_CATEGORIES)
    for (const r of c.reports)
      if (reportSlug(r) === slug) return { category: c.title, name: r }
  return null
}

/** Builds a report's sample PDF in the browser; returns an object URL. */
function useReportPdf(name: string | null, category: string | null) {
  const url = useMemo(() => {
    const table = name ? REPORT_DATA[name] : undefined
    if (!name || !table) return null
    return URL.createObjectURL(
      buildTablePdf({
        title: name,
        subtitle: `${category ?? ""}  -  ${table.rows.length} records`,
        note: "Sample data for demonstration only.",
        columns: table.columns,
        rows: table.rows,
      }),
    )
  }, [name, category])
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url)
    },
    [url],
  )
  return url
}

// ── Reports landing page ─────────────────────────────────────────────────
export function Reports() {
  const [open, setOpen] = useState<{ name: string; category: string } | null>(
    null,
  )
  const pdfUrl = useReportPdf(open?.name ?? null, open?.category ?? null)
  return (
    <div className="app-page-x pb-6 pt-4 flex flex-col gap-[var(--app-content-gap)]">
      <h1 className="slds-page-header-title">Reports</h1>
      {/* Masonry: two CSS columns; each card keeps its natural height. */}
      <div className="columns-1 md:columns-2 gap-6">
        {REPORT_CATEGORIES.map((cat) => {
          const headingId = `reports-${reportSlug(cat.title)}`
          const Icon = cat.icon
          return (
            <Card
              key={cat.title}
              variant="section"
              elevation="sm"
              className="mb-6 break-inside-avoid"
              role="region"
              aria-labelledby={headingId}
            >
              <CardContent className="p-4">
                {/* Section header: icon tile, title + count, subtitle */}
                <div className="flex items-start gap-3 pb-3">
                  <div
                    className="h-11 w-11 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--color-brand-primary) 12%, transparent)",
                      color: "var(--color-brand-primary)",
                    }}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2
                        id={headingId}
                        className="slds-text-5 font-semibold m-0 text-[var(--slds-g-color-text-default)]"
                      >
                        {cat.title}
                      </h2>
                      <Badge variant="success">{cat.reports.length}</Badge>
                    </div>
                    <p className="slds-text-3 m-0 mt-0.5 text-[var(--slds-g-color-text-weak)]">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>
                {/* Report links: whole row is the link */}
                <ul className="m-0 p-0 list-none">
                  {cat.reports.map((r) => (
                    <li
                      key={r}
                      style={{
                        borderTop:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      <button
                        type="button"
                        aria-haspopup="dialog"
                        onClick={() =>
                          setOpen({ name: r, category: cat.title })
                        }
                        className="w-full text-left flex items-center gap-3 px-2 py-2.5 rounded-md slds-text-4 font-medium transition-colors hover:bg-[var(--slds-g-color-background-alt)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
                        style={{ color: "var(--color-link-blue)" }}
                      >
                        <FileText
                          className="h-4 w-4 flex-shrink-0 text-[var(--slds-g-color-text-weak)]"
                          aria-hidden="true"
                        />
                        <span>{r}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <Dialog
        open={!!open}
        onOpenChange={(o) => {
          if (!o) setOpen(null)
        }}
      >
        <DialogContent size="xl" className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{open?.name}</DialogTitle>
            <DialogDescription>
              {open?.category} · sample data
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="p-0">
            {pdfUrl && (
              <iframe
                src={pdfUrl}
                title={`${open?.name} (PDF)`}
                className="w-full block border-0"
                style={{ height: "min(70vh, 720px)" }}
              />
            )}
          </DialogBody>
          <DialogFooter>
            {pdfUrl && open && (
              <>
                <Button asChild variant="outline">
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink /> Open in new tab
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={pdfUrl} download={`${reportSlug(open.name)}.pdf`}>
                    <Download /> Download PDF
                  </a>
                </Button>
              </>
            )}
            <Button
              type="button"
              variant="neutral"
              onClick={() => setOpen(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Individual report (opened from a landing-page link) ───────────────────
export function ReportView() {
  const { reportId } = useParams()
  const navigate = useNavigate()
  const report = findReport(reportId)
  const title = report?.name ?? "Report not found"
  const table = report ? REPORT_DATA[report.name] : undefined
  // Build the sample PDF in the browser and expose it as an object URL.
  const pdfUrl = useMemo(() => {
    if (!report || !table) return null
    const blob = buildTablePdf({
      title: report.name,
      subtitle: `${report.category}  -  ${table.rows.length} records`,
      note: "Sample data for demonstration only.",
      columns: table.columns,
      rows: table.rows,
    })
    return URL.createObjectURL(blob)
  }, [report?.name]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(
    () => () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    },
    [pdfUrl],
  )
  const fileName = `${reportId ?? "report"}.pdf`
  return (
    <div className="app-page-x pb-6 pt-4 flex flex-col gap-[var(--app-content-gap)]">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button type="button" onClick={() => navigate("/reports")}>
                Reports
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {report && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>{report.category}</BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbPage>{title}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="slds-page-header-title">{title}</h1>
      <Card variant="container">
        <CardHeader
          size="sm"
          separated
          className="flex flex-wrap items-center justify-between gap-2"
        >
          <h2 className="slds-text-5 font-semibold m-0 text-[var(--slds-g-color-text-default)]">
            {title}
          </h2>
          {pdfUrl && (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink /> Open in new tab
                </a>
              </Button>
              <Button asChild>
                <a href={pdfUrl} download={fileName}>
                  <Download /> Download PDF
                </a>
              </Button>
            </div>
          )}
        </CardHeader>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title={`${title} (PDF)`}
            className="w-full block border-0"
            style={{ height: "calc(100vh - 300px)", minHeight: 480 }}
          />
        ) : (
          <CardContent className="py-12">
            <EmptyState
              icon={FileBarChart}
              title={report ? "Report not yet available" : "Report not found"}
              description={
                report
                  ? "This report hasn't been built yet. Its data and layout will appear here."
                  : "This report doesn't exist. Go back to Reports to choose another."
              }
            />
          </CardContent>
        )}
      </Card>
    </div>
  )
}
