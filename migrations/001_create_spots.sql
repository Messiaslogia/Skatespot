-- Crie o banco (ajuste o nome se quiser)
CREATE DATABASE IF NOT EXISTS skatespots
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE skatespots;

-- Tabela de spots
CREATE TABLE IF NOT EXISTS spots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  category VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice simples (poderia ser SPATIAL em versões específicas, mas esse já ajuda)
CREATE INDEX idx_lat_lng ON spots (lat, lng);
