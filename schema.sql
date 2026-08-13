CREATE DATABASE IF NOT EXISTS excel_comparison;

USE excel_comparison;

CREATE TABLE IF NOT EXISTS file_uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    total_sheets INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comparison_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_a_id INT NOT NULL,
    file_b_id INT NOT NULL,
    selected_sheet_a VARCHAR(100) NOT NULL,
    selected_sheet_b VARCHAR(100) NOT NULL,
    selected_columns_a TEXT NOT NULL,
    selected_columns_b TEXT NOT NULL,
    match_count INT NOT NULL,
    mismatch_count INT NOT NULL,
    compared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comparison_file_a
        FOREIGN KEY (file_a_id)
        REFERENCES file_uploads(id),

    CONSTRAINT fk_comparison_file_b
        FOREIGN KEY (file_b_id)
        REFERENCES file_uploads(id)
);