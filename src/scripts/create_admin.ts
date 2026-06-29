import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const hash = await bcrypt.hash("Admin2026!", 10);
  await pool.query(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
    ["Administrateur", "admin@terramaps.ma", hash, "admin"]
  );
  console.log("✅ Admin créé !");
  console.log("   Email    : admin@terramaps.ma");
  console.log("   Password : Admin2026!");
  await pool.end();
}

main().catch(console.error);
