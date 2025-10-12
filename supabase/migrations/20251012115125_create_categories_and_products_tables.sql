/*
  # Создание таблиц категорий и продуктов
  
  1. Новые таблицы
    - `categories` - категории продуктов
      - `id` (uuid, primary key) - уникальный идентификатор
      - `name` (text) - название категории
      - `slug` (text, unique) - URL-friendly идентификатор
      - `description` (text, nullable) - описание категории
      - `image_path` (text, nullable) - путь к изображению
      - `parent_id` (uuid, nullable) - ссылка на родительскую категорию
      - `is_active` (boolean) - активна ли категория
      - `display_order` (integer) - порядок отображения
      - `created_at` (timestamptz) - дата создания
      - `updated_at` (timestamptz) - дата обновления
    
    - `products` - продукты
      - `id` (uuid, primary key) - уникальный идентификатор
      - `name` (text) - название продукта
      - `description` (text) - описание продукта
      - `price` (numeric) - цена
      - `old_price` (numeric, nullable) - старая цена (для скидок)
      - `category_id` (uuid) - категория продукта
      - `image_path` (text, nullable) - путь к изображению
      - `stock_quantity` (integer) - количество на складе
      - `is_active` (boolean) - активен ли продукт
      - `is_featured` (boolean) - избранный товар
      - `weight` (numeric, nullable) - вес продукта
      - `unit` (text) - единица измерения
      - `created_at` (timestamptz) - дата создания
      - `updated_at` (timestamptz) - дата обновления
  
  2. Безопасность
    - Включен RLS для обеих таблиц
    - Добавлены политики для публичного чтения активных записей
  
  3. Индексы
    - Индекс на slug для быстрого поиска категорий
    - Индекс на category_id для фильтрации продуктов
    - Индекс на is_active для обеих таблиц
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_path text,
  parent_id uuid REFERENCES categories(id),
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10, 2) NOT NULL,
  old_price numeric(10, 2),
  category_id uuid NOT NULL REFERENCES categories(id),
  image_path text,
  stock_quantity integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  weight numeric(10, 2),
  unit text DEFAULT 'g',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
