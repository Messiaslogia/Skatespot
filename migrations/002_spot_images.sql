USE skatespots;

CREATE TABLE IF NOT EXISTS spot_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  spot_id INT NOT NULL,
  url VARCHAR(255) NOT NULL,   -- caminho relativo, ex: 'uploads/spots/roosevelt-1.jpg'
  sort_order TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_spot_images_spot
    FOREIGN KEY (spot_id) REFERENCES spots(id)
    ON DELETE CASCADE
);
CREATE INDEX idx_spot_images_spot ON spot_images(spot_id, sort_order);