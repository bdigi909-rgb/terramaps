import { neon } from "@neondatabase/serverless";

const sql = neon("postgresql://neondb_owner:npg_ml92NbZqoXcV@ep-wandering-band-abyqg37g.eu-west-2.aws.neon.tech/neondb?sslmode=require");

const result = await sql`
  DELETE FROM survey_points
  WHERE id NOT IN (
    SELECT MAX(id)
    FROM survey_points
    GROUP BY name, code, project_id
  )
`;
console.log("Points supprimes:", result);
