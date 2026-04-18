# FROM node:22-alpine

# WORKDIR /app

# # copy package.json
# COPY gateway/package*.json ./

# # copy common package (needed for npm install)
# COPY common ../common

# # install dependencies (this installs @satish/common)
# RUN npm install

# # copy rest of service code
# COPY gateway .

# CMD ["node", "src/app.js"]

# 🏗️ Stage 1: Build stage (install deps)
FROM node:22-alpine AS builder

WORKDIR /app

# 1️⃣ Copy only package files (for caching)
COPY gateway/package*.json ./

# 2️⃣ Copy shared common module
COPY common ./common

# 3️⃣ Install all dependencies (including dev if needed for build)
RUN npm install

# 4️⃣ Copy actual source code
COPY gateway .



# 🚀 Stage 2: Production stage (lightweight image)
FROM node:22-alpine

WORKDIR /app

# 5️⃣ Copy only required files from builder
COPY --from=builder /app ./

# 6️⃣ Remove dev dependencies (reduce size)
RUN npm prune --production

# 7️⃣ Create empty logs folder (not copied from host)
RUN mkdir -p logs

# 8️⃣ Expose app port
EXPOSE 3000

# 9️⃣ Health check (for Docker/K8s monitoring)
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget --spider http://localhost:3000/health || exit 1

# 🔟 Start app
CMD ["node", "src/app.js"]