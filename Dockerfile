# Stage 1: deps
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci --silent || npm i --silent

# Stage 2: builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# run build if there's a build script; ignore failure if none
RUN npm run build --silent || true

# Stage 3: runner
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app . 
EXPOSE 3000
# Try to run "npm start" if present, otherwise try common build outputs.
CMD ["sh","-c","if npm run | grep -q \"start\"; then npm start; elif [ -f dist/index.js ]; then node dist/index.js; elif [ -f build/index.js ]; then node build/index.js; else echo 'No start script found. Update Dockerfile to match your app.' && exit 1; fi"]