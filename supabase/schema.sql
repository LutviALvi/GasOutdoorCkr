-- =============================================
-- SUPABASE SQL SCHEMA FOR GASOUTDOOR (COMPLETE)
-- Copy and paste this into Supabase SQL Editor
-- =============================================

-- =============================================
-- CORE TABLES
-- =============================================

-- 1. Categories Table (NEW - untuk standarisasi kategori)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  category TEXT NOT NULL, -- Keep for backward compatibility
  price_per_day DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_per_trip DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BOOKING & PAYMENT TABLES
-- =============================================

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE, -- Nomor order yang mudah dibaca
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT,
  customer_identity TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_code TEXT,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  booking_status TEXT DEFAULT 'pending', -- pending, confirmed, active, completed, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Booking Items Table
CREATE TABLE IF NOT EXISTS booking_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_per_trip DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Payments Table (NEW - detail transaksi pembayaran)
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  transaction_id TEXT, -- ID dari Midtrans
  order_id TEXT, -- Order ID yang dikirim ke Midtrans
  payment_type TEXT, -- 'qris', 'gopay', 'shopeepay', 'dana'
  gross_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, settlement, expire, cancel, deny, refund
  status_message TEXT,
  snap_token TEXT,
  snap_redirect_url TEXT,
  midtrans_response JSONB, -- Raw response dari Midtrans
  paid_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ADMIN & PROMO TABLES
-- =============================================

-- 7. Discount Codes Table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  description TEXT,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin', -- admin, superadmin
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Settings Table (NEW - pengaturan aplikasi)
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Activity Logs Table (NEW - audit trail admin)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login'
  entity_type TEXT, -- 'product', 'booking', 'discount', etc
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SEED DATA - Categories
-- =============================================

INSERT INTO categories (name, slug, description) VALUES
('Tenda', 'tenda', 'Berbagai jenis tenda camping'),
('Tidur', 'tidur', 'Perlengkapan tidur camping'),
('Dapur', 'dapur', 'Peralatan masak camping'),
('Penerangan', 'penerangan', 'Lampu dan penerangan'),
('Carrier', 'carrier', 'Tas gunung dan carrier'),
('Hydropack', 'hydropack', 'Tas air dan hydropack'),
('Sepatu', 'sepatu', 'Sepatu outdoor'),
('Lainnya', 'lainnya', 'Perlengkapan lainnya')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- SEED DATA - Products
-- =============================================

INSERT INTO products (slug, name, category, price_per_day, price_per_trip, stock, image, description) VALUES
('tenda-dome-2p', 'Tenda Dome 2P', 'Tenda', 30000, 100000, 8, '/images/tenda.jpg', 'Tenda dome kapasitas 2 orang, waterproof, frame fiberglass, mudah dipasang.'),
('carrier-45l', 'carrier Eiger Ecosavior 45L', 'carrier', 50000, 80000, 5, '/images/carrier.jpg', 'carrier eiger kapasitas 45 l.'),
('sleeping-bag-standar', 'Sleeping Bag Standar', 'Tidur', 15000, 50000, 20, '/images/sb.jpg', 'Sleeping bag hangat dan nyaman untuk suhu tropis.'),
('sepatu-hiking', 'sepatu Hiking', 'sepatu', 10000, 35000, 25, '/images/sepatu.jpg', 'Matras busa EVA, ringan dan empuk, ukuran standar.'),
('kompor-portable', 'Kompor Portable', 'Dapur', 20000, 70000, 15, '/images/kompor.jpg', 'Kompor portable butane, api stabil, cocok untuk memasak di alam.'),
('nesting-set', 'Nesting Set', 'Dapur', 15000, 50000, 12, '/images/nesting.jpg', 'Peralatan masak camping (panci, wajan, mangkuk) aluminium.'),
('lampu-camping-led', 'Lampu Camping LED', 'Penerangan', 10000, 35000, 18, '/images/lampu.jpg', 'Lampu LED rechargeable, terang dan hemat energi.'),
('hydropack-10l', 'hydropack Eiger 10L', 'hydropack', 12000, 40000, 20, '/images/hydropack.jpg', 'hydropack Eiger kapasitas 10 liter dengan kantong air.')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- SEED DATA - Discount Codes
-- =============================================

INSERT INTO discount_codes (code, percentage, max_uses, used_count, description, is_active) VALUES
('GASOUTDOOR10', 10, NULL, 5, 'Diskon 10% untuk semua produk', true),
('PROMO20', 20, 50, 12, 'Diskon 20% - Promo terbatas', true),
('MEMBER15', 15, NULL, 8, 'Diskon 15% untuk member', true),
('WEEKEND25', 25, NULL, 3, 'Diskon 25% untuk pemesanan akhir pekan', false)
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- SEED DATA - Admin User (password: admin123)
-- =============================================

