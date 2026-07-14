import {
  pgTable,
  serial,
  text,
  real,
  integer,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "active",
  "review",
  "completed",
  "archived",
]);

export const projectTypeEnum = pgEnum("project_type", [
  "road_design",
  "terrain_modeling",
  "survey",
  "drainage",
  "parcel",
  "infrastructure",
]);

export const alignmentTypeEnum = pgEnum("alignment_type", [
  "horizontal",
  "vertical",
  "combined",
]);

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: projectTypeEnum("type").notNull().default("road_design"),
  status: projectStatusEnum("status").notNull().default("draft"),
  client: text("client"),
  location: text("location"),
  epsgCode: text("epsg_code").default("4326"),
  clientEmail: text("client_email"),
  company: text("company"),
  assignedTo: integer("assigned_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Survey points (terrain points / control points)
export const surveyPoints = pgTable("survey_points", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name"),
  code: text("code"),
  x: real("x").notNull(),
  y: real("y").notNull(),
  z: real("z").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Alignments (road axes, etc.)
export const alignments = pgTable("alignments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  type: alignmentTypeEnum("type").notNull().default("horizontal"),
  description: text("description"),
  totalLength: real("total_length"),
  // GeoJSON-like geometry stored as JSONB
  geometry: jsonb("geometry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Alignment elements (straight, circular arc, clothoid)
export const alignmentElements = pgTable("alignment_elements", {
  id: serial("id").primaryKey(),
  alignmentId: integer("alignment_id")
    .references(() => alignments.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order").notNull(),
  elementType: text("element_type").notNull(), // 'straight' | 'arc' | 'clothoid'
  startStation: real("start_station"),
  endStation: real("end_station"),
  startX: real("start_x"),
  startY: real("start_y"),
  endX: real("end_x"),
  endY: real("end_y"),
  radius: real("radius"),
  parameter: real("parameter"), // clothoid parameter A
  length: real("length"),
  bearing: real("bearing"),
});

// Cross sections
export const crossSections = pgTable("cross_sections", {
  id: serial("id").primaryKey(),
  alignmentId: integer("alignment_id")
    .references(() => alignments.id, { onDelete: "cascade" })
    .notNull(),
  station: real("station").notNull(),
  cutArea: real("cut_area"),
  fillArea: real("fill_area"),
  cutVolume: real("cut_volume"),
  fillVolume: real("fill_volume"),
  profileData: jsonb("profile_data"), // left/right offset + elevation pairs
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// DTM (Digital Terrain Model) triangles
export const dtmTriangles = pgTable("dtm_triangles", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  p1x: real("p1x").notNull(),
  p1y: real("p1y").notNull(),
  p1z: real("p1z").notNull(),
  p2x: real("p2x").notNull(),
  p2y: real("p2y").notNull(),
  p2z: real("p2z").notNull(),
  p3x: real("p3x").notNull(),
  p3y: real("p3y").notNull(),
  p3z: real("p3z").notNull(),
});

// Contour lines
export const contourLines = pgTable("contour_lines", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  elevation: real("elevation").notNull(),
  isMajor: boolean("is_major").default(false),
  geometry: jsonb("geometry"), // array of {x, y} points
});

// Volume reports
export const volumeReports = pgTable("volume_reports", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  alignmentId: integer("alignment_id").references(() => alignments.id),
  name: text("name").notNull(),
  totalCut: real("total_cut"),
  totalFill: real("total_fill"),
  netVolume: real("net_volume"),
  reportData: jsonb("report_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Layers (drawing layers like CAD)
export const layers = pgTable("layers", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  color: text("color").default("#3b82f6"),
  lineType: text("line_type").default("solid"),
  lineWidth: real("line_width").default(1),
  visible: boolean("visible").default(true),
  locked: boolean("locked").default(false),
});

// Drawing entities (lines, polylines, arcs, text on canvas)
export const entities = pgTable("entities", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  layerId: integer("layer_id").references(() => layers.id),
  entityType: text("entity_type").notNull(), // 'line' | 'polyline' | 'arc' | 'circle' | 'text' | 'point'
  geometry: jsonb("geometry").notNull(),
  properties: jsonb("properties"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('agent'),
  company: text('company'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  userName: text('user_name'),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: integer('entity_id'),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('info'),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const devis = pgTable("devis", {
  id: serial("id").primaryKey(),
  numero: text("numero").notNull(),
  date: text("date").notNull(),
  client: text("client"),
  clientAdresse: text("client_adresse"),
  clientTel: text("client_tel"),
  clientEmail: text("client_email"),
  company: text("company"),
  assignedTo: integer("assigned_to"),
  projet: text("projet"),
  sousTotal: real("sous_total").default(0),
  tva: real("tva").default(20),
  total: real("total").default(0),
  statut: text("statut").default("en_attente"),
  lignes: text("lignes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const factures = pgTable("factures", {
  id: serial("id").primaryKey(),
  numero: text("numero").notNull(),
  date: text("date").notNull(),
  devisRef: text("devis_ref"),
  client: text("client"),
  clientAdresse: text("client_adresse"),
  clientTel: text("client_tel"),
  clientEmail: text("client_email"),
  company: text("company"),
  assignedTo: integer("assigned_to"),
  projet: text("projet"),
  sousTotal: real("sous_total").default(0),
  tva: real("tva").default(20),
  timbre: real("timbre").default(20),
  total: real("total").default(0),
  statut: text("statut").default("non_payee"),
  modePaiement: text("mode_paiement"),
  lignes: text("lignes"),
  createdAt: timestamp("created_at").defaultNow(),
});
