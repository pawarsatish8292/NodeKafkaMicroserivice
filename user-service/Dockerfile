# FROM node:22-alpine

# WORKDIR /app

# # copy package.json
# COPY user-service/package*.json ./

# # copy common package (needed for npm install)
# COPY common ../common

# # install dependencies (this installs @satish/common)
# RUN npm install

# # copy rest of service code
# COPY user-service .

# CMD ["node", "src/app.js"]





# 🏗️ Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# 1️⃣ Copy only package files (for caching)
COPY user-service/package*.json ./

# 2️⃣ Copy shared common module (monorepo)
COPY common ./common

# 3️⃣ Install dependencies (fast & deterministic)
RUN npm install

# 4️⃣ Copy service source code
COPY user-service .


# 🚀 Stage 2: Production (lightweight)
FROM node:22-alpine

WORKDIR /app

# 5️⃣ Copy built app from builder
COPY --from=builder /app ./

# 6️⃣ Remove dev dependencies (reduce size)
RUN npm prune --production

# 7️⃣ Create logs folder (empty, not copied)
RUN mkdir -p logs

# 8️⃣ Expose port
EXPOSE 3000

# 9️⃣ Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget --spider http://localhost:3000/health || exit 1

# 🔟 Start service
CMD ["node", "src/app.js"]