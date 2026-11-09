import { useState } from "react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import {
  ClipboardList,
  Check,
  Users,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Activity,
  Phone,
  MessageSquare,
  Upload,
  User,
  Target,
} from "@/app/lib/lucide-icons";
import { Card, CardContent } from "../../ui/card";
import { ShowcaseCard, CopyCSSBtn, PatternSection } from "./ShowcaseCard";
import { cn } from "../../ui/utils";

const STATUS_METRICS = [
  { id: "total-contacts", label: "Total Contacts", value: "482", icon: MessageSquare, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { id: "this-week", label: "This Week", value: "38", icon: CalendarIcon, iconBg: "bg-green-100", iconColor: "text-green-600" },
  { id: "need-follow-up", label: "Need Follow-up", value: "17", icon: Phone, iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  { id: "promoted", label: "Promoted", value: "129", icon: Check, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
];

const PROGRAM_OPTIONS = [
  { id: "ecr-tutor", label: "ECR Tutor", sub: "Early literacy · Ages 5–10", disabled: false },
  { id: "friends-first", label: "Friends First", sub: "Mentorship · Ages 9–17", disabled: false },
  { id: "lead-tutor", label: "Lead Tutor", sub: "Currently full", disabled: true },
];

export function KPICardsSection() {
  // One selection across every card in KPI-02, metric tiles and program
  // cards alike -- clicking a card selects it (and clears whichever else
  // was selected); clicking the selected card again clears it. Every card
  // just reports `selected={selectedCard === id}` to the same Card prop.
  const [selectedCard, setSelectedCard] = useState("this-week");
  function toggleSelectedCard(id: string) {
    setSelectedCard((prev) => (prev === id ? "" : id));
  }
  return (
        <div id="sec-kpi-cards">
          <h3
            className="mb-4"
            style={{
              fontSize: "var(--slds-g-font-size-6)",
              fontWeight: 500,
            }}
          >
            KPI / Metric Cards
          </h3>

          <ShowcaseCard
            id="KPI-01"
            title="Metric Card — Icon Badge Variants"
            description="Clickable summary card with a colored icon badge. Border/radius/padding and the hover effect (Card's `interactive` prop) are shared; only the icon-badge color changes per metric."
            cssCode={`.kpi-card { border-radius: 8px; border: 1px solid #dddbda; background-color: #ffffff; padding: 16px; cursor: pointer; }\n.kpi-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }\n.kpi-icon--blue { background-color: #dbeafe; }\n.kpi-icon--purple { background-color: #ede9fe; }\n.kpi-icon--teal { background-color: #ccfbf1; }\n.kpi-icon--red { background-color: #fee2e2; }\n.kpi-icon { width: 40px; height: 40px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card
              variant="section"
              interactive
              className="shadow-sm"
              aria-label="View all total youth"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Total Youth
                    </p>
                    <p
                      className="text-2xl font-bold mt-1"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      248
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card
              variant="section"
              interactive
              className="shadow-sm"
              aria-label="View youth in assessment"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      In Assessment
                    </p>
                    <p
                      className="text-2xl font-bold mt-1"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      64
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card
              variant="section"
              interactive
              className="shadow-sm"
              aria-label="View youth in move-in stage"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Move-In
                    </p>
                    <p
                      className="text-2xl font-bold mt-1"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      31
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-teal-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card
              variant="section"
              interactive
              className="shadow-sm"
              aria-label="View all alerts"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Alerts
                    </p>
                    <p
                      className="text-2xl font-bold mt-1"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      12
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </ShowcaseCard>
          <ShowcaseCard
            id="KPI-02"
            title="Metric Card — Status Variants"
            description="All 7 cards below are one selection group -- click any card to select it (deselecting whatever was selected before); click the selected card again to clear it. Every card, icon-badge tiles and the plain label/sub program cards alike, just reports `selected`/`interactive` to the same Card props -- one selected-state design, not a different one per card shape."
            cssCode={`.kpi-card--plain { border-radius: 8px; border: 1px solid #dddbda; background-color: #ffffff; padding: 16px; cursor: pointer; }\n.kpi-card--plain:hover { background-color: var(--slds-g-color-background-alt); }\n.kpi-card--selected { border-radius: 8px; border: 2px solid #145F33; background-color: #f4faf6; padding: 16px; cursor: pointer; }\n.kpi-card--disabled { opacity: 0.5; cursor: not-allowed; }\n.kpi-card__check { flex-shrink: 0; width: 18px; height: 18px; border-radius: 9999px; background-color: #145F33; color: #ffffff; display: flex; align-items: center; justify-content: center; }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {STATUS_METRICS.map((metric) => (
              <Card
                key={metric.id}
                variant="section"
                interactive
                selected={selectedCard === metric.id}
                onClick={() => toggleSelectedCard(metric.id)}
                aria-pressed={selectedCard === metric.id}
                aria-label={metric.label}
                className="shadow-sm"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-xs font-medium uppercase tracking-wide"
                        style={{
                          color: "var(--slds-g-color-text-weak)",
                        }}
                      >
                        {metric.label}
                      </p>
                      <p
                        className="text-2xl font-bold mt-1"
                        style={{
                          color: "var(--slds-g-color-text-default)",
                        }}
                      >
                        {metric.value}
                      </p>
                    </div>
                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", metric.iconBg)}>
                      <metric.icon className={cn("h-5 w-5", metric.iconColor)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Program Picker cards, moved up from the former standalone
                "Card-Style Program Picker" section -- plain label/sub
                content instead of an icon badge + value, but part of the
                exact same selection group and the same Card props above. */}
            {PROGRAM_OPTIONS.map((program) => (
              <Card
                key={program.id}
                variant="section"
                interactive={!program.disabled}
                selected={selectedCard === program.id}
                onClick={
                  program.disabled
                    ? undefined
                    : () => toggleSelectedCard(program.id)
                }
                aria-pressed={!program.disabled && selectedCard === program.id}
                aria-label={program.label}
                aria-disabled={program.disabled || undefined}
                className={cn(
                  "shadow-sm",
                  program.disabled && "opacity-50 cursor-not-allowed",
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-[var(--slds-g-color-text-default)]">
                        {program.label}
                      </p>
                      <p className="text-[11px] text-[var(--slds-g-color-text-weak)] mt-0.5">
                        {program.sub}
                      </p>
                    </div>
                    {selectedCard === program.id && !program.disabled && (
                      <div className="flex-shrink-0 w-[18px] h-[18px] rounded-full bg-[var(--color-brand-primary)] text-white flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </ShowcaseCard><ShowcaseCard
            id="KPI-03"
            title="Metric Card — Trend Variants"
            description="Metric cards that surface a trend indicator: plain trend arrow, accent-top bar + trend, progress bar toward a goal, and a trend with a units suffix."
            cssCode={`.trend-card { border-radius: 8px; border: 1px solid #dddbda; background-color: #ffffff; padding: 20px; box-shadow: var(--slds-g-shadow-1); }\n.trend-card__accent-top { height: 4px; }\n.trend-card__value { font-size: 2rem; font-weight: 700; line-height: 1; }\n.trend-card__trend--up { color: #2e844a; }\n.trend-card__trend--down { color: #A82031; }\n.trend-card__progress-track { height: 6px; border-radius: 9999px; background-color: #f3f2f2; overflow: hidden; margin-top: 12px; }\n.trend-card__progress-fill { height: 100%; border-radius: 9999px; background-color: #145F33; }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-lg border border-[var(--slds-g-color-border-base-1)] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between mb-1">
                <span
                  style={{
                    fontSize: "var(--slds-g-font-size-3)",
                    color: "var(--slds-g-color-text-weak)",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.025em",
                  }}
                >
                  Total Leads
                </span>
                <Users
                  className="h-4 w-4"
                  style={{ color: "#145F33" }}
                />
              </div>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                247
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp
                  className="h-3.5 w-3.5"
                  style={{ color: "#2e844a" }}
                />
                <span
                  style={{
                    fontSize: "var(--slds-g-font-size-3)",
                    color: "#2e844a",
                    fontWeight: 500,
                  }}
                >
                  +12%
                </span>
                <span
                  style={{
                    fontSize: "var(--slds-g-font-size-2)",
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  vs last month
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden border border-[var(--slds-g-color-border-base-1)] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
              <div
                className="h-1"
                style={{ backgroundColor: "#E86C24" }}
              />
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <span
                    style={{
                      fontSize: "var(--slds-g-font-size-3)",
                      color: "var(--slds-g-color-text-weak)",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.025em",
                    }}
                  >
                    Pending Review
                  </span>
                  <Clock
                    className="h-4 w-4"
                    style={{ color: "#E86C24" }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  38
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowDown
                    className="h-3.5 w-3.5"
                    style={{ color: "#A82031" }}
                  />
                  <span
                    style={{
                      fontSize: "var(--slds-g-font-size-3)",
                      color: "#A82031",
                      fontWeight: 500,
                    }}
                  >
                    -5%
                  </span>
                  <span
                    style={{
                      fontSize: "var(--slds-g-font-size-2)",
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    vs last month
                  </span>
                </div>
              </div>
            </div>
            <div className="p-5 bg-white rounded-lg border border-[var(--slds-g-color-border-base-1)] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#e6f4ea" }}
                >
                  <CheckCircle
                    className="h-5 w-5"
                    style={{ color: "#145F33" }}
                  />
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "var(--slds-g-font-size-3)",
                      color: "var(--slds-g-color-text-weak)",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.025em",
                    }}
                  >
                    Admitted
                  </span>
                  <div
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      lineHeight: 1.1,
                    }}
                  >
                    156
                  </div>
                </div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-[#f3f2f2] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "63%",
                    backgroundColor: "#145F33",
                  }}
                />
              </div>
              <p
                className="mt-1"
                style={{
                  fontSize: "var(--slds-g-font-size-2)",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                63% of annual target
              </p>
            </div>
            <div className="p-5 bg-white rounded-lg border border-[var(--slds-g-color-border-base-1)] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between mb-1">
                <span
                  style={{
                    fontSize: "var(--slds-g-font-size-3)",
                    color: "var(--slds-g-color-text-weak)",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.025em",
                  }}
                >
                  Avg. Days to Admit
                </span>
                <Activity
                  className="h-4 w-4"
                  style={{ color: "#183242" }}
                />
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  18.5
                </span>
                <span
                  style={{
                    fontSize: "var(--slds-g-font-size-4)",
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  days
                </span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown
                  className="h-3.5 w-3.5"
                  style={{ color: "#2e844a" }}
                />
                <span
                  style={{
                    fontSize: "var(--slds-g-font-size-3)",
                    color: "#2e844a",
                    fontWeight: 500,
                  }}
                >
                  -2.3 days
                </span>
                <span
                  style={{
                    fontSize: "var(--slds-g-font-size-2)",
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  improved
                </span>
              </div>
            </div>
          </div>
          </ShowcaseCard><div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ShowcaseCard
              id="KPI-04"
              title="Metric Card — Circular Progress Ring"
              description="Occupancy-style card: big percentage + trend icon on the left, an SVG circular progress ring on the right, with a per-site breakdown footer."
              cssCode={`.progress-ring-card { border-radius: 8px; border: 1px solid #dddbda; background-color: #ffffff; padding: 24px; box-shadow: 0 2px 4px 0 rgba(0,0,0,0.07); }\n.progress-ring-card__value { font-size: 2.5rem; font-weight: 700; line-height: 1; }\n.progress-ring-card__footer { padding-top: 12px; border-top: 1px solid #dddbda; font-size: 13px; }`}
            >
              <div className="rounded-lg p-6 bg-white border border-[var(--slds-g-color-border-base-1)] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p
                    className="text-xs font-semibold uppercase tracking-wide mb-2"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Agency Occupancy
                  </p>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span
                      className="font-bold"
                      style={{
                        fontSize: "2.5rem",
                        color: "#16A34A",
                        lineHeight: "1",
                      }}
                    >
                      92%
                    </span>

                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>

                  <p
                    className="text-xs mb-3"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Goal: 90%
                  </p>
                </div>

                {/* Circular Progress Ring */}
                <div
                  className="relative flex items-center justify-center"
                  style={{ width: "80px", height: "80px" }}
                >
                  <svg
                    className="transform -rotate-90"
                    width="80"
                    height="80"
                  >
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#E5E7EB"
                      strokeWidth="8"
                      fill="none"
                    />

                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="#16A34A"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="185 201"
                      strokeLinecap="round"
                    />
                  </svg>

                  <span
                    className="absolute font-semibold"
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    92%
                  </span>
                </div>
              </div>

              <div className="pt-3 text-sm border-t border-[var(--slds-g-color-border-base-1)] text-[var(--slds-g-color-text-default)]">
                <span style={{ color: "#16A34A" }}>
                  94% Walsh
                </span>
                {" | "}
                <span style={{ color: "#CA8A04" }}>
                  88% West Loop
                </span>
              </div>
            </div>
            </ShowcaseCard>

            <ShowcaseCard
              id="KPI-05"
              title="Metric Card — Mini Sparkline"
              description="Large value + trend chip, with a Recharts mini line-chart (no axes) underneath for an at-a-glance trend."
              cssCode={`.sparkline-card { border-radius: 8px; border: 1px solid #dddbda; background-color: #ffffff; padding: 24px; box-shadow: 0 2px 4px 0 rgba(0,0,0,0.07); }\n.sparkline-card__value { font-size: 2.5rem; font-weight: 700; line-height: 1; }\n.sparkline-card__trend-chip--down { color: #E86C24; display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; }`}
            >
              <div className="rounded-lg p-6 bg-white border border-[var(--slds-g-color-border-base-1)] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-2"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Q1 Move-Ins
              </p>

              <div className="flex items-baseline gap-3 mb-3">
                <span
                  className="font-bold"
                  style={{
                    fontSize: "2.5rem",
                    color: "var(--slds-g-color-text-default)",
                    lineHeight: "1",
                  }}
                >
                  148
                </span>

                <div className="flex items-center gap-1 text-orange-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-xs font-semibold">
                    Trending Down
                  </span>
                </div>
              </div>

              {/* Mini Sparkline */}
              <div
                className="h-12"
                style={{ marginTop: "1rem" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: "Jan", moveIns: 52 },
                      { month: "Feb", moveIns: 49 },
                      { month: "Mar", moveIns: 47 },
                    ]}
                  >
                    <Line
                      type="monotone"
                      dataKey="moveIns"
                      stroke="#0176D3"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            </ShowcaseCard>

            <ShowcaseCard
              id="KPI-06"
              title="Metric Card — Simple Stat with Footer"
              description="A single large stat value with a bordered footer row for a secondary metric (conversion rate)."
              cssCode={`.stat-card { border-radius: 8px; border: 1px solid #dddbda; background-color: #ffffff; padding: 24px; box-shadow: 0 2px 4px 0 rgba(0,0,0,0.07); }\n.stat-card__value { font-size: 2.5rem; font-weight: 700; line-height: 1; }\n.stat-card__footer { padding-top: 12px; border-top: 1px solid #dddbda; font-size: 13px; }`}
            >
              <div className="rounded-lg p-6 bg-white border border-[var(--slds-g-color-border-base-1)] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-2"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Initial Contacts
              </p>

              <span
                className="font-bold block mb-3"
                style={{
                  fontSize: "2.5rem",
                  color: "var(--slds-g-color-text-default)",
                  lineHeight: "1",
                }}
              >
                326
              </span>

              <div className="pt-3 text-sm border-t border-[var(--slds-g-color-border-base-1)] text-[var(--slds-g-color-text-default)]">
                <span
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Conversion Rate:
                </span>{" "}
                <span className="font-semibold">41%</span>
              </div>
            </div>
            </ShowcaseCard>
          </div>
        </div>
  );
}
