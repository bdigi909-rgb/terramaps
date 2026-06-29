CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{"units":"meters","gridSize":1,"coordinateSystem":"Lambert93","scale":1000}',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS layers (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#58a6ff' NOT NULL,
  visible BOOLEAN DEFAULT true NOT NULL,
  locked BOOLEAN DEFAULT false NOT NULL,
  "order" INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS drawing_elements (
  id SERIAL PRIMARY KEY,
  layer_id INTEGER REFERENCES layers(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  geometry JSONB NOT NULL,
  stroke VARCHAR(7) DEFAULT '#58a6ff',
  fill VARCHAR(7),
  width REAL DEFAULT 1.5,
  opacity INTEGER DEFAULT 20,
  linestyle VARCHAR(20) DEFAULT 'solid',
  label TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS symbols (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  svg_data TEXT NOT NULL,
  description TEXT
);
