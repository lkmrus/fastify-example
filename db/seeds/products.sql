-- Seed products data (idempotent)
INSERT INTO products (id, name, description, price, stock) VALUES
  (1, 'Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 19.99, 150),
  (2, 'Mechanical Keyboard', 'RGB mechanical keyboard with Cherry MX switches', 149.50, 75),
  (3, 'USB-C Cable', 'High-speed USB-C to USB-C cable, 2 meters', 5.75, 300),
  (4, 'Monitor Stand', 'Adjustable aluminum monitor stand', 45.00, 50),
  (5, 'Laptop Sleeve', 'Protective laptop sleeve for 15-inch laptops', 24.99, 120),
  (6, 'Webcam HD', '1080p HD webcam with built-in microphone', 89.95, 60),
  (7, 'Desk Lamp', 'LED desk lamp with adjustable brightness', 34.50, 90)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to avoid conflicts
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

