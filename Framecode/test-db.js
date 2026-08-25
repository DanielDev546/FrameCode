
import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

try {
	const result = await sql.query(
		`SELECT
			"id",
			"user_id",
			"template_id",
			"name",
			"slug",
			"framework",
			"repo_url",
			"deploy_url",
			"status",
			"meter_score",
			"meter_data",
			"created_at",
			"updated_at"
		FROM "projects"
		WHERE "user_id" = $1
		ORDER BY "updated_at" DESC`,
		["0e95afad-70fc-4043-8be0-b8313ee2f29f"]
	);

	console.log("DATABASE QUERY SUCCESS:");
	console.log(result);
} catch (error) {
	console.error("DATABASE QUERY FAILED:");
	console.error(error);
	console.error("CAUSE:");
	console.error(error?.cause);
}