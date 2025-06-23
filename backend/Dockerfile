FROM node:20

# Crée le dossier de travail
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances
RUN npm install --production

# Copie le reste du code source
COPY . .

# Expose le port (adapte selon ton app)
EXPOSE 3000

# Commande de démarrage (adapte si besoin)
CMD ["node", "server.js"]