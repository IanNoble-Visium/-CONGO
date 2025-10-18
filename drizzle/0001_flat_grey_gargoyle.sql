CREATE TABLE "trainingModuleImages" (
	"moduleId" varchar(64) NOT NULL,
	"pageIndex" integer NOT NULL,
	"url" text NOT NULL,
	"provider" varchar(32) DEFAULT 'openai',
	"prompt" text,
	"publicId" varchar(256),
	"createdAt" timestamp DEFAULT now(),
	CONSTRAINT "trainingModuleImages_moduleId_pageIndex_pk" PRIMARY KEY("moduleId","pageIndex")
);
--> statement-breakpoint
CREATE TABLE "trainingProgress" (
	"userId" varchar(64) NOT NULL,
	"moduleId" varchar(64) NOT NULL,
	"lastPage" integer DEFAULT 0,
	"completedPages" integer DEFAULT 0,
	"totalPages" integer DEFAULT 0,
	"quizScores" json,
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "trainingProgress_userId_moduleId_pk" PRIMARY KEY("userId","moduleId")
);
--> statement-breakpoint
ALTER TABLE "trainingProgress" ADD CONSTRAINT "trainingProgress_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;