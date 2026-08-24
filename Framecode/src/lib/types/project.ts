import type { InferSelectModel } from "drizzle-orm";
import type { projects } from "$lib/server/db/schema";

export type Project = InferSelectModel<typeof projects>;
