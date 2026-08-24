import {
  pgTable,
  text,
  integer,
  timestamp,
  real,
  boolean,
  index,
} from "drizzle-orm/pg-core";

// ─── USERS ────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  name: text("name").notNull(),

  username: text("username").unique(),

  email: text("email").notNull().unique(),

  passwordHash: text("password_hash"),

  avatar: text("avatar"),

  bio: text("bio"),

  website: text("website"),

  location: text("location"),

  role: text("role", {
    enum: ["user", "admin"],
  })
    .notNull()
    .default("user"),

  plan: text("plan", {
    enum: ["free", "pro", "team"],
  })
    .notNull()
    .default("free"),

  provider: text("provider", {
    enum: ["email", "github", "google"],
  })
    .notNull()
    .default("email"),

  providerId: text("provider_id"),

  githubToken: text("github_token"),

  githubUsername: text("github_username"),

  stripeId: text("stripe_customer_id"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ─── TEMPLATES ────────────────────────────────────────────────────
export const templates = pgTable("templates", {
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

  tags: text("tags"),

  downloads: integer("downloads").notNull().default(0),

  featured: boolean("featured").notNull().default(false),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

// ─── PROJECTS ─────────────────────────────────────────────────────
export const projects = pgTable(
  "projects",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    templateId: text("template_id").references(() => templates.id),

    name: text("name").notNull(),

    slug: text("slug").notNull(),

    framework: text("framework").notNull(),

    repoUrl: text("repo_url"),

    deployUrl: text("deploy_url"),

    status: text("status", {
      enum: ["draft", "dev", "live", "paused"],
    })
      .notNull()
      .default("draft"),

    meterScore: real("meter_score"),

    meterData: text("meter_data"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },

  (table) => ({
    userIdIdx: index("projects_user_id_idx").on(table.userId),
  }),
);

// ─── METER RUNS ───────────────────────────────────────────────────
export const meterRuns = pgTable(
  "meter_runs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, {
        onDelete: "cascade",
      }),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    url: text("url"),

    score: real("score").notNull(),

    data: text("data").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => ({
    projectIdIdx: index("meter_runs_project_id_idx").on(table.projectId),

    userIdIdx: index("meter_runs_user_id_idx").on(table.userId),
  }),
);

// ─── ACTIVITY LOG ─────────────────────────────────────────────────
export const activityLog = pgTable(
  "activity_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    projectId: text("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),

    type: text("type").notNull(),

    message: text("message").notNull(),

    meta: text("meta"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => ({
    userIdIdx: index("activity_log_user_id_idx").on(table.userId),

    projectIdIdx: index("activity_log_project_id_idx").on(table.projectId),
  }),
);

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    stripeSubId: text("stripe_subscription_id").unique(),

    plan: text("plan", {
      enum: ["pro", "team"],
    }).notNull(),

    status: text("status").notNull(),

    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },

  (table) => ({
    userIdIdx: index("subscriptions_user_id_idx").on(table.userId),
  }),
);
