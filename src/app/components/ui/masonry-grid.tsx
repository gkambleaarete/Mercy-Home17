import * as React from "react";

// Shortest-column masonry on CSS grid. Each child keeps its natural height
// and is explicitly placed (column + 1px row span) into the currently
// shortest column, in child order. DOM order equals child order, so
// keyboard focus order stays the logical card order whatever the columns.
// Re-measures with ResizeObserver, so cards below move up when a card
// above shrinks (tab changes, refreshes, empty states).

/** Pins a card to a column (1-based, clamped to the current column
 *  count) instead of the shortest one. Renders its child unchanged. */
export function MasonryItem({
  children,
}: {
  column?: number;
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

function pinnedColumn(child: React.ReactNode): number | undefined {
  return React.isValidElement<{ column?: number }>(child) &&
    child.type === MasonryItem
    ? child.props.column
    : undefined;
}

interface MasonryGridProps {
  children: React.ReactNode;
  /** Narrowest readable column, in px; drives the column count. */
  minColumnWidth?: number;
  maxColumns?: number;
  /** Horizontal and vertical gap, in px. */
  gap?: number;
  /** Relative column widths (fr), by column; missing entries = 1. */
  columnWeights?: number[];
  className?: string;
}

interface Placement {
  column: number;
  rowStart: number;
  span: number;
}

export function MasonryGrid({
  children,
  minColumnWidth = 440,
  maxColumns = 3,
  gap = 16,
  columnWeights = [],
  className,
}: MasonryGridProps) {
  const items = React.Children.toArray(children).filter(Boolean);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [columns, setColumns] = React.useState(1);
  const [placements, setPlacements] = React.useState<Placement[]>([]);

  const layout = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth;
    const cols = Math.max(
      1,
      Math.min(
        maxColumns,
        Math.floor((width + gap) / (minColumnWidth + gap)),
      ),
    );
    const heights = new Array(cols).fill(0);
    const next: Placement[] = itemRefs.current
      .slice(0, items.length)
      .map((el, i) => {
        const h = el ? Math.ceil(el.getBoundingClientRect().height) : 0;
        const pin = pinnedColumn(items[i]);
        let column = 0;
        if (pin !== undefined) column = Math.min(pin, cols) - 1;
        else
          for (let c = 1; c < cols; c++)
            if (heights[c] < heights[column]) column = c;
        const rowStart = heights[column] + 1;
        const span = Math.max(1, h + gap);
        heights[column] += span;
        return { column: column + 1, rowStart, span };
      });
    setColumns(cols);
    setPlacements((prev) =>
      prev.length === next.length &&
      prev.every(
        (p, i) =>
          p.column === next[i].column &&
          p.rowStart === next[i].rowStart &&
          p.span === next[i].span,
      )
        ? prev
        : next,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, gap, minColumnWidth, maxColumns]);

  React.useLayoutEffect(() => {
    layout();
    const ro = new ResizeObserver(() => layout());
    if (containerRef.current) ro.observe(containerRef.current);
    itemRefs.current
      .slice(0, items.length)
      .forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
  }, [layout, items.length]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns:
          columns === 1
            ? "minmax(0, 1fr)"
            : Array.from(
                { length: columns },
                (_, i) => `minmax(0, ${columnWeights[i] ?? 1}fr)`,
              ).join(" "),
        gridAutoRows: "1px",
        columnGap: gap,
        rowGap: 0,
        alignItems: "start",
      }}
    >
      {items.map((child, i) => {
        const p = placements[i];
        return (
          <div
            key={(React.isValidElement(child) && child.key) || i}
            className="min-w-0"
            style={
              p
                ? {
                    gridColumn: p.column,
                    gridRow: `${p.rowStart} / span ${p.span}`,
                  }
                : { gridColumn: 1, marginBottom: gap }
            }
          >
            {/* Measured element: natural content height only. */}
            <div
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
            >
              {child}
            </div>
          </div>
        );
      })}
    </div>
  );
}
