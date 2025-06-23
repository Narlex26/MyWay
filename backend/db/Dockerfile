FROM mysql:8.3

# Update and clean up to reduce vulnerabilities
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copie les scripts d'initialisation dans le dossier prévu par MySQL
COPY ./init-db /docker-entrypoint-initdb.d

# Les variables d'environnement (utilisées lors du lancement du conteneur)
# doivent être définies via docker-compose ou la ligne de commande