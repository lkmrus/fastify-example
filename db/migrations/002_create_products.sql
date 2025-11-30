CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price > 0),
  stock INTEGER DEFAULT 0 NOT NULL CHECK (stock >= 0),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

