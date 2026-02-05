# Construction Mixte - Cours Interactif

Cours complet sur le dimensionnement des structures mixtes acier-béton selon l'Eurocode 4.

## 📚 Contenu

### Poutres Mixtes
- 6 chapitres théoriques
- 3 calculateurs interactifs
- 3 exercices résolus
- Formulaire de référence

### Planchers Mixtes
- 6 chapitres théoriques  
- 5 calculateurs interactifs
- 3 exercices résolus
- Formulaire de référence

## 🔐 Accès

L'accès au site est réservé aux utilisateurs autorisés. 
Connectez-vous avec votre nom, prénom et email.

## 🚀 Déploiement sur GitHub Pages

1. Créer un nouveau repository sur GitHub
2. Pousser ce dossier vers le repository :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/VOTRE_USERNAME/construction-mixte.git
   git push -u origin main
   ```
3. Aller dans Settings > Pages
4. Source: Deploy from a branch
5. Branch: main / (root)
6. Sauvegarder

Le site sera accessible à : `https://VOTRE_USERNAME.github.io/construction-mixte/`

## 👥 Gestion des Accès

Pour modifier la liste des emails autorisés, éditez le fichier `auth/auth.js` :

```javascript
const AUTHORIZED_EMAILS_ENCODED = 'BASE64_ENCODED_EMAILS';
```

Pour encoder une nouvelle liste :
```javascript
// Dans la console du navigateur
btoa('email1@test.com,email2@test.com,@domaine.com')
```

Note: Utiliser `@domaine.com` autorise tous les emails de ce domaine.

## 📄 Licence

© 2026 ESUP J - Cours de Construction Mixte
