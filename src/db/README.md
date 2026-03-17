
# Configuration de la base de données MySQL

## Prérequis
- MySQL Server 5.7+ ou MariaDB 10.2+
- Un serveur web PHP (comme XAMPP, WAMP ou MAMP)

## Instructions d'installation

1. Créer une base de données MySQL:
   - Démarrez votre serveur MySQL
   - Connectez-vous à MySQL avec votre client préféré (phpMyAdmin, MySQL Workbench, etc.)
   - Exécutez le script SQL se trouvant dans `src/db/init.sql`

2. Configuration des variables d'environnement:
   - Créez un fichier `.env` à la racine du projet avec les informations suivantes:

```
VITE_DB_HOST=localhost
VITE_DB_USER=votre_utilisateur
VITE_DB_PASSWORD=votre_mot_de_passe
VITE_DB_NAME=mini_banque
VITE_DB_PORT=3306
```

3. Configuration du backend PHP:
   - Un backend PHP séparé sera nécessaire pour se connecter à MySQL
   - Les fichiers PHP devront être hébergés sur un serveur web (Apache/Nginx)
   - Les requêtes API du front-end seront dirigées vers ces endpoints PHP

## Schéma de la base de données

- **users**: Stocke les informations des utilisateurs administrateurs et caissiers
- **accounts**: Contient tous les comptes clients avec leurs soldes
- **transactions**: Enregistre toutes les transactions (dépôt, retrait, virement)
- **loans**: Stocke les informations sur les prêts accordés
- **loan_payments**: Enregistre les paiements effectués sur les prêts
- **reports**: Contient les rapports journaliers générés automatiquement

## Sécurité

Dans un environnement de production:

1. Utilisez des requêtes préparées pour éviter les injections SQL
2. Stockez les mots de passe avec un hachage sécurisé (comme password_hash en PHP)
3. Limitez les privilèges de l'utilisateur MySQL
4. Utilisez HTTPS pour la communication entre le frontend et le backend
