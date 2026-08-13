import express from "express";
import cors from "cors";
import "dotenv/config";
import pool from "./db.js";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Excel Comparison API",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      success: true,
      message: "Server dan database berhasil terhubung.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database tidak dapat dihubungi.",
    });
  }
});

app.post("/api/uploads", async (req, res) => {
  try {
    const { filename, totalSheets } = req.body;

    if (
      typeof filename !== "string" ||
      filename.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Nama file wajib diisi.",
      });
    }

    if (
      !Number.isInteger(totalSheets) ||
      totalSheets < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Jumlah sheet tidak valid.",
      });
    }

    const [result] = await pool.execute(
      `
        INSERT INTO file_uploads (
          filename,
          total_sheets
        )
        VALUES (?, ?)
      `,
      [filename.trim(), totalSheets]
    );

    res.status(201).json({
      success: true,
      message: "Riwayat file berhasil disimpan.",
      fileId: result.insertId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Riwayat file gagal disimpan.",
    });
  }
});

app.post("/api/comparisons", async (req, res) => {
  try {
    const {
      fileAId,
      fileBId,
      selectedSheetA,
      selectedSheetB,
      selectedColumnsA,
      selectedColumnsB,
      matchCount,
      mismatchCount,
    } = req.body;

    if (!Number.isInteger(fileAId) || fileAId < 1) {
      return res.status(400).json({
        success: false,
        message: "ID File A tidak valid.",
      });
    }

    if (!Number.isInteger(fileBId) || fileBId < 1) {
      return res.status(400).json({
        success: false,
        message: "ID File B tidak valid.",
      });
    }

    if (
      typeof selectedSheetA !== "string" ||
      typeof selectedSheetB !== "string" ||
      selectedSheetA.trim() === "" ||
      selectedSheetB.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Sheet yang dipilih tidak valid.",
      });
    }

    if (
      !Array.isArray(selectedColumnsA) ||
      !Array.isArray(selectedColumnsB) ||
      selectedColumnsA.length === 0 ||
      selectedColumnsA.length !== selectedColumnsB.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Pasangan kolom tidak valid.",
      });
    }

    if (
      !Number.isInteger(matchCount) ||
      !Number.isInteger(mismatchCount) ||
      matchCount < 0 ||
      mismatchCount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Statistik perbandingan tidak valid.",
      });
    }

    const [result] = await pool.execute(
      `
        INSERT INTO comparison_logs (
          file_a_id,
          file_b_id,
          selected_sheet_a,
          selected_sheet_b,
          selected_columns_a,
          selected_columns_b,
          match_count,
          mismatch_count
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        fileAId,
        fileBId,
        selectedSheetA.trim(),
        selectedSheetB.trim(),
        JSON.stringify(selectedColumnsA),
        JSON.stringify(selectedColumnsB),
        matchCount,
        mismatchCount,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Log perbandingan berhasil disimpan.",
      comparisonId: result.insertId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Log perbandingan gagal disimpan.",
    });
  }
});

app.listen(port, () => {
  console.log(
    `Server berjalan di http://localhost:${port}`
  );
});