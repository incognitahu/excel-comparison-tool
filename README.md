# Excel Comparison Tool

Aplikasi web untuk membandingkan data dari dua file Excel berdasarkan satu atau beberapa pasangan kolom.

## Fitur

- Upload dua file `.xlsx` atau `.xls`
- Membaca sheet dan header kolom secara dinamis
- Memilih beberapa pasangan kolom
- Membandingkan data menggunakan composite key
- Menampilkan statistik matched dan unmatched
- Menampilkan tabel matched dan unmatched
- Menyimpan riwayat upload dan perbandingan ke MySQL

## Teknologi

- React + Vite
- SheetJS/XLSX
- React Select
- Bootstrap
- Node.js + Express
- MySQL/MariaDB

## Cara Menjalankan

Repository: [github.com/incognitahu/excel-comparison-tool](https://github.com/incognitahu/excel-comparison-tool)

### 0. Clone Repository

Clone project dari GitHub, lalu masuk ke folder project:

```bash
git clone https://github.com/incognitahu/excel-comparison-tool.git
cd excel-comparison-tool
```

### 1. Database

Jalankan Apache dan MySQL melalui XAMPP, lalu buka:

```text
http://localhost/phpmyadmin
```

Import file `schema.sql` yang tersedia di folder utama project.

### 2. Konfigurasi Backend

Buat file `server/.env` berdasarkan `server/.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=excel_comparison
```

### 3. Jalankan Backend

```bash
cd server
npm install
npm start
```

Backend berjalan di:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

### 4. Jalankan Frontend

Buka terminal lain:

```bash
cd client
npm install
npm run dev
```

Frontend biasanya berjalan di:

```text
http://localhost:5173
```

## Cara Menggunakan

1. Upload File A dan File B.
2. Pilih sheet dari masing-masing file.
3. Pilih jumlah kolom yang sama dari kedua file.
4. Perhatikan urutan pasangan kolom.
5. Tekan **Run Comparison**.
6. Hasil dan statistik akan ditampilkan serta disimpan ke database.

## Struktur Database

- `file_uploads`: menyimpan riwayat file yang dipilih.
- `comparison_logs`: menyimpan sheet, pasangan kolom, dan statistik hasil perbandingan.

## Author

- Nama: Liong, Elvin Clementius Edison
- NIM: 2702232504