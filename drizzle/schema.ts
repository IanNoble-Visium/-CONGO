import { decimal, integer, json, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// CongoAddressMapper Tables

// Provinces table for administrative boundaries
export const provinces = pgTable("provinces", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  population: integer("population"),
  areaSqkm: decimal("areaSqkm", { precision: 10, scale: 2 }),
  capitalCity: varchar("capitalCity", { length: 100 }),
  mappingProgress: decimal("mappingProgress", { precision: 5, scale: 2 }).default("0.00"),
  targetAddresses: integer("targetAddresses").default(0),
  completedAddresses: integer("completedAddresses").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// Communes table
export const communes = pgTable("communes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  provinceId: varchar("provinceId", { length: 64 }).references(() => provinces.id),
  population: integer("population"),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Quartiers (neighborhoods) table
export const quartiers = pgTable("quartiers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  communeId: varchar("communeId", { length: 64 }).references(() => communes.id),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const verificationStatusEnum = pgEnum("verificationStatus", ["unverified", "pending", "verified", "disputed"]);
export const dataSourceEnum = pgEnum("dataSource", ["ai_detected", "manual_survey", "crowdsourced", "imported"]);

// Main addresses table
export const addresses = pgTable("addresses", {
  id: varchar("id", { length: 64 }).primaryKey(),
  fullAddress: text("fullAddress").notNull(),
  zone: varchar("zone", { length: 50 }),
  street: varchar("street", { length: 100 }),
  doorNumber: varchar("doorNumber", { length: 20 }),
  quartier: varchar("quartier", { length: 100 }),
  commune: varchar("commune", { length: 100 }),
  provinceId: varchar("provinceId", { length: 64 }).references(() => provinces.id),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  emergencyContacts: json("emergencyContacts"), // {police: "+243...", fire: "+243...", ambulance: "+243..."}
  serviceIcons: json("serviceIcons"), // ["police", "fire", "hospital", "school"]
  verificationStatus: verificationStatusEnum("verificationStatus").default("unverified"),
  confidenceScore: decimal("confidenceScore", { precision: 3, scale: 2 }).default("0.00"),
  dataSource: dataSourceEnum("dataSource").default("manual_survey"),
  createdBy: varchar("createdBy", { length: 64 }).references(() => users.id),
  verifiedBy: varchar("verifiedBy", { length: 64 }).references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
  verifiedAt: timestamp("verifiedAt"),
});

export const detectionMethodEnum = pgEnum("detectionMethod", ["ai", "manual", "satellite", "survey"]);

// Buildings table for footprints
export const buildings = pgTable("buildings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  addressId: varchar("addressId", { length: 64 }).references(() => addresses.id),
  detectionMethod: detectionMethodEnum("detectionMethod").default("manual"),
  confidenceScore: decimal("confidenceScore", { precision: 3, scale: 2 }).default("0.00"),
  buildingType: varchar("buildingType", { length: 50 }).default("residential"), // residential, commercial, public, mixed
  floorCount: integer("floorCount").default(1),
  roofMaterial: varchar("roofMaterial", { length: 50 }),
  polygonData: json("polygonData"), // GeoJSON polygon coordinates
  createdAt: timestamp("createdAt").defaultNow(),
});

export const photoTypeEnum = pgEnum("photoType", ["street_sign", "building", "context", "survey"]);

// Photos table for street signs and building images
export const photos = pgTable("photos", {
  id: varchar("id", { length: 64 }).primaryKey(),
  addressId: varchar("addressId", { length: 64 }).references(() => addresses.id),
  url: text("url").notNull(),
  type: photoTypeEnum("type").default("survey"),
  description: text("description"),
  uploadedBy: varchar("uploadedBy", { length: 64 }).references(() => users.id),
  uploadedAt: timestamp("uploadedAt").defaultNow(),
});

export const surveyStatusEnum = pgEnum("surveyStatus", ["active", "completed", "paused"]);

// Survey sessions for field data collection
export const surveySessions = pgTable("surveySessions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  surveyorId: varchar("surveyorId", { length: 64 }).references(() => users.id),
  provinceId: varchar("provinceId", { length: 64 }).references(() => provinces.id),
  startedAt: timestamp("startedAt").defaultNow(),
  endedAt: timestamp("endedAt"),
  addressesCollected: integer("addressesCollected").default(0),
  status: surveyStatusEnum("status").default("active"),
});

export const jobTypeEnum = pgEnum("jobType", ["building_detection", "address_generation", "change_detection"]);
export const jobStatusEnum = pgEnum("jobStatus", ["pending", "processing", "completed", "failed"]);

// AI processing jobs for batch operations
export const aiProcessingJobs = pgTable("aiProcessingJobs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  jobType: jobTypeEnum("jobType").notNull(),
  status: jobStatusEnum("status").default("pending"),
  inputData: json("inputData"), // Parameters for the job
  outputData: json("outputData"), // Results from the job
  progress: decimal("progress", { precision: 5, scale: 2 }).default("0.00"),
  errorMessage: text("errorMessage"),
  createdBy: varchar("createdBy", { length: 64 }).references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow(),
  completedAt: timestamp("completedAt"),
});

// Change log for audit trail
export const changeLog = pgTable("changeLog", {
  id: varchar("id", { length: 64 }).primaryKey(),
  addressId: varchar("addressId", { length: 64 }).references(() => addresses.id),
  fieldChanged: varchar("fieldChanged", { length: 100 }).notNull(),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  changedBy: varchar("changedBy", { length: 64 }).references(() => users.id),
  changedAt: timestamp("changedAt").defaultNow(),
  reason: text("reason"),
});

// Export types
export type Province = typeof provinces.$inferSelect;
export type InsertProvince = typeof provinces.$inferInsert;
export type Commune = typeof communes.$inferSelect;
export type InsertCommune = typeof communes.$inferInsert;
export type Quartier = typeof quartiers.$inferSelect;
export type InsertQuartier = typeof quartiers.$inferInsert;
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = typeof addresses.$inferInsert;
export type Building = typeof buildings.$inferSelect;
export type InsertBuilding = typeof buildings.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;
export type SurveySession = typeof surveySessions.$inferSelect;
export type InsertSurveySession = typeof surveySessions.$inferInsert;
export type AiProcessingJob = typeof aiProcessingJobs.$inferSelect;
export type InsertAiProcessingJob = typeof aiProcessingJobs.$inferInsert;
export type ChangeLogEntry = typeof changeLog.$inferSelect;
export type InsertChangeLogEntry = typeof changeLog.$inferInsert;
