function normalizeValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function createCompositeKey(row, columns) {
  const values = columns.map((column) =>
    normalizeValue(row[column])
  );

  return JSON.stringify(values);
}

export function compareRows(
  rowsA,
  rowsB,
  columnsA,
  columnsB
) {
  if (columnsA.length === 0 || columnsB.length === 0) {
    throw new Error("Pilih minimal satu kolom dari setiap file.");
  }

  if (columnsA.length !== columnsB.length) {
    throw new Error(
      "Jumlah kolom File A dan File B harus sama."
    );
  }

  const availableRowsB = new Map();

  rowsB.forEach((rowB) => {
    const key = createCompositeKey(rowB, columnsB);

    if (!availableRowsB.has(key)) {
      availableRowsB.set(key, []);
    }

    availableRowsB.get(key).push(rowB);
  });

  const matched = [];
  const unmatchedA = [];

  rowsA.forEach((rowA) => {
    const key = createCompositeKey(rowA, columnsA);
    const matchingRowsB = availableRowsB.get(key);

    if (matchingRowsB && matchingRowsB.length > 0) {
      const rowB = matchingRowsB.shift();

      matched.push({
        key,
        rowA,
        rowB,
      });
    } else {
      unmatchedA.push({
        source: "File A",
        row: rowA,
      });
    }
  });

  const unmatchedB = [];

  availableRowsB.forEach((remainingRows) => {
    remainingRows.forEach((rowB) => {
      unmatchedB.push({
        source: "File B",
        row: rowB,
      });
    });
  });

  return {
    matched,
    unmatchedA,
    unmatchedB,
    unmatched: [...unmatchedA, ...unmatchedB],
    stats: {
      totalRowsA: rowsA.length,
      totalRowsB: rowsB.length,
      matchCount: matched.length,
      mismatchCount:
        unmatchedA.length + unmatchedB.length,
    },
  };
}