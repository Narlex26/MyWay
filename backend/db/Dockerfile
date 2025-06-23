FROM mysql:8.3

# Copie les scripts d'initialisation dans le dossier prévu par MySQL
COPY ./init_remote_db.sql /docker-entrypoint-initdb.d

EXPOSE 3306
# Les variables d'environnement (utilisées lors du lancement du conteneur)
# doivent être définies via docker-compose ou la ligne de commande