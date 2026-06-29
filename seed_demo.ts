import { Pool } from "pg";

const pool = new Pool({
  host: "127.0.0.1",
  port: 5433,
  database: "cad_srm",
  user: "postgres",
  password: "postgres",
});

async function query(sql: string, params: unknown[] = []) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function seed() {
  console.log("🌱 Création des données de démonstration SRM Pro...\n");

  // ── 1. PROJETS ─────────────────────────────────────────────────────────────
  console.log("📁 Création des projets...");

  const [p1] = await query(`
    INSERT INTO projects (name, description, type, status, client, location, epsg_code)
    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id
  `, [
    "RN9 — Déviation de Beni Mellal",
    "Déviation de la Route Nationale 9 sur 4.2 km. Evitement du centre-ville de Beni Mellal pour fluidifier le trafic lourd.",
    "road_design", "active", "Direction Régionale des Routes — Béni Mellal",
    "Béni Mellal, Maroc", "26191"
  ]);

  const [p2] = await query(`
    INSERT INTO projects (name, description, type, status, client, location, epsg_code)
    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id
  `, [
    "Lotissement Al Wifaq — Phase 2",
    "Levé topographique et plan de masse pour le lotissement Al Wifaq, 45 lots. Système VRD complet.",
    "parcel", "review", "Groupe Immobilier ADDOHA",
    "Marrakech, Maroc", "26191"
  ]);

  const [p3] = await query(`
    INSERT INTO projects (name, description, type, status, client, location, epsg_code)
    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id
  `, [
    "Barrage Moulay Hassan — Levé bathymétrique",
    "Levé topographique et bathymétrique complet du bassin de retenue. Calcul de la capacité de stockage.",
    "terrain_modeling", "completed", "ONEE — Office National de l'Eau et de l'Electricité",
    "Khouribga, Maroc", "26191"
  ]);

  const [p4] = await query(`
    INSERT INTO projects (name, description, type, status, client, location, epsg_code)
    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id
  `, [
    "Zone Industrielle Tanger Med — VRD",
    "Conception des voiries et réseaux divers de la nouvelle zone industrielle. Surface totale : 12 ha.",
    "infrastructure", "draft", "Agence Spéciale Tanger-Méditerranée",
    "Tanger, Maroc", "26191"
  ]);

  const [p5] = await query(`
    INSERT INTO projects (name, description, type, status, client, location, epsg_code)
    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id
  `, [
    "Route Provinciale RP3012 — Aménagement",
    "Aménagement et élargissement de la RP3012 sur 8.7 km. Amélioration du profil en long et création de 2 giratoires.",
    "road_design", "active", "Commune Rurale Ait Ourir",
    "Ait Ourir, Marrakech", "26191"
  ]);

  const proj1 = p1.id, proj2 = p2.id, proj3 = p3.id, proj4 = p4.id, proj5 = p5.id;
  console.log(`   ✓ 5 projets créés (IDs: ${proj1}, ${proj2}, ${proj3}, ${proj4}, ${proj5})`);

  // ── 2. SURVEY POINTS — Projet 1 (Route RN9) ───────────────────────────────
  console.log("\n📍 Création des points topographiques...");

  // Points topo réalistes pour un axe routier (coordonnées Maroc approximatives)
  const pointsRN9 = [
    // Axe de la route, tous les 50m
    { name: "PT001", code: "AXE", x: 450000.0, y: 340000.0, z: 420.50, desc: "Début déviation - Pk 0+000" },
    { name: "PT002", code: "AXE", x: 450045.2, y: 340048.7, z: 421.20, desc: "Pk 0+050" },
    { name: "PT003", code: "AXE", x: 450089.8, y: 340098.1, z: 422.85, desc: "Pk 0+100" },
    { name: "PT004", code: "AXE", x: 450134.5, y: 340147.4, z: 424.10, desc: "Pk 0+150" },
    { name: "PT005", code: "AXE", x: 450179.1, y: 340196.8, z: 425.60, desc: "Pk 0+200" },
    { name: "PT006", code: "AXE", x: 450223.7, y: 340246.2, z: 427.30, desc: "Pk 0+250" },
    { name: "PT007", code: "AXE", x: 450268.4, y: 340295.5, z: 429.05, desc: "Pk 0+300" },
    { name: "PT008", code: "AXE", x: 450312.9, y: 340344.9, z: 430.80, desc: "Pk 0+350" },
    { name: "PT009", code: "AXE", x: 450357.5, y: 340394.3, z: 432.15, desc: "Pk 0+400" },
    { name: "PT010", code: "AXE", x: 450402.1, y: 340443.6, z: 433.90, desc: "Pk 0+450" },
    { name: "PT011", code: "AXE", x: 450446.8, y: 340493.0, z: 435.40, desc: "Pk 0+500" },
    { name: "PT012", code: "AXE", x: 450491.4, y: 340542.4, z: 436.75, desc: "Pk 0+550" },
    { name: "PT013", code: "AXE", x: 450535.9, y: 340591.7, z: 438.20, desc: "Pk 0+600" },
    { name: "PT014", code: "AXE", x: 450580.6, y: 340641.1, z: 439.60, desc: "Pk 0+650" },
    { name: "PT015", code: "AXE", x: 450625.2, y: 340690.5, z: 440.85, desc: "Pk 0+700" },
    // Points terrain naturel
    { name: "TN001", code: "TN", x: 450010.0, y: 340020.0, z: 418.20, desc: "Terrain naturel gauche" },
    { name: "TN002", code: "TN", x: 450020.0, y: 339980.0, z: 419.50, desc: "Terrain naturel droite" },
    { name: "TN003", code: "TN", x: 450060.0, y: 340070.0, z: 420.80, desc: "Terrain naturel" },
    { name: "TN004", code: "TN", x: 450120.0, y: 340030.0, z: 421.30, desc: "Terrain naturel" },
    { name: "TN005", code: "TN", x: 450200.0, y: 340150.0, z: 423.70, desc: "Terrain naturel - talus" },
    // Points de repère
    { name: "BN001", code: "BN", x: 450050.0, y: 339950.0, z: 420.000, desc: "Borne de nivellement NGM" },
    { name: "BN002", code: "BN", x: 450350.0, y: 340300.0, z: 431.250, desc: "Borne de nivellement NGM" },
    { name: "GP001", code: "GP", x: 450000.0, y: 340000.0, z: 420.500, desc: "Point geodesique - triangulation" },
    // Obstacles et ouvrages
    { name: "OA001", code: "OA", x: 450280.0, y: 340270.0, z: 429.50, desc: "Oued - rive gauche" },
    { name: "OA002", code: "OA", x: 450310.0, y: 340310.0, z: 429.80, desc: "Oued - rive droite" },
    { name: "OA003", code: "OA", x: 450295.0, y: 340290.0, z: 426.20, desc: "Fond oued" },
  ];

  for (const pt of pointsRN9) {
    await query(
      `INSERT INTO survey_points (project_id, name, code, x, y, z, description) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [proj1, pt.name, pt.code, pt.x, pt.y, pt.z, pt.desc]
    );
  }

  // Points topo pour projet 2 (lotissement)
  const pointsLot = [
    { name: "L001", code: "BOR", x: 460000.0, y: 350000.0, z: 485.30, desc: "Borne angle NW" },
    { name: "L002", code: "BOR", x: 460250.0, y: 350000.0, z: 486.10, desc: "Borne angle NE" },
    { name: "L003", code: "BOR", x: 460250.0, y: 349750.0, z: 484.90, desc: "Borne angle SE" },
    { name: "L004", code: "BOR", x: 460000.0, y: 349750.0, z: 484.20, desc: "Borne angle SW" },
    { name: "L005", code: "TN",  x: 460050.0, y: 349950.0, z: 485.50, desc: "TN - voirie principale" },
    { name: "L006", code: "TN",  x: 460100.0, y: 349900.0, z: 485.80, desc: "TN - lot 1" },
    { name: "L007", code: "TN",  x: 460150.0, y: 349850.0, z: 486.00, desc: "TN - lot 2" },
    { name: "L008", code: "TN",  x: 460200.0, y: 349800.0, z: 485.70, desc: "TN - lot 3" },
    { name: "L009", code: "TN",  x: 460050.0, y: 349800.0, z: 485.20, desc: "TN - lot 4" },
    { name: "L010", code: "TN",  x: 460100.0, y: 349750.0, z: 484.90, desc: "TN - lot 5" },
    { name: "L011", code: "ALT", x: 460125.0, y: 349875.0, z: 485.60, desc: "Altitude voirie centrale" },
    { name: "L012", code: "ALT", x: 460125.0, y: 349825.0, z: 485.30, desc: "Altitude voirie centrale" },
  ];

  for (const pt of pointsLot) {
    await query(
      `INSERT INTO survey_points (project_id, name, code, x, y, z, description) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [proj2, pt.name, pt.code, pt.x, pt.y, pt.z, pt.desc]
    );
  }

  // Points topo pour projet 3 (barrage)
  const pointsBarrage = [];
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * 2 * Math.PI;
    const r = 800 + Math.random() * 200;
    const x = 480000 + r * Math.cos(angle);
    const y = 360000 + r * Math.sin(angle);
    const z = 380 + Math.random() * 60;
    pointsBarrage.push({
      name: `B${String(i+1).padStart(3,"0")}`,
      code: i < 20 ? "BATH" : "BERGE",
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      z: Math.round(z * 100) / 100,
      desc: i < 20 ? `Point bathymétrique ${i+1}` : `Point berge ${i-19}`,
    });
  }
  for (const pt of pointsBarrage) {
    await query(
      `INSERT INTO survey_points (project_id, name, code, x, y, z, description) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [proj3, pt.name, pt.code, pt.x, pt.y, pt.z, pt.desc]
    );
  }

  console.log(`   ✓ ${pointsRN9.length + pointsLot.length + pointsBarrage.length} points topographiques créés`);

  // ── 3. ALIGNEMENTS ─────────────────────────────────────────────────────────
  console.log("\n🛣️  Création des alignements...");

  const [al1] = await query(`
    INSERT INTO alignments (project_id, name, type, description, total_length, geometry)
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING id
  `, [
    proj1, "Axe principal RN9 - Variante A", "horizontal",
    "Tracé horizontal de la déviation. Longueur totale 4200m. Comprend 3 arcs de cercle R=500m et 4 clothoïdes A=150.",
    4200.0,
    JSON.stringify({
      type: "LineString",
      coordinates: [
        [450000, 340000], [450625, 340690], [451200, 341350],
        [451800, 341950], [452350, 342600], [452900, 343200],
        [453450, 343750], [453950, 344200]
      ]
    })
  ]);

  const [al2] = await query(`
    INSERT INTO alignments (project_id, name, type, description, total_length, geometry)
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING id
  `, [
    proj1, "Profil en long - Axe A", "vertical",
    "Profil en long de la variante A. Déclivité maximale 4%. Points hauts à Pk 1+850 (cote 468m) et Pk 3+200 (cote 452m).",
    4200.0,
    JSON.stringify({
      stations: [0, 500, 1000, 1500, 1850, 2500, 3000, 3200, 3800, 4200],
      elevations: [420.5, 432.0, 448.5, 461.0, 468.0, 455.0, 446.0, 452.0, 438.0, 425.0]
    })
  ]);

  const [al3] = await query(`
    INSERT INTO alignments (project_id, name, type, description, total_length, geometry)
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING id
  `, [
    proj5, "Axe RP3012 - Section 1", "horizontal",
    "Section 1 : Pk 0+000 à Pk 3+500. Elargissement de 5m à 7m. Création d'un giratoire au Pk 1+720.",
    3500.0,
    JSON.stringify({
      type: "LineString",
      coordinates: [
        [470000, 355000], [470350, 355200], [470700, 355380],
        [471050, 355540], [471400, 355680], [471750, 355800],
        [472100, 355900], [472450, 355980], [472800, 356040],
        [473150, 356080], [473500, 356100]
      ]
    })
  ]);

  const [al4] = await query(`
    INSERT INTO alignments (project_id, name, type, description, total_length, geometry)
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING id
  `, [
    proj5, "Axe RP3012 - Section 2", "horizontal",
    "Section 2 : Pk 3+500 à Pk 8+700. Passage en zone agricole. Création d'un giratoire au Pk 6+340.",
    5200.0,
    JSON.stringify({
      type: "LineString",
      coordinates: [
        [473500, 356100], [473900, 356090], [474300, 356070],
        [474700, 356030], [475100, 355980], [475500, 355910],
        [475900, 355820], [476300, 355710], [476700, 355580],
        [477100, 355430], [477500, 355260], [477900, 355070],
        [478200, 354920]
      ]
    })
  ]);

  console.log(`   ✓ 4 alignements créés`);

  // ── 4. ÉLÉMENTS D'ALIGNEMENT ───────────────────────────────────────────────
  const al1id = al1.id;
  const elementsAl1 = [
    { order: 1, type: "straight", ss: 0, es: 420.5, sx: 450000, sy: 340000, ex: 450180, ey: 340185, len: 254.5, bearing: 45.2 },
    { order: 2, type: "clothoid", ss: 254.5, es: 404.5, sx: 450180, sy: 340185, ex: 450318, ey: 340327, len: 150, param: 150 },
    { order: 3, type: "arc", ss: 404.5, es: 1254.5, sx: 450318, sy: 340327, ex: 450950, ey: 341050, len: 850, radius: 500 },
    { order: 4, type: "clothoid", ss: 1254.5, es: 1404.5, sx: 450950, sy: 341050, ex: 451100, ey: 341200, len: 150, param: 150 },
    { order: 5, type: "straight", ss: 1404.5, es: 2154.5, sx: 451100, sy: 341200, ex: 451720, ey: 341950, len: 750, bearing: 52.8 },
  ];
  for (const el of elementsAl1) {
    await query(
      `INSERT INTO alignment_elements (alignment_id, "order", element_type, start_station, end_station, start_x, start_y, end_x, end_y, radius, parameter, length, bearing)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [al1id, el.order, el.type, el.ss, el.es, el.sx, el.sy, el.ex, el.ey,
       el.radius ?? null, el.param ?? null, el.len, el.bearing ?? null]
    );
  }
  console.log(`   ✓ 5 éléments d'alignement créés`);

  // ── 5. PROFILS EN TRAVERS ──────────────────────────────────────────────────
  console.log("\n📐 Création des profils en travers...");
  const al2id = al2.id;
  const crossData = [
    { station: 0,    cut: 0,     fill: 45.2,  cv: 0,      fv: 225.1 },
    { station: 100,  cut: 12.5,  fill: 28.4,  cv: 625,    fv: 1420  },
    { station: 200,  cut: 38.7,  fill: 8.2,   cv: 2561,   fv: 1830  },
    { station: 300,  cut: 62.4,  fill: 0,     cv: 5060,   fv: 410   },
    { station: 400,  cut: 48.9,  fill: 0,     cv: 5565,   fv: 0     },
    { station: 500,  cut: 31.2,  fill: 0,     cv: 4005,   fv: 0     },
    { station: 600,  cut: 18.6,  fill: 12.8,  cv: 2490,   fv: 640   },
    { station: 700,  cut: 5.4,   fill: 34.7,  cv: 1200,   fv: 2375  },
    { station: 800,  cut: 0,     fill: 58.3,  cv: 270,    fv: 4650  },
    { station: 900,  cut: 0,     fill: 72.1,  cv: 0,      fv: 6520  },
    { station: 1000, cut: 8.2,   fill: 41.6,  cv: 410,    fv: 5685  },
    { station: 1100, cut: 24.5,  fill: 18.9,  cv: 1635,   fv: 3025  },
    { station: 1200, cut: 45.8,  fill: 3.2,   cv: 3515,   fv: 1105  },
  ];
  for (const cs of crossData) {
    await query(
      `INSERT INTO cross_sections (alignment_id, station, cut_area, fill_area, cut_volume, fill_volume, profile_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [al2id, cs.station, cs.cut, cs.fill, cs.cv, cs.fv,
       JSON.stringify({ left: [-15, -10, -5, 0], right: [0, 5, 10, 15] })]
    );
  }
  console.log(`   ✓ ${crossData.length} profils en travers créés`);

  // ── 6. RAPPORT DE VOLUMES ──────────────────────────────────────────────────
  console.log("\n📊 Création des rapports de volumes...");
  await query(`
    INSERT INTO volume_reports (project_id, alignment_id, name, total_cut, total_fill, net_volume, report_data)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
  `, [
    proj1, al2id, "Rapport volumes - Axe A - Variante principale",
    27336.0, 24660.0, 2676.0,
    JSON.stringify({
      sections: crossData.map(c => ({
        station: c.station,
        cut: c.cut,
        fill: c.fill,
        cut_vol: c.cv,
        fill_vol: c.fv,
      })),
      summary: {
        total_cut_m3: 27336,
        total_fill_m3: 24660,
        net_m3: 2676,
        balance: "Excédent de déblai : 2 676 m³ à évacuer",
        foisonnement: 1.25,
        volume_foisonne: 34170,
        recommendations: "Prévoir un dépôt provisoire au Pk 2+200. Transport par camions 10T.",
      }
    })
  ]);

  await query(`
    INSERT INTO volume_reports (project_id, alignment_id, name, total_cut, total_fill, net_volume, report_data)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
  `, [
    proj5, al3.id, "Rapport volumes - RP3012 Section 1",
    8450.0, 12300.0, -3850.0,
    JSON.stringify({
      summary: {
        total_cut_m3: 8450,
        total_fill_m3: 12300,
        net_m3: -3850,
        balance: "Déficit en remblai : 3 850 m³ à apporter",
        source_remblai: "Carrière locale à 3 km - coût estimé 85 DH/m³",
      }
    })
  ]);
  console.log(`   ✓ 2 rapports de volumes créés`);

  // ── 7. CALQUES ─────────────────────────────────────────────────────────────
  console.log("\n🗂️  Création des calques...");
  const layersDef = [
    { pid: proj1, name: "Axe de la route", color: "#f97316", ltype: "solid", lw: 2 },
    { pid: proj1, name: "Terrain naturel", color: "#22c55e", ltype: "dashed", lw: 1 },
    { pid: proj1, name: "Emprise travaux", color: "#ef4444", ltype: "dashed", lw: 1.5 },
    { pid: proj1, name: "Réseau assainissement", color: "#06b6d4", ltype: "dotted", lw: 1 },
    { pid: proj1, name: "Cotation", color: "#eab308", ltype: "solid", lw: 0.5 },
    { pid: proj1, name: "Annotation", color: "#a855f7", ltype: "solid", lw: 0.5 },
    { pid: proj2, name: "Limites parcelles", color: "#f97316", ltype: "solid", lw: 1.5 },
    { pid: proj2, name: "Voirie lotissement", color: "#3b82f6", ltype: "solid", lw: 2 },
    { pid: proj2, name: "Réseau eau potable", color: "#06b6d4", ltype: "solid", lw: 1 },
    { pid: proj2, name: "Réseau électricité", color: "#eab308", ltype: "dashed", lw: 1 },
    { pid: proj3, name: "Courbes bathymétriques", color: "#3b82f6", ltype: "solid", lw: 1 },
    { pid: proj3, name: "Berges", color: "#22c55e", ltype: "solid", lw: 2 },
    { pid: proj3, name: "Points mesure", color: "#a855f7", ltype: "solid", lw: 0.5 },
  ];
  const layerIds: Record<string, number> = {};
  for (const l of layersDef) {
    const [row] = await query(
      `INSERT INTO layers (project_id, name, color, line_type, line_width) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [l.pid, l.name, l.color, l.ltype, l.lw]
    );
    layerIds[`${l.pid}-${l.name}`] = row.id;
  }
  console.log(`   ✓ ${layersDef.length} calques créés`);

  // ── 8. ENTITÉS DE DESSIN ───────────────────────────────────────────────────
  console.log("\n✏️  Création des entités de dessin...");
  const axeLayerId = layerIds[`${proj1}-Axe de la route`];
  const empLayerId = layerIds[`${proj1}-Emprise travaux`];
  const annLayerId = layerIds[`${proj1}-Annotation`];

  const entities = [
    // Axe de la route
    {
      pid: proj1, lid: axeLayerId, type: "polyline",
      geom: { points: [[450000,340000],[450625,340690],[451200,341350],[451800,341950],[452350,342600]] },
      props: { strokeColor: "#f97316", strokeWidth: 2, label: "Axe RN9 - Pk 0+000 à Pk 2+350" }
    },
    // Emprise travaux (bandes parallèles à l'axe)
    {
      pid: proj1, lid: empLayerId, type: "polyline",
      geom: { points: [[449970,340015],[450595,340705],[451170,341365],[451770,341965],[452320,342615]] },
      props: { strokeColor: "#ef4444", strokeWidth: 1, label: "Limite emprise gauche" }
    },
    {
      pid: proj1, lid: empLayerId, type: "polyline",
      geom: { points: [[450030,339985],[450655,340675],[451230,341335],[451830,341935],[452380,342585]] },
      props: { strokeColor: "#ef4444", strokeWidth: 1, label: "Limite emprise droite" }
    },
    // Annotations
    {
      pid: proj1, lid: annLayerId, type: "text",
      geom: { x: 450000, y: 339950, text: "Pk 0+000 - Alt: 420.50m", fontSize: 12 },
      props: { strokeColor: "#a855f7", label: "Annotation début" }
    },
    {
      pid: proj1, lid: annLayerId, type: "text",
      geom: { x: 450625, y: 340640, text: "Pk 0+700 - Alt: 440.85m", fontSize: 12 },
      props: { strokeColor: "#a855f7", label: "Annotation Pk700" }
    },
    // Ouvrage d'art (cercle représentant le passage de l'oued)
    {
      pid: proj1, lid: axeLayerId, type: "circle",
      geom: { center: { x: 450295, y: 340290 }, radius: 25 },
      props: { strokeColor: "#06b6d4", strokeWidth: 2, label: "Dalot 2x2m - Pk 0+340" }
    },
    // Lotissement - voirie principale
    {
      pid: proj2, lid: layerIds[`${proj2}-Voirie lotissement`], type: "polyline",
      geom: { points: [[460000,349950],[460050,349950],[460050,349750],[460200,349750],[460250,349750]] },
      props: { strokeColor: "#3b82f6", strokeWidth: 2, label: "Voirie principale 7m" }
    },
    // Lotissement - limite du lotissement
    {
      pid: proj2, lid: layerIds[`${proj2}-Limites parcelles`], type: "polyline",
      geom: { points: [[460000,350000],[460250,350000],[460250,349750],[460000,349750],[460000,350000]] },
      props: { strokeColor: "#f97316", strokeWidth: 1.5, label: "Périmètre lotissement" }
    },
  ];

  for (const e of entities) {
    await query(
      `INSERT INTO entities (project_id, layer_id, entity_type, geometry, properties) VALUES ($1,$2,$3,$4,$5)`,
      [e.pid, e.lid, e.type, JSON.stringify(e.geom), JSON.stringify(e.props)]
    );
  }
  console.log(`   ✓ ${entities.length} entités de dessin créées`);

  // ── 9. CONTOUR LINES (courbes de niveau) ──────────────────────────────────
  console.log("\n🏔️  Création des courbes de niveau...");
  const contours = [
    { elev: 420, major: true },
    { elev: 422, major: false },
    { elev: 424, major: false },
    { elev: 425, major: true },
    { elev: 426, major: false },
    { elev: 428, major: false },
    { elev: 430, major: true },
    { elev: 432, major: false },
    { elev: 434, major: false },
    { elev: 435, major: true },
    { elev: 436, major: false },
    { elev: 438, major: false },
    { elev: 440, major: true },
  ];
  for (const c of contours) {
    const points = [];
    for (let i = 0; i < 20; i++) {
      const x = 449800 + i * 150 + Math.random() * 30;
      const y = 339900 + (c.elev - 420) * 50 + Math.random() * 20;
      points.push([Math.round(x), Math.round(y)]);
    }
    await query(
      `INSERT INTO contour_lines (project_id, elevation, is_major, geometry) VALUES ($1,$2,$3,$4)`,
      [proj1, c.elev, c.major, JSON.stringify({ points })]
    );
  }
  console.log(`   ✓ ${contours.length} courbes de niveau créées`);

  // ── RÉSUMÉ FINAL ───────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(55));
  console.log("✅  DONNÉES DE DÉMONSTRATION CRÉÉES AVEC SUCCÈS !");
  console.log("=".repeat(55));

  const counts = await query(`
    SELECT
      (SELECT COUNT(*) FROM projects) as projects,
      (SELECT COUNT(*) FROM survey_points) as points,
      (SELECT COUNT(*) FROM alignments) as alignments,
      (SELECT COUNT(*) FROM alignment_elements) as al_elements,
      (SELECT COUNT(*) FROM cross_sections) as cross_sections,
      (SELECT COUNT(*) FROM volume_reports) as reports,
      (SELECT COUNT(*) FROM layers) as layers,
      (SELECT COUNT(*) FROM entities) as entities,
      (SELECT COUNT(*) FROM contour_lines) as contours
  `);
  const c = counts[0];
  console.log(`\n   📁 Projets         : ${c.projects}`);
  console.log(`   📍 Points topo     : ${c.points}`);
  console.log(`   🛣️  Alignements     : ${c.alignments}`);
  console.log(`   📐 Éléments align. : ${c.al_elements}`);
  console.log(`   ✂️  Profils travers : ${c.cross_sections}`);
  console.log(`   📊 Rapports volumes: ${c.reports}`);
  console.log(`   🗂️  Calques         : ${c.layers}`);
  console.log(`   ✏️  Entités dessin  : ${c.entities}`);
  console.log(`   🏔️  Courbes niveau  : ${c.contours}`);
  console.log("\n🚀 Ouvrez http://localhost:3000 pour voir le résultat !\n");

  await pool.end();
}

seed().catch(e => { console.error("❌ Erreur:", e.message); process.exit(1); });
