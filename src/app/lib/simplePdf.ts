// Minimal, dependency-free PDF writer for demo reports: a title block and a
// paginated text table on US-Letter landscape pages (Helvetica fonts).

const W = 792 // page width (pt)
const H = 612 // page height (pt)
const M = 40 // margin
const ROW_H = 20

const esc = (t: string) =>
  t.replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    // Helvetica (WinAnsi) can't show every character; keep it printable.
    .replace(/[^\x20-\x7E]/g, "-")

/** Rough Helvetica width estimate (pt) used to truncate long cells. */
const fit = (t: string, size: number, max: number) => {
  const per = size * 0.5
  if (t.length * per <= max) return t
  const n = Math.max(1, Math.floor(max / per) - 1)
  return t.slice(0, n) + "..."
}

export function buildTablePdf(opts: {
  title: string
  subtitle: string
  note: string
  columns: string[]
  rows: string[][]
}): Blob {
  const { title, subtitle, note, columns, rows } = opts
  const colW = (W - M * 2) / columns.length
  const firstTop = H - M - 70 // table start on page 1 (below title block)
  const otherTop = H - M - 10
  const bottom = M + 30
  const perFirst = Math.floor((firstTop - bottom) / ROW_H) - 1
  const perOther = Math.floor((otherTop - bottom) / ROW_H) - 1
  const pages: string[][][] = []
  let rest = rows.slice()
  pages.push(rest.splice(0, perFirst))
  while (rest.length) pages.push(rest.splice(0, perOther))
  const total = pages.length

  const streams = pages.map((pageRows, p) => {
    const ops: string[] = []
    const text = (
      x: number,
      y: number,
      s: string,
      font: "F1" | "F2",
      size: number,
      rgb = "0.1 0.1 0.1",
    ) =>
      ops.push(
        `BT ${rgb} rg /${font} ${size} Tf ${x.toFixed(1)} ${y.toFixed(1)} Td (${esc(s)}) Tj ET`,
      )
    let top = otherTop
    if (p === 0) {
      text(M, H - M - 18, title, "F2", 18)
      text(M, H - M - 36, subtitle, "F1", 10, "0.35 0.35 0.35")
      text(M, H - M - 50, note, "F1", 9, "0.55 0.2 0.2")
      top = firstTop
    }
    // header band
    ops.push(
      `0.95 0.95 0.94 rg ${M} ${top - ROW_H + 5} ${W - M * 2} ${ROW_H} re f`,
    )
    columns.forEach((c, i) =>
      text(
        M + 6 + i * colW,
        top - 9,
        fit(c.toUpperCase(), 8, colW - 10),
        "F2",
        8,
        "0.33 0.33 0.33",
      ),
    )
    pageRows.forEach((r, ri) => {
      const y = top - (ri + 1) * ROW_H
      ops.push(`0.87 0.86 0.85 RG 0.5 w ${M} ${y + 5} m ${W - M} ${y + 5} l S`)
      r.forEach((cell, i) =>
        text(M + 6 + i * colW, y - 9, fit(cell, 9, colW - 10), "F1", 9),
      )
    })
    text(
      M,
      M,
      `Mercy Home - generated 11/05/2026 - page ${p + 1} of ${total}`,
      "F1",
      8,
      "0.5 0.5 0.5",
    )
    return ops.join("\n")
  })

  // objects: 1 catalog, 2 pages, 3 F1, 4 F2, then (page, content) pairs
  const objs: string[] = []
  const kids = pages.map((_, i) => `${5 + i * 2} 0 R`).join(" ")
  objs.push("<< /Type /Catalog /Pages 2 0 R >>")
  objs.push(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`)
  objs.push(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  )
  objs.push(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  )
  streams.forEach((st, i) => {
    objs.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`,
    )
    objs.push(`<< /Length ${st.length} >>\nstream\n${st}\nendstream`)
  })

  let out = "%PDF-1.4\n"
  const offsets: number[] = []
  objs.forEach((o, i) => {
    offsets.push(out.length)
    out += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = out.length
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`
  offsets.forEach((o) => (out += `${String(o).padStart(10, "0")} 00000 n \n`))
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new Blob([out], { type: "application/pdf" })
}
