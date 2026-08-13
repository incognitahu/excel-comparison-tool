import * as XLSX from "xlsx";

function makeUniqueHeaders(headerRow) {
  const counts = {}

  return headerRow.map((value, index) => {
    const baseHeader =
      String(value ?? '').trim() || `Column_${index + 1}`

    counts[baseHeader] = (counts[baseHeader] || 0) + 1

    return counts[baseHeader] === 1
      ? baseHeader
      : `${baseHeader}_${counts[baseHeader]}`
  })
}

export async function parseExcel(file) {
  const buffer = await file.arrayBuffer();

  const workbook = XLSX.read(buffer, {
    type: "array",
  });

  const sheets = {};

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];

    const matrix = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
    });

    const headers = makeUniqueHeaders(matrix[0] || []);

    const rows = matrix
      .slice(1)
      .filter((row) =>
        row.some(
          (value) => String(value ?? "").trim() !== ""
        )
      )
      .map((row) =>
        Object.fromEntries(
          headers.map((header, index) => [
            header,
            row[index] ?? "",
          ])
        )
      );

    sheets[sheetName] = {
      headers,
      rows,
    };
  });

  return {
    filename: file.name,
    sheetNames: workbook.SheetNames,
    sheets,
  };
}