# Build stage
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb* ./

# Bring env files into build context (Vite reads these at build-time)
COPY .env* ./

# Install dependencies
RUN if [ -f bun.lockb ]; then \
        npm install -g bun && bun install; \
    else \
        npm ci --frozen-lockfile; \
    fi

# Build args (can be passed via docker-compose/Portainer "build.args")
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID

# Generate .env.production from args (fallback to existing .env values if present)
RUN node - <<'NODE'
const fs = require('fs');

function parseEnvFile(p){
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const line of fs.readFileSync(p,'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1,-1);
    out[m[1]] = v;
  }
  return out;
}

const base = parseEnvFile('.env');
const a = process.env;

const url = a.VITE_SUPABASE_URL || base.VITE_SUPABASE_URL || '';
const publishable = a.VITE_SUPABASE_PUBLISHABLE_KEY || base.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const anon = a.VITE_SUPABASE_ANON_KEY || base.VITE_SUPABASE_ANON_KEY || publishable || '';
const projectId = a.VITE_SUPABASE_PROJECT_ID || base.VITE_SUPABASE_PROJECT_ID || '';

const lines = [
  `VITE_SUPABASE_URL=${JSON.stringify(url)}`,
  `VITE_SUPABASE_PUBLISHABLE_KEY=${JSON.stringify(publishable)}`,
  `VITE_SUPABASE_ANON_KEY=${JSON.stringify(anon)}`,
  `VITE_SUPABASE_PROJECT_ID=${JSON.stringify(projectId)}`
];

fs.writeFileSync('.env.production', lines.join('\n') + '\n');
NODE

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Build the application (no hard-fail; runtime error is avoided by .env/.env.production)
RUN if [ -f bun.lockb ]; then \
        bun run build; \
    else \
        npm run build; \
    fi

# Verify build output
RUN ls -la dist/

# Production stage
FROM nginx:alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx user and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
