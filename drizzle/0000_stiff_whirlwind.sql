CREATE TYPE "public"."dataSource" AS ENUM('ai_detected', 'manual_survey', 'crowdsourced', 'imported');--> statement-breakpoint
CREATE TYPE "public"."detectionMethod" AS ENUM('ai', 'manual', 'satellite', 'survey');--> statement-breakpoint
CREATE TYPE "public"."jobStatus" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."jobType" AS ENUM('building_detection', 'address_generation', 'change_detection');--> statement-breakpoint
CREATE TYPE "public"."photoType" AS ENUM('street_sign', 'building', 'context', 'survey');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."surveyStatus" AS ENUM('active', 'completed', 'paused');--> statement-breakpoint
CREATE TYPE "public"."verificationStatus" AS ENUM('unverified', 'pending', 'verified', 'disputed');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"fullAddress" text NOT NULL,
	"zone" varchar(50),
	"street" varchar(100),
	"doorNumber" varchar(20),
	"quartier" varchar(100),
	"commune" varchar(100),
	"provinceId" varchar(64),
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"emergencyContacts" json,
	"serviceIcons" json,
	"verificationStatus" "verificationStatus" DEFAULT 'unverified',
	"confidenceScore" numeric(3, 2) DEFAULT '0.00',
	"dataSource" "dataSource" DEFAULT 'manual_survey',
	"createdBy" varchar(64),
	"verifiedBy" varchar(64),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"verifiedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "aiProcessingJobs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"jobType" "jobType" NOT NULL,
	"status" "jobStatus" DEFAULT 'pending',
	"inputData" json,
	"outputData" json,
	"progress" numeric(5, 2) DEFAULT '0.00',
	"errorMessage" text,
	"createdBy" varchar(64),
	"createdAt" timestamp DEFAULT now(),
	"completedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "buildings" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"addressId" varchar(64),
	"detectionMethod" "detectionMethod" DEFAULT 'manual',
	"confidenceScore" numeric(3, 2) DEFAULT '0.00',
	"buildingType" varchar(50) DEFAULT 'residential',
	"floorCount" integer DEFAULT 1,
	"roofMaterial" varchar(50),
	"polygonData" json,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "changeLog" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"addressId" varchar(64),
	"fieldChanged" varchar(100) NOT NULL,
	"oldValue" text,
	"newValue" text,
	"changedBy" varchar(64),
	"changedAt" timestamp DEFAULT now(),
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "communes" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(10) NOT NULL,
	"provinceId" varchar(64),
	"population" integer,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"addressId" varchar(64),
	"url" text NOT NULL,
	"type" "photoType" DEFAULT 'survey',
	"description" text,
	"uploadedBy" varchar(64),
	"uploadedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "provinces" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(10) NOT NULL,
	"population" integer,
	"areaSqkm" numeric(10, 2),
	"capitalCity" varchar(100),
	"mappingProgress" numeric(5, 2) DEFAULT '0.00',
	"targetAddresses" integer DEFAULT 0,
	"completedAddresses" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "provinces_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "quartiers" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(10) NOT NULL,
	"communeId" varchar(64),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "surveySessions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"surveyorId" varchar(64),
	"provinceId" varchar(64),
	"startedAt" timestamp DEFAULT now(),
	"endedAt" timestamp,
	"addressesCollected" integer DEFAULT 0,
	"status" "surveyStatus" DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"lastSignedIn" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_provinceId_provinces_id_fk" FOREIGN KEY ("provinceId") REFERENCES "public"."provinces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_verifiedBy_users_id_fk" FOREIGN KEY ("verifiedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiProcessingJobs" ADD CONSTRAINT "aiProcessingJobs_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_addressId_addresses_id_fk" FOREIGN KEY ("addressId") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changeLog" ADD CONSTRAINT "changeLog_addressId_addresses_id_fk" FOREIGN KEY ("addressId") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changeLog" ADD CONSTRAINT "changeLog_changedBy_users_id_fk" FOREIGN KEY ("changedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communes" ADD CONSTRAINT "communes_provinceId_provinces_id_fk" FOREIGN KEY ("provinceId") REFERENCES "public"."provinces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_addressId_addresses_id_fk" FOREIGN KEY ("addressId") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_uploadedBy_users_id_fk" FOREIGN KEY ("uploadedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quartiers" ADD CONSTRAINT "quartiers_communeId_communes_id_fk" FOREIGN KEY ("communeId") REFERENCES "public"."communes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveySessions" ADD CONSTRAINT "surveySessions_surveyorId_users_id_fk" FOREIGN KEY ("surveyorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveySessions" ADD CONSTRAINT "surveySessions_provinceId_provinces_id_fk" FOREIGN KEY ("provinceId") REFERENCES "public"."provinces"("id") ON DELETE no action ON UPDATE no action;