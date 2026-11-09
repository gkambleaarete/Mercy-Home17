// Minimal, dependency-free ZIP writer (STORED/uncompressed entries only).
// Good enough for bundling a handful of small text files for download
// without pulling in a library like JSZip — every entry is written
// uncompressed, which keeps the format trivial while still producing a
// standard .zip that Explorer/Finder/7-Zip/WinRAR all open natively.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date: Date) {
  const time =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    (date.getSeconds() >> 1);
  const dosDate =
    ((date.getFullYear() - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();
  return { time, dosDate };
}

export interface ZipFile {
  name: string;
  content: string;
}

export function createZip(files: ZipFile[]): Blob {
  const encoder = new TextEncoder();
  const { time, dosDate } = dosDateTime(new Date());
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const dataBytes = encoder.encode(file.content);
    const crc = crc32(dataBytes);

    const localHeader = new DataView(new ArrayBuffer(30));
    localHeader.setUint32(0, 0x04034b50, true);
    localHeader.setUint16(4, 20, true);
    localHeader.setUint16(6, 0, true);
    localHeader.setUint16(8, 0, true);
    localHeader.setUint16(10, time, true);
    localHeader.setUint16(12, dosDate, true);
    localHeader.setUint32(14, crc, true);
    localHeader.setUint32(18, dataBytes.length, true);
    localHeader.setUint32(22, dataBytes.length, true);
    localHeader.setUint16(26, nameBytes.length, true);
    localHeader.setUint16(28, 0, true);

    localParts.push(new Uint8Array(localHeader.buffer), nameBytes, dataBytes);

    const centralHeader = new DataView(new ArrayBuffer(46));
    centralHeader.setUint32(0, 0x02014b50, true);
    centralHeader.setUint16(4, 20, true);
    centralHeader.setUint16(6, 20, true);
    centralHeader.setUint16(8, 0, true);
    centralHeader.setUint16(10, 0, true);
    centralHeader.setUint16(12, time, true);
    centralHeader.setUint16(14, dosDate, true);
    centralHeader.setUint32(16, crc, true);
    centralHeader.setUint32(20, dataBytes.length, true);
    centralHeader.setUint32(24, dataBytes.length, true);
    centralHeader.setUint16(28, nameBytes.length, true);
    centralHeader.setUint16(30, 0, true);
    centralHeader.setUint16(32, 0, true);
    centralHeader.setUint16(34, 0, true);
    centralHeader.setUint16(36, 0, true);
    centralHeader.setUint32(38, 0, true);
    centralHeader.setUint32(42, offset, true);

    centralParts.push(new Uint8Array(centralHeader.buffer), nameBytes);

    offset += localHeader.byteLength + nameBytes.length + dataBytes.length;
  });

  const centralOffset = offset;
  const centralSize = centralParts.reduce((sum, p) => sum + p.length, 0);

  const endRecord = new DataView(new ArrayBuffer(22));
  endRecord.setUint32(0, 0x06054b50, true);
  endRecord.setUint16(4, 0, true);
  endRecord.setUint16(6, 0, true);
  endRecord.setUint16(8, files.length, true);
  endRecord.setUint16(10, files.length, true);
  endRecord.setUint32(12, centralSize, true);
  endRecord.setUint32(16, centralOffset, true);
  endRecord.setUint16(20, 0, true);

  return new Blob(
    [...localParts, ...centralParts, new Uint8Array(endRecord.buffer)],
    { type: "application/zip" },
  );
}
