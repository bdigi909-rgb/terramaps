# 📖 Manuel d'utilisation TerraMaps v2.0

## 🌐 Accès
- **URL :** https://terramaps.vercel.app
- **Login :** admin@terramaps.ma / Admin2026!

---

## 🏠 1. TABLEAU DE BORD (Dashboard)

La page principale affiche :
- **KPIs** : Total projets, points topo, alignements
- **Graphiques** : Activité mensuelle, volumes
- **Projets récents** : Accès rapide
- **Actions rapides** : Nouveau projet, import, calculs

---

## 📁 2. PROJETS

### Créer un projet
1. Cliquer **"Nouveau Projet"**
2. Remplir : Nom, Type, Client, Localisation, EPSG
3. Cliquer **"Enregistrer"**

### Dans un projet vous avez :
- **Vue générale** : Infos du projet
- **Points topo** : Liste et carte des points
- **Alignements** : Axes routiers
- **MNT** : Modèle Numérique de Terrain
- **Volumes** : Calcul cubatures
- **Photos** : Galerie photos terrain
- **Calques** : Gestion des calques
- **Activité** : Historique des actions

### Partager un projet avec un client
1. Ouvrir le projet
2. Cliquer **"🔗 Partager"**
3. Le lien est copié automatiquement
4. Envoyer le lien au client par WhatsApp/Email
5. Le client voit : nom, points, photos — sans connexion

---

## 📍 3. SURVEY POINTS (Points Topographiques)

### Importer des points
1. Aller sur **/survey**
2. Sélectionner un projet
3. Cliquer **"Import CSV"**
4. Format : Nom, Code, X, Y, Z

### Vues disponibles
- **🗺 Carte** : Points sur OpenStreetMap (EPSG:26191)
- **≡ Tableau** : Liste des points avec coordonnées
- **📊 Graphique** : Visualisation canvas
- **📈 Profil** : Profil altimétrique Z

### Exporter les points
- **Excel** : Tableau XLS
- **LandXML** : Format standard topo
- **DXF** : AutoCAD/Covadis
- **ZIP** : Tous les formats

---

## 📄 4. DEVIS

### Créer un devis
1. Aller sur **/devis**
2. Le numéro **DEV-2026-XXX** est automatique
3. Remplir : Client, Adresse, Téléphone, Email
4. Sélectionner le projet
5. Ajouter les prestations (ou utiliser un modèle rapide)
6. Cliquer **"Generer le Devis PDF"**
7. PDF téléchargé automatiquement

### Modèles rapides disponibles
- Levé standard < 1 Ha (3 500 MAD)
- Levé 1-5 Ha + rapport (5 500 MAD)
- Polygonale complète (4 000 MAD)
- Bornage terrain (4 050 MAD)

### Partager un devis avec le client
1. Générer le devis PDF
2. Cliquer **"🔗 Partager le dernier devis"**
3. Lien copié → envoyer au client
4. Le client voit le devis en ligne sans connexion

---

## 🧾 5. FACTURES

### Créer une facture
1. Aller sur **/facture**
2. Le numéro **FAC-2026-XXX** est automatique
3. Remplir les informations client
4. Ajouter les prestations
5. Signer avec le pad de signature
6. Cliquer **"🧾 Générer la Facture PDF"**
7. PDF avec timbre fiscal 20 MAD inclus

### Partager une facture
1. Générer la facture
2. Cliquer **"🔗 Partager la derniere facture"**
3. Envoyer le lien au client

---

## 📸 6. PHOTOS TERRAIN

### Uploader des photos
1. Aller sur **/photos** ou onglet Photos dans le projet
2. Sélectionner le projet
3. Choisir une photo depuis votre appareil
4. Ajouter une description (optionnel)
5. Cliquer **"📤 Uploader"**

### Les photos sont visibles par le client
Quand vous partagez un projet, le client voit aussi les photos terrain !

---

## 📅 7. PLANNING MISSIONS

### Créer une mission
1. Aller sur **/planning**
2. Cliquer **"+ Nouvelle mission"**
3. Remplir : Titre, Projet, Technicien, Date
4. Cliquer **"Créer"**

### Envoyer un rappel email
1. Cliquer **📧** sur la mission
2. Entrer l'email du technicien
3. Cliquer OK → Email envoyé automatiquement

---

## 📊 8. LEVÉ TOPOGRAPHIQUE OFFICIEL

### Générer un levé officiel PDF
1. Aller sur **/leve-topo**
2. Remplir : Province, Commune, Propriétaire, CIN
3. Sélectionner le projet avec les points
4. Dessiner la signature
5. Cliquer **"Générer le Levé PDF"**

### Envoyer par email au client
1. Entrer l'email du client
2. Cliquer **"📧 Envoyer"**
3. Le client reçoit les détails par email

---

## ⚙️ 9. PARAMÈTRES SOCIÉTÉ

### Configurer votre société
1. Aller sur **/settings**
2. Remplir : Nom société, RC, IF, ICE
3. Uploader votre **logo** (affiché sur tous les PDFs)
4. Sauvegarder

---

## 🔐 10. SÉCURITÉ

### Activer le 2FA (Double authentification)
1. Aller sur **/profile**
2. Cliquer **"🔐 Configurer le 2FA"**
3. Scanner le QR Code avec Google Authenticator
4. Entrer le code à 6 chiffres
5. ✅ 2FA activé !

---

## 📱 11. INSTALLATION MOBILE (PWA)

### Android
1. Ouvrir terramaps.vercel.app dans Chrome
2. Menu ⋮ → "Ajouter à l'écran d'accueil"
3. Confirmer → Icône TerraMaps installée !

### iPhone
1. Ouvrir dans Safari
2. Bouton Partager → "Sur l'écran d'accueil"
3. Confirmer !

---

## 🔔 12. NOTIFICATIONS PUSH

1. Aller sur **/profile**
2. Cliquer **"🔕 Activer notifs"**
3. Accepter la permission
4. ✅ Vous recevrez des notifications même hors ligne

---

## 💰 13. FINANCE

### Tableau de bord financier
1. Aller sur **/finance**
2. Voir : Revenus, Factures payées/en attente
3. Cliquer **"📄 Rapport mensuel PDF"**

---

## 🗺️ 14. OUTILS TOPOGRAPHIQUES

| Page | Outil |
|------|-------|
| /nivellement | Circuit de nivellement |
| /polygonale | Calcul de polygonale |
| /calculatrice | Calculatrice topo |
| /volumes | Cubatures déblai/remblai |
| /alignment | Axes routiers |
| /terrain | Modèle numérique de terrain |
| /canvas | Dessin CAO |

---

## 📦 15. EXPORT & BACKUP

1. Aller sur **/export**
2. Choisir : Backup complet, Projets, Devis, ou Factures
3. Fichier JSON téléchargé

---

## 🆘 SUPPORT

- **Email :** admin@terramaps.ma
- **Page aide :** /help
- **Status système :** /status

---

*TerraMaps v2.0 — terramaps.vercel.app*
*Document généré le 13/07/2026*
