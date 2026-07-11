import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendWelcomeEmail(to: string, name: string, password: string, role: string) {
  if (!resend) { console.log('RESEND_API_KEY not set'); return; }
  await resend.emails.send({
    from: "TerraMaps <onboarding@resend.dev>",
    to,
    subject: "Bienvenue sur TerraMaps — Vos identifiants",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0D1117; color: #E2EAF2; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #F97316; font-size: 28px; margin: 0;">Terra<span style="color: #fff;">Maps</span></h1>
          <p style="color: #64748B; margin: 4px 0 0;">Topographie & Cartographie</p>
        </div>
        
        <h2 style="color: #E2EAF2; font-size: 20px;">Bienvenue, ${name} ! 👋</h2>
        <p style="color: #8BACC8;">Votre compte TerraMaps a été créé avec succès. Voici vos identifiants de connexion :</p>
        
        <div style="background: #161B22; border: 1px solid #1E2D3D; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <div style="margin-bottom: 12px;">
            <span style="color: #64748B; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</span>
            <div style="color: #F97316; font-size: 16px; font-weight: 600; margin-top: 4px;">${to}</div>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="color: #64748B; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Mot de passe</span>
            <div style="color: #F97316; font-size: 16px; font-weight: 600; margin-top: 4px;">${password}</div>
          </div>
          <div>
            <span style="color: #64748B; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Rôle</span>
            <div style="color: #22C55E; font-size: 14px; font-weight: 600; margin-top: 4px; text-transform: uppercase;">${role}</div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://terramaps.vercel.app/login" 
            style="background: #F97316; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
            🚀 Accéder à TerraMaps
          </a>
        </div>
        
        <p style="color: #4B6080; font-size: 12px; text-align: center; margin-top: 32px;">
          Changez votre mot de passe après la première connexion dans Mon Profil.<br/>
          TerraMaps v2.0 — terramaps.vercel.app
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, resetToken: string) {
  const resetUrl = `https://terramaps.vercel.app/reset-password?token=${resetToken}`;
  if (!resend) { console.log('RESEND_API_KEY not set'); return; }
  await resend.emails.send({
    from: "TerraMaps <onboarding@resend.dev>",
    to,
    subject: "Réinitialisation de votre mot de passe TerraMaps",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0D1117; color: #E2EAF2; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #F97316; font-size: 28px; margin: 0;">Terra<span style="color: #fff;">Maps</span></h1>
        </div>
        
        <h2 style="color: #E2EAF2;">Réinitialisation du mot de passe 🔑</h2>
        <p style="color: #8BACC8;">Bonjour ${name}, vous avez demandé à réinitialiser votre mot de passe.</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}"
            style="background: #F97316; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
            🔑 Réinitialiser mon mot de passe
          </a>
        </div>
        
        <p style="color: #64748B; font-size: 12px;">Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        
        <p style="color: #4B6080; font-size: 12px; text-align: center; margin-top: 32px;">
          TerraMaps v2.0 — terramaps.vercel.app
        </p>
      </div>
    `,
  });
}

export async function sendImportNotificationEmail(to: string, managerName: string, agentName: string, projectName: string, pointCount: number) {
  if (!resend) { console.log("RESEND_API_KEY not set"); return; }
  await resend.emails.send({
    from: "TerraMaps <onboarding@resend.dev>",
    to,
    subject: `TerraMaps — ${pointCount} points importes dans ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0D1117; color: #E2EAF2; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #F97316; font-size: 28px; margin: 0;">Terra<span style="color: #fff;">Maps</span></h1>
          <p style="color: #64748B; margin: 4px 0 0;">Notification automatique</p>
        </div>
        <h2 style="color: #E2EAF2; font-size: 20px;">Nouvel import de points 📍</h2>
        <p style="color: #8BACC8;">Bonjour ${managerName},</p>
        <p style="color: #8BACC8;">L agent <strong style="color: #F97316;">${agentName}</strong> vient d importer des points dans votre projet.</p>
        <div style="background: #161B22; border: 1px solid #1E2D3D; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <div style="margin-bottom: 12px;">
            <span style="color: #64748B; font-size: 12px; text-transform: uppercase;">Projet</span>
            <div style="color: #F97316; font-size: 16px; font-weight: 600; margin-top: 4px;">${projectName}</div>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="color: #64748B; font-size: 12px; text-transform: uppercase;">Points importes</span>
            <div style="color: #22C55E; font-size: 24px; font-weight: 700; margin-top: 4px;">${pointCount}</div>
          </div>
          <div>
            <span style="color: #64748B; font-size: 12px; text-transform: uppercase;">Agent</span>
            <div style="color: #3B82F6; font-size: 14px; font-weight: 600; margin-top: 4px;">${agentName}</div>
          </div>
        </div>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://terramaps.vercel.app/survey"
            style="background: #F97316; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
            Voir les points
          </a>
        </div>
        <p style="color: #4B6080; font-size: 12px; text-align: center; margin-top: 32px;">
          TerraMaps v2.0 — terramaps.vercel.app
        </p>
      </div>
    `,
  });
}

export async function sendLeveEmail(to: string, clientName: string, projectName: string, superficie: string, technicien: string) {
  if (!resend) { console.log("RESEND_API_KEY not set"); return; }
  await resend.emails.send({
    from: "TerraMaps <onboarding@resend.dev>",
    to,
    subject: `TerraMaps — Votre levé topographique : ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0D1117; color: #E2EAF2; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #F97316; font-size: 28px; margin: 0;">Terra<span style="color: #fff;">Maps</span></h1>
          <p style="color: #64748B; margin: 4px 0 0;">Topographie & Cartographie</p>
        </div>
        <h2 style="color: #E2EAF2; font-size: 20px;">Votre levé topographique est prêt ! 📄</h2>
        <p style="color: #8BACC8;">Bonjour ${clientName},</p>
        <p style="color: #8BACC8;">Votre levé topographique a été généré avec succès. Voici les détails :</p>
        <div style="background: #161B22; border: 1px solid #1E2D3D; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <div style="margin-bottom: 12px;">
            <span style="color: #64748B; font-size: 12px; text-transform: uppercase;">Projet</span>
            <div style="color: #F97316; font-size: 16px; font-weight: 600; margin-top: 4px;">${projectName}</div>
          </div>
          <div style="margin-bottom: 12px;">
            <span style="color: #64748B; font-size: 12px; text-transform: uppercase;">Superficie</span>
            <div style="color: #22C55E; font-size: 16px; font-weight: 600; margin-top: 4px;">${superficie}</div>
          </div>
          <div>
            <span style="color: #64748B; font-size: 12px; text-transform: uppercase;">Technicien</span>
            <div style="color: #3B82F6; font-size: 14px; font-weight: 600; margin-top: 4px;">${technicien}</div>
          </div>
        </div>
        <p style="color: #8BACC8;">Le document PDF officiel a été généré et est disponible dans votre espace TerraMaps.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://terramaps.vercel.app/login"
            style="background: #F97316; color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
            Acceder a TerraMaps
          </a>
        </div>
        <p style="color: #4B6080; font-size: 12px; text-align: center; margin-top: 32px;">
          TerraMaps v2.0 — terramaps.vercel.app
        </p>
      </div>
    `,
  });
}
