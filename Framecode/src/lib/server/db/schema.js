import { sql } from "drizzle-orm";
import {
  text,
  integer,
  real,
  sqliteTable,
  index,
} from "drizzle-orm/sqlite-core";

// ─── USERS ────────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  avatar: text("avatar"),
  role: text("role", { enum: ["user", "admin"] })
    .notNull()
    .default("user"),
  plan: text("plan", { enum: ["free", "pro", "team"] })
    .notNull()
    .default("free"),
  provider: text("provider", { enum: ["email", "github", "google"] })
    .notNull()
    .default("email"),
  providerId: text("provider_id"),
  githubToken: text("github_token"),
  stripeId: text("stripe_customer_id"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  // Automatically handles application-level updates
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

// ─── TEMPLATES ────────────────────────────────────────────────────
export const templates = sqliteTable("templates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  framework: text("framework").notNull(),
  repoUrl: text("repo_url").notNull(),
  previewUrl: text("preview_url"),
  thumbnailUrl: text("thumbnail_url"),
  tags: text("tags"), // Consider parsing/typing this as string[] if needed
  downloads: integer("downloads").notNull().default(0),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ─── PROJECTS ─────────────────────────────────────────────────────
export const projects = sqliteTable(
  "projects",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    templateId: text("template_id").references(() => templates.id),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    framework: text("framework").notNull(),
    repoUrl: text("repo_url"),
    deployUrl: text("deploy_url"),
    status: text("status", { enum: ["draft", "dev", "live", "paused"] })
      .notNull()
      .default("draft"),
    meterScore: real("meter_score"),
    meterData: text("meter_data"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("projects_user_id_idx").on(table.userId),
  }),
);

// ─── METER RUNS ───────────────────────────────────────────────────
export const meterRuns = sqliteTable(
  "meter_runs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    url: text("url"),
    score: real("score").notNull(),
    data: text("data").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    projectIdIdx: index("meter_runs_project_id_idx").on(table.projectId),
    userIdIdx: index("meter_runs_user_id_idx").on(table.userId),
  }),
);

// ─── ACTIVITY LOG ─────────────────────────────────────────────────
export const activityLog = sqliteTable(
  "activity_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: text("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    type: text("type").notNull(),
    message: text("message").notNull(),
    meta: text("meta"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdIdx: index("activity_log_user_id_idx").on(table.userId),
    projectIdIdx: index("activity_log_project_id_idx").on(table.projectId),
  }),
);

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────
export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stripeSubId: text("stripe_subscription_id").unique(),
    plan: text("plan", { enum: ["pro", "team"] }).notNull(),
    status: text("status").notNull(),
    currentPeriodEnd: integer("current_period_end", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdIdx: index("subscriptions_user_id_idx").on(table.userId),
  }),
);
