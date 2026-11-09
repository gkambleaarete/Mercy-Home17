import { useState } from "react";
import {
  ChevronDown,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  User,
  Check,
  AlertTriangle,
  Clock,
  Phone,
  RefreshCw,
} from "@/app/lib/lucide-icons";
import {
  ShowcaseCard,
  CopyCSSBtn,
  PatternSection,
} from "./ShowcaseCard";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../ui/table";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
  TableToolbar,
  TablePaginationBar,
  TableFooterBar,
} from "../../ui/table-toolbar";

export function DataTableSection() {
  return (
    <div id="sec-data-table">
      <h3
        className="mb-4"
        style={{
          fontSize: "var(--slds-g-font-size-6)",
          fontWeight: 500,
        }}
      >
        Data Table (SLDS 2 Pattern)
      </h3>

      {/* DTB-00 — Table Container */}
      <ShowcaseCard
        id="DTB-00"
        title="Table Container"
        description="Outer wrapper that clips all table children: border, radius, overflow hidden, white background."
        cssCode={`.table-container {\n  width: 100%;\n  border: 1px solid #dddbda;\n  border-radius: 6px;\n  overflow: hidden;\n  background-color: #ffffff;\n}`}
      >
        <Card variant="container">
          <Table>
            <TableHeader>
              <TableRow hoverable={false}>
                <TableHead variant="slds">Full Name</TableHead>
                <TableHead variant="slds">
                  Referral Date
                </TableHead>
                <TableHead variant="slds">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Marcus Johnson</TableCell>
                <TableCell>Aug 12, 2026</TableCell>
                <TableCell>
                  <Badge variant="success" bordered>
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sophia Martinez</TableCell>
                <TableCell>Jul 29, 2026</TableCell>
                <TableCell>
                  <Badge variant="info" bordered>
                    Pending
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </ShowcaseCard>

      {/* DTB-01 — Table Title & Toolbar */}
      <ShowcaseCard
        id="DTB-01"
        title="Table Title & Toolbar"
        description="Left: title + count pill. Right: Filter / Refresh / Download icon actions."
        cssCode={`.table-toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px 16px;\n  border-bottom: 1px solid #dddbda;\n  background-color: #ffffff;\n}\n.table-toolbar__title {\n  font-size: 14px;\n  font-weight: 500;\n  color: #080707;\n}\n.table-toolbar__count {\n  display: inline-flex;\n  align-items: center;\n  padding: 2px 8px;\n  border-radius: 9999px;\n  background-color: #e6f4ea;\n  color: #145F33;\n  font-size: 11px;\n  font-weight: 500;\n}\n.table-toolbar__actions {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n}\n.table-toolbar__action-btn {\n  padding: 6px;\n  border-radius: 4px;\n  color: #706e6b;\n  background: none;\n  border: none;\n  cursor: pointer;\n}\n.table-toolbar__action-btn:hover { background-color: #f3f2f2; }`}
      >
        <Card variant="container">
          <TableToolbar
            title="Lead Records"
            count={5}
            actions={[
              { icon: Filter, label: "Filter" },
              { icon: RefreshCw, label: "Refresh" },
              { icon: Download, label: "Download" },
            ]}
          />
        </Card>
      </ShowcaseCard>

      {/* DTB-01B — Toolbar with a labelled action */}
      <ShowcaseCard
        id="DTB-01B"
        title="Table Title & Toolbar — With Action Button"
        description="TableToolbar's children slot adds labelled controls (e.g. Export) after the icon actions; live announces a changing title such as a result count."
      >
        <Card variant="container" elevation="sm">
          <TableToolbar live title="Mentee Search (29)">
            <Button variant="outline" size="sm">
              <Download /> Export
            </Button>
          </TableToolbar>
        </Card>
      </ShowcaseCard>

      {/* DTB-02 — Header Cell: Unsorted */}
      <ShowcaseCard
        id="DTB-02"
        title="Header Cell — Unsorted"
        description="Default column header: uppercase label + faint sort chevron."
        cssCode={`.table-header-cell {\n  padding: 10px 16px;\n  text-align: left;\n  font-size: 11px;\n  font-weight: 500;\n  color: #706e6b;\n  text-transform: uppercase;\n  letter-spacing: 0.025em;\n  border-bottom: 2px solid #dddbda;\n  background-color: #f3f2f2;\n  white-space: nowrap;\n}\n.table-header-cell__sort-icon {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n}`}
      >
        <Card variant="container">
          <Table>
            <TableHeader>
              <TableRow hoverable={false}>
                <TableHead variant="slds">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    Full Name
                    <ChevronDown
                      className="h-3 w-3"
                      style={{ opacity: 0.3 }}
                    />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell tone="muted">— rows —</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </ShowcaseCard>

      {/* DTB-03 — Header Cell: Sorted */}
      <ShowcaseCard
        id="DTB-03"
        title="Header Cell — Sorted (Ascending)"
        description="Active sorted column: brand green label + upward chevron."
        cssCode={`.table-header-cell--sorted {\n  padding: 10px 16px;\n  text-align: left;\n  font-size: 11px;\n  font-weight: 500;\n  color: #145F33;\n  text-transform: uppercase;\n  letter-spacing: 0.025em;\n  border-bottom: 2px solid #dddbda;\n  background-color: #f3f2f2;\n  white-space: nowrap;\n}\n.table-header-cell__sort-icon {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n}`}
      >
        <Card variant="container">
          <Table>
            <TableHeader>
              <TableRow hoverable={false}>
                <TableHead variant="slds" active>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    Referral Date
                    <ChevronDown
                      className="h-3 w-3"
                      style={{ transform: "rotate(180deg)" }}
                    />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell tone="muted">— rows —</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </ShowcaseCard>

      {/* DTB-02B — Header Cell: No Sort */}
      <ShowcaseCard
        id="DTB-02B"
        title="Header Cell — No Sort"
        description="Non-sortable column: uppercase label only, no sort icon."
        cssCode={`.table-header-cell--no-sort {\n  padding: 10px 16px;\n  text-align: left;\n  font-size: 11px;\n  font-weight: 500;\n  color: #706e6b;\n  text-transform: uppercase;\n  letter-spacing: 0.025em;\n  border-bottom: 2px solid #dddbda;\n  background-color: #f3f2f2;\n  white-space: nowrap;\n  cursor: default;\n  user-select: none;\n}`}
      >
        <Card variant="container">
          <Table>
            <TableHeader>
              <TableRow hoverable={false}>
                <TableHead
                  variant="slds"
                  className="cursor-default select-none"
                >
                  Program Type
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell tone="muted">— rows —</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </ShowcaseCard>

      {/* DTB-02C — Header Cell: 12px */}
      <ShowcaseCard
        id="DTB-02C"
        title="Header Cell — 12px (size md)"
        description="TableHead variant slds is 11px (--slds-g-font-size-2). size=md raises it to 12px (--slds-g-font-size-3), as used by the Friends First search tables. Buttons inside the header (sort controls) inherit the uppercase."
      >
        <Card variant="container">
          <Table>
            <TableHeader>
              <TableRow hoverable={false}>
                <TableHead variant="slds" size="md">
                  Mentee Name
                </TableHead>
                <TableHead variant="slds" size="md" active>
                  Date of Referral
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell tone="muted">— rows —</TableCell>
                <TableCell tone="muted">— rows —</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </ShowcaseCard>

      {/* DTB-04 — Data Cell Types (per-item Copy CSS) */}
      <ShowcaseCard
        id="DTB-04"
        title="Data Cell Types"
        description="Each cell variant with its own Copy CSS button. Hover the ID/Link preview to see the underline."
      >
        <style>{`.dtb-link:hover { text-decoration: underline; }`}</style>
        <Card variant="container">
          {(
            [
              {
                label: "ID / Link Cell",
                preview: (
                  <span
                    className="dtb-link"
                    style={{
                      color: "#005EA2",
                      fontWeight: 500,
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    YTH-001
                  </span>
                ),
                css: `.table-cell--id {\n  padding: 10px 16px;\n  font-size: 13px;\n  vertical-align: middle;\n  border-bottom: 1px solid #eeeeec;\n  color: #005EA2;\n  font-weight: 500;\n  cursor: pointer;\n}\n.table-cell--id:hover { text-decoration: underline; }`,
              },
              {
                label: "Emphasized Text Cell",
                preview: (
                  <span
                    style={{
                      color: "#080707",
                      fontSize: "13px",
                    }}
                  >
                    Marcus Johnson
                  </span>
                ),
                css: `.table-cell--name {\n  padding: 10px 16px;\n  font-size: 13px;\n  vertical-align: middle;\n  border-bottom: 1px solid #eeeeec;\n  color: #080707;\n}`,
              },
              {
                label: "Normal Text Cell",
                preview: (
                  <span
                    style={{
                      color: "#706e6b",
                      fontSize: "13px",
                    }}
                  >
                    Prevention Program
                  </span>
                ),
                css: `.table-cell--meta {\n  padding: 10px 16px;\n  font-size: 13px;\n  vertical-align: middle;\n  border-bottom: 1px solid #eeeeec;\n  color: #706e6b;\n}`,
              },
              {
                label: "Badge — Success",
                preview: (
                  <Badge variant="success" bordered>
                    Success
                  </Badge>
                ),
                css: `.status-badge--success {\n  display: inline-flex;\n  align-items: center;\n  padding: 2px 10px;\n  border-radius: 9999px;\n  font-size: 11px;\n  font-weight: 500;\n  background-color: #e6f4ea;\n  color: #145F33;\n  border: 1px solid #a8d5b8;\n}`,
              },
              {
                label: "Badge — Info",
                preview: (
                  <Badge variant="info" bordered>
                    Info
                  </Badge>
                ),
                css: `.status-badge--info {\n  display: inline-flex;\n  align-items: center;\n  padding: 2px 10px;\n  border-radius: 9999px;\n  font-size: 11px;\n  font-weight: 500;\n  background-color: #e0f2fe;\n  color: #005EA2;\n  border: 1px solid #7dd3fc;\n}`,
              },
              {
                label: "Badge — Warning",
                preview: (
                  <Badge variant="warning" bordered>
                    Warning
                  </Badge>
                ),
                css: `.status-badge--warning {\n  display: inline-flex;\n  align-items: center;\n  padding: 2px 10px;\n  border-radius: 9999px;\n  font-size: 11px;\n  font-weight: 500;\n  background-color: #fef3c7;\n  color: #92400e;\n  border: 1px solid #fcd34d;\n}`,
              },
              {
                label: "Badge — Error",
                preview: (
                  <Badge variant="error" bordered>
                    Error
                  </Badge>
                ),
                css: `.status-badge--error {\n  display: inline-flex;\n  align-items: center;\n  padding: 2px 10px;\n  border-radius: 9999px;\n  font-size: 11px;\n  font-weight: 500;\n  background-color: #fce4ec;\n  color: #A82031;\n  border: 1px solid #f48fb1;\n}`,
              },
              {
                label: "Badge — Default",
                preview: (
                  <Badge variant="neutral" bordered>
                    Default
                  </Badge>
                ),
                css: `.status-badge--default {\n  display: inline-flex;\n  align-items: center;\n  padding: 2px 10px;\n  border-radius: 9999px;\n  font-size: 11px;\n  font-weight: 500;\n  background-color: #f3f2f2;\n  color: #706e6b;\n  border: 1px solid #c9c7c5;\n}`,
              },
              {
                label: "Row Action Cell",
                preview: (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-[var(--slds-g-color-text-weak)]"
                      aria-label="Row actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                ),
                css: `.table-cell--action {\n  padding: 10px 16px;\n  font-size: 13px;\n  vertical-align: middle;\n  border-bottom: 1px solid #eeeeec;\n  text-align: right;\n}\n.table-cell--action button {\n  padding: 4px;\n  border-radius: 4px;\n  border: none;\n  background: none;\n  color: #706e6b;\n  cursor: pointer;\n}\n.table-cell--action button:hover { background-color: #ecebea; }`,
              },
              {
                label: "Row Hover",
                preview: (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "4px",
                        backgroundColor: "#f0f0ee",
                        fontSize: "12px",
                        color: "#706e6b",
                      }}
                    >
                      #f0f0ee
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#b0adab",
                      }}
                    >
                      on :hover
                    </span>
                  </div>
                ),
                css: `.table-row:hover { background-color: #f0f0ee; }`,
              },
              {
                label: "Alt Row",
                preview: (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "4px",
                        backgroundColor: "#f3f2f2",
                        fontSize: "12px",
                        color: "#706e6b",
                      }}
                    >
                      #f3f2f2
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#b0adab",
                      }}
                    >
                      even rows
                    </span>
                  </div>
                ),
                css: `.table-row--alt { background-color: #f3f2f2; }`,
              },
            ] as {
              label: string;
              preview: React.ReactNode;
              css: string;
            }[]
          ).map((item, i, arr) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                borderBottom:
                  i < arr.length - 1
                    ? "1px solid #eeeeec"
                    : "none",
                backgroundColor: "#ffffff",
                gap: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#706e6b",
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                  minWidth: "128px",
                  flexShrink: 0,
                }}
              >
                {item.label}
              </span>
              <div style={{ flex: 1 }}>{item.preview}</div>
              <CopyCSSBtn css={item.css} label="Copy CSS" />
            </div>
          ))}
        </Card>
      </ShowcaseCard>

      {/* DTB-05 — Table Footer */}
      <ShowcaseCard
        id="DTB-05"
        title="Table Footer / Pagination Bar"
        description="Count text left, prev / page label / next controls right."
        cssCode={`.table-footer {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 12px 20px;\n  border-top: 1px solid #dddbda;\n  background-color: #f3f2f2;\n}\n.table-footer__count { font-size: 12px; color: #706e6b; }\n.table-footer__count strong { color: #080707; font-weight: 600; }\n.table-footer__pager { display: flex; align-items: center; gap: 12px; }\n.table-footer__page-label { font-size: 12px; color: #080707; }\n.table-footer__page-btn {\n  display: flex; align-items: center; justify-content: center;\n  width: 28px; height: 28px;\n  border-radius: 9999px;\n  border: 1px solid #dddbda;\n  background: none;\n  color: #706e6b;\n  cursor: pointer;\n}\n.table-footer__page-btn:hover { background-color: #f3f2f2; }`}
      >
        <TablePaginationBar
          start={1}
          end={5}
          total={247}
          countLabel="records"
          currentPage={1}
          totalPages={50}
          previousDisabled={false}
          nextDisabled={false}
        />
      </ShowcaseCard>

      {/* DTB-05B — Compact footer band */}
      <ShowcaseCard
        id="DTB-05B"
        title="Table Footer Band — TableFooterBar"
        description="CardFooter size=sm separated (12px / 20px, --slds-g-color-background-alt-2, border-top) holding the pagination bar — or just the count when everything fits on one page. Last child of the same Card variant=container."
      >
        <Card variant="container" elevation="sm">
          <TableFooterBar
            start={1}
            end={12}
            total={29}
            countLabel="records"
            currentPage={1}
            totalPages={3}
          />
          <TableFooterBar
            start={1}
            end={5}
            total={5}
            countLabel="records"
            currentPage={1}
            totalPages={1}
          />
        </Card>
      </ShowcaseCard>
    </div>
  );
}