INSERT INTO admin_users (username, password_hash, role) VALUES
('admin', 'admin123', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- =============================================
-- SEED DATA - Settings
-- =============================================

INSERT INTO settings (key, value, description) VALUES
('tax_rate', '11', 'Persentase pajak (PPN)'),
('whatsapp_number', '6281234567890', 'Nomor WhatsApp untuk konfirmasi'),
('store_address', 'Cikarang, Bekasi, Jawa Barat', 'Alamat toko'),
('store_name', 'GASOUTDOOR.CKR', 'Nama toko'),
('booking_days', 'fri,sat,sun', 'Hari yang tersedia untuk booking')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- SEED DATA - Sample Bookings (for testing)
-- =============================================

DO $$
DECLARE
  booking1_id UUID;
  booking2_id UUID;
  booking3_id UUID;
  product1_id UUID;
  product2_id UUID;
  product3_id UUID;
BEGIN
  -- Get product IDs
  SELECT id INTO product1_id FROM products WHERE slug = 'tenda-dome-2p' LIMIT 1;
  SELECT id INTO product2_id FROM products WHERE slug = 'sleeping-bag-standar' LIMIT 1;
  SELECT id INTO product3_id FROM products WHERE slug = 'kompor-portable' LIMIT 1;
  
  -- Only insert if products exist and no bookings exist yet
  IF product1_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM bookings LIMIT 1) THEN
    -- Booking 1 - Completed
    INSERT INTO bookings (customer_name, customer_phone, customer_email, customer_address, customer_identity, start_date, end_date, total_days, subtotal, discount_code, discount_amount, total, booking_status, created_at)
    VALUES ('Budi Santoso', '081234567890', 'budi@email.com', 'Jl. Cikarang Baru No. 123', '3201234567890001', '2024-12-06', '2024-12-08', 2, 200000, 'GASOUTDOOR10', 20000, 180000, 'completed', NOW() - INTERVAL '10 days')
    RETURNING id INTO booking1_id;
    
    INSERT INTO booking_items (booking_id, product_id, quantity, price_per_trip) VALUES
    (booking1_id, product1_id, 1, 100000),
    (booking1_id, product2_id, 2, 50000);
    
    -- Booking 2 - Active
    INSERT INTO bookings (customer_name, customer_phone, customer_email, customer_address, customer_identity, start_date, end_date, total_days, subtotal, discount_amount, total, booking_status, created_at)
    VALUES ('Siti Rahayu', '081298765432', 'siti@email.com', 'Perumahan Lippo Cikarang Blok A5', '3201234567890002', '2024-12-13', '2024-12-15', 2, 150000, 0, 150000, 'active', NOW() - INTERVAL '3 days')
    RETURNING id INTO booking2_id;
    
    INSERT INTO booking_items (booking_id, product_id, quantity, price_per_trip) VALUES
    (booking2_id, product2_id, 2, 50000),
    (booking2_id, product3_id, 1, 70000);
    
    -- Booking 3 - Pending
    INSERT INTO bookings (customer_name, customer_phone, customer_email, customer_address, customer_identity, start_date, end_date, total_days, subtotal, discount_amount, total, booking_status, created_at)
    VALUES ('Ahmad Wijaya', '081355544433', 'ahmad@email.com', 'Jl. Industri No. 45 Cikarang', '3201234567890003', '2024-12-20', '2024-12-22', 2, 170000, 0, 170000, 'pending', NOW() - INTERVAL '1 day')
    RETURNING id INTO booking3_id;
    
    INSERT INTO booking_items (booking_id, product_id, quantity, price_per_trip) VALUES
    (booking3_id, product1_id, 1, 100000),
    (booking3_id, product3_id, 1, 70000);
    
    -- Booking 4 - Another from Budi (repeat customer)
    INSERT INTO bookings (customer_name, customer_phone, customer_email, customer_address, customer_identity, start_date, end_date, total_days, subtotal, discount_amount, total, booking_status, created_at)
    VALUES ('Budi Santoso', '081234567890', 'budi@email.com', 'Jl. Cikarang Baru No. 123', '3201234567890001', '2024-12-27', '2024-12-29', 2, 100000, 0, 100000, 'pending', NOW())
    RETURNING id INTO booking1_id;
    
    INSERT INTO booking_items (booking_id, product_id, quantity, price_per_trip) VALUES
    (booking1_id, product1_id, 1, 100000);
  END IF;
END $$;


-- =============================================
-- Enable Row Level Security
-- =============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Categories viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Products viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Reviews viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Discounts viewable by everyone" ON discount_codes FOR SELECT USING (true);
CREATE POLICY "Settings viewable by everyone" ON settings FOR SELECT USING (true);

-- For admin operations, use service_role key which bypasses RLS
