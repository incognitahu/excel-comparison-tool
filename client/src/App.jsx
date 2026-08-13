import { useState } from "react";
import Select from "react-select";
import { parseExcel } from "./utils/excelParser";
import { compareRows } from "./utils/compareRows";
import axios from "axios";
import "./App.css";


const API_URL = "http://localhost:3000/api";


function DataTable({ title, rows, headers, emptyMessage }) {
  return (
    <section className="table-section">
      <h3>{title}</h3>

      {rows.length === 0 ? (
        <p>{emptyMessage}</p>
      ) : (
        <div className="table-wrapper">
          <table className="unmatched-table">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((header) => (
                    <td key={header}>
                      {String(row[header] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function MatchedTable({ matched, headersA, headersB }) {
  return (
    <section className="table-section">
      <h3>Matched Data</h3>

      {matched.length === 0 ? (
        <p>Tidak ada data yang cocok.</p>
      ) : (
        <div className="table-wrapper">
          <table className="matched-table">
            <thead>
              <tr>
                {headersA.map((header) => (
                  <th key={`a-${header}`}>
                    File A - {header}
                  </th>
                ))}

                {headersB.map((header) => (
                  <th key={`b-${header}`}>
                    File B - {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {matched.map((item, rowIndex) => (
                <tr key={`${item.key}-${rowIndex}`}>
                  {headersA.map((header) => (
                    <td key={`a-${header}`}>
                      {String(item.rowA[header] ?? "")}
                    </td>
                  ))}

                  {headersB.map((header) => (
                    <td key={`b-${header}`}>
                      {String(item.rowB[header] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function App() {
  const [fileAData, setFileAData] = useState(null);
  const [fileBData, setFileBData] = useState(null);

  const [sheetA, setSheetA] = useState("");
  const [sheetB, setSheetB] = useState("");

  const [columnsA, setColumnsA] = useState([]);
  const [columnsB, setColumnsB] = useState([]);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [fileAId, setFileAId] = useState(null);
  const [fileBId, setFileBId] = useState(null);
  const [databaseMessage, setDatabaseMessage] = useState("");

  const columnOptionsA =
    fileAData && sheetA
      ? fileAData.sheets[sheetA].headers.map((header) => ({
          value: header,
          label: header,
        }))
      : [];

  const columnOptionsB =
    fileBData && sheetB
      ? fileBData.sheets[sheetB].headers.map((header) => ({
          value: header,
          label: header,
        }))
      : [];

  const pairIsValid =
    Boolean(fileAData) &&
    Boolean(fileBData) &&
    Number.isInteger(fileAId) &&
    Number.isInteger(fileBId) &&
    Boolean(sheetA) &&
    Boolean(sheetB) &&
    columnsA.length > 0 &&
    columnsA.length === columnsB.length;

  async function handleFileA(event) {
    const file = event.target.files[0];

    if (!file) return;

    try {
      setError("");
      setDatabaseMessage("");
      setResult(null);
      setFileAId(null);

      const parsedFile = await parseExcel(file);

      if (parsedFile.sheetNames.length === 0) {
        throw new Error("File A tidak memiliki sheet.");
      }

      const response = await axios.post(
        `${API_URL}/uploads`,
        {
          filename: parsedFile.filename,
          totalSheets: parsedFile.sheetNames.length,
        }
      );

      setFileAData(parsedFile);
      setSheetA(parsedFile.sheetNames[0]);
      setColumnsA([]);
      setFileAId(response.data.fileId);
    } catch (err) {
      console.error(err);

      setFileAData(null);
      setFileAId(null);
      setSheetA("");
      setColumnsA([]);
      setResult(null);

      setError(
        err.response?.data?.message ||
          err.message ||
          "File A gagal dibaca."
      );
    }
  }

  async function handleFileB(event) {
    const file = event.target.files[0];

    if (!file) return;

    try {
      setError("");
      setDatabaseMessage("");
      setResult(null);
      setFileBId(null);

      const parsedFile = await parseExcel(file);

      if (parsedFile.sheetNames.length === 0) {
        throw new Error("File B tidak memiliki sheet.");
      }

      const response = await axios.post(
        `${API_URL}/uploads`,
        {
          filename: parsedFile.filename,
          totalSheets: parsedFile.sheetNames.length,
        }
      );

      setFileBData(parsedFile);
      setSheetB(parsedFile.sheetNames[0]);
      setColumnsB([]);
      setFileBId(response.data.fileId);
    } catch (err) {
      console.error(err);

      setFileBData(null);
      setFileBId(null);
      setSheetB("");
      setColumnsB([]);
      setResult(null);

      setError(
        err.response?.data?.message ||
          err.message ||
          "File B gagal dibaca."
      );
    }
  }

  function handleSheetAChange(event) {
    setSheetA(event.target.value);
    setColumnsA([]);
    setResult(null);
    setError("");
  }

  function handleSheetBChange(event) {
    setSheetB(event.target.value);
    setColumnsB([]);
    setResult(null);
    setError("");
  }

  function handleColumnsAChange(selectedOptions) {
    const selectedColumns = (selectedOptions ?? []).map(
      (option) => option.value
    );

    setColumnsA(selectedColumns);
    setResult(null);
    setError("");
  }

  function handleColumnsBChange(selectedOptions) {
    const selectedColumns = (selectedOptions ?? []).map(
      (option) => option.value
    );

    setColumnsB(selectedColumns);
    setResult(null);
    setError("");
  }

  async function handleCompare() {
    setError("");
    setDatabaseMessage("");
    setResult(null);

    let comparisonResult;

    try {
      if (!pairIsValid) {
        throw new Error(
          "Pilih jumlah kolom yang sama dari File A dan File B."
        );
      }

      const rowsA = fileAData.sheets[sheetA].rows;
      const rowsB = fileBData.sheets[sheetB].rows;

      comparisonResult = compareRows(
        rowsA,
        rowsB,
        columnsA,
        columnsB
      );

      setResult(comparisonResult);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to compare data.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/comparisons`,
        {
          fileAId,
          fileBId,
          selectedSheetA: sheetA,
          selectedSheetB: sheetB,
          selectedColumnsA: columnsA,
          selectedColumnsB: columnsB,
          matchCount: comparisonResult.stats.matchCount,
          mismatchCount:
            comparisonResult.stats.mismatchCount,
        }
      );

      setDatabaseMessage(
        `Comparison log saved. ID: ${response.data.comparisonId}.`
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Result displayed, but failed to save the database log."
      );
    }
  }

  const headersA =
    fileAData && sheetA
      ? fileAData.sheets[sheetA].headers
      : [];

  const headersB =
    fileBData && sheetB
      ? fileBData.sheets[sheetB].headers
      : [];

  const unmatchedRowsA = result
    ? result.unmatchedA.map((item) => item.row)
    : [];

  const unmatchedRowsB = result
    ? result.unmatchedB.map((item) => item.row)
    : [];

  return (
    <main className="container py-4">
      <header className="page-header">
        <div>
          <h1>Excel Comparison</h1>
          <p>Compare data between two Excel files.</p>
        </div>
      </header>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <section className="file-container">
        {/* FILE A */}
        <div className="file-panel">
          <h2>File A</h2>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileA}
          />

          {fileAData && (
            <>
              <p>
                <strong>File:</strong> {fileAData.filename}
              </p>

              <label htmlFor="sheet-a">Pilih Sheet</label>

              <select
                id="sheet-a"
                value={sheetA}
                onChange={handleSheetAChange}
              >
                {fileAData.sheetNames.map((sheetName) => (
                  <option key={sheetName} value={sheetName}>
                    {sheetName}
                  </option>
                ))}
              </select>

              {sheetA && (
                <>
                  <p>
                    Total baris:{" "}
                    {fileAData.sheets[sheetA].rows.length}
                  </p>

                  <label htmlFor="columns-a">
                    Pilih Kolom File A
                  </label>

                  <Select
                    inputId="columns-a"
                    isMulti
                    closeMenuOnSelect={false}
                    options={columnOptionsA}
                    value={columnOptionsA.filter((option) =>
                      columnsA.includes(option.value)
                    )}
                    onChange={handleColumnsAChange}
                    placeholder="Pilih satu atau lebih kolom"
                    noOptionsMessage={() =>
                      "Kolom tidak tersedia"
                    }
                  />

                  <p>
                    Kolom terpilih: {columnsA.length}
                  </p>
                </>
              )}
            </>
          )}
        </div>

        {/* FILE B */}
        <div className="file-panel">
          <h2>File B</h2>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileB}
          />

          {fileBData && (
            <>
              <p>
                <strong>File:</strong> {fileBData.filename}
              </p>

              <label htmlFor="sheet-b">Pilih Sheet</label>

              <select
                id="sheet-b"
                value={sheetB}
                onChange={handleSheetBChange}
              >
                {fileBData.sheetNames.map((sheetName) => (
                  <option key={sheetName} value={sheetName}>
                    {sheetName}
                  </option>
                ))}
              </select>

              {sheetB && (
                <>
                  <p>
                    Total baris:{" "}
                    {fileBData.sheets[sheetB].rows.length}
                  </p>

                  <label htmlFor="columns-b">
                    Pilih Kolom File B
                  </label>

                  <Select
                    inputId="columns-b"
                    isMulti
                    closeMenuOnSelect={false}
                    options={columnOptionsB}
                    value={columnOptionsB.filter((option) =>
                      columnsB.includes(option.value)
                    )}
                    onChange={handleColumnsBChange}
                    placeholder="Pilih satu atau lebih kolom"
                    noOptionsMessage={() =>
                      "Kolom tidak tersedia"
                    }
                  />

                  <p>
                    Kolom terpilih: {columnsB.length}
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {fileAData &&
        fileBData &&
        columnsA.length === 0 &&
        columnsB.length === 0 && (
          <p className="success">
            Kedua file berhasil dibaca. Silakan pilih kolom
            yang akan dipasangkan.
          </p>
        )}

      {columnsA.length > 0 &&
        columnsB.length > 0 &&
        columnsA.length !== columnsB.length && (
          <p className="warning">
            Jumlah kolom File A dan File B harus sama.
          </p>
        )}

      {pairIsValid && (
        <div className="success">
          <p>
            Pasangan kolom valid. Urutan pasangan:
          </p>

          <ol>
            {columnsA.map((columnA, index) => (
              <li key={`${columnA}-${columnsB[index]}`}>
                {columnA} ↔ {columnsB[index]}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="compare-area">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!pairIsValid}
          onClick={handleCompare}
        >
          Run Comparison
        </button>

        {databaseMessage && (
          <div
            className="alert alert-success comparison-status"
            role="status"
          >
            {databaseMessage}
          </div>
        )}
      </div>

      {result && (
        <section className="result-section">
          <h2>Hasil Perbandingan</h2>

          <div className="summary-grid">
            <article className="summary-card">
              <span>Total Baris File A</span>
              <strong>{result.stats.totalRowsA}</strong>
            </article>

            <article className="summary-card">
              <span>Total Baris File B</span>
              <strong>{result.stats.totalRowsB}</strong>
            </article>

            <article className="summary-card match-card">
              <span>Data Match</span>
              <strong>{result.stats.matchCount}</strong>
            </article>

            <article className="summary-card mismatch-card">
              <span>Data Unmatched</span>
              <strong>{result.stats.mismatchCount}</strong>
            </article>
          </div>

          <MatchedTable
            matched={result.matched}
            headersA={headersA}
            headersB={headersB}
          />

          <DataTable
            title={`Unmatched Data File A (${unmatchedRowsA.length})`}
            rows={unmatchedRowsA}
            headers={headersA}
            emptyMessage="Semua baris File A memiliki pasangan."
          />

          <DataTable
            title={`Unmatched Data File B (${unmatchedRowsB.length})`}
            rows={unmatchedRowsB}
            headers={headersB}
            emptyMessage="Semua baris File B memiliki pasangan."
          />
        </section>
      )}
    </main>
  );
}

export default App;