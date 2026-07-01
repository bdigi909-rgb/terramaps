import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function main() {
  await pool.query("INSERT INTO notifications (user_id, title, message, type) VALUES (1, 'Bienvenue sur TerraMaps !', 'Votre compte admin est configuré et prêt.', 'success')");
  await pool.query("INSERT INTO notifications (user_id, title, message, type) VALUES (1, 'Nouveau projet créé', 'RN9 — Déviation de Béni Mellal a été créé avec succès.', 'info')");
  await pool.query("INSERT INTO notifications (user_id, title, message, type) VALUES (1, 'Import réussi', '5 points topographiques importés dans le projet RN9.', 'success')");
  console.log("✅ 3 notifications créées !");
  await pool.end();
}
main().catch(console.error);
