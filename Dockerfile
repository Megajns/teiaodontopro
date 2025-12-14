# Build stage
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb* ./

# Install dependencies
RUN if [ -f bun.lockb ]; then \
        npm install -g bun && bun install; \
    else \
        npm ci --frozen-lockfile; \
    fi

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Build the application
RUN if [ -f bun.lockb ]; then \
        bun run build; \
    else \
        npm run build; \
    fi

# Inject production debug console logs into dist/index.html
RUN node - <<'NODE'
const fs = require('fs');
const p = 'dist/index.html';
if (!fs.existsSync(p)) process.exit(0);
let html = fs.readFileSync(p, 'utf8');
if (html.includes('__ODONTOPRO_DEBUG__')) process.exit(0);

const snippet = `
<script>
(function(){
  if (window.__ODONTOPRO_DEBUG__) return;
  window.__ODONTOPRO_DEBUG__ = true;
  const log = (...a) => console.log('[odontopro]', ...a);

  log('boot', { href: location.href, baseURI: document.baseURI, ua: navigator.userAgent });
  log('scripts', Array.from(document.querySelectorAll('script[src]')).map(s => s.src));

  window.addEventListener('error', (e) => {
    log('window.error', {
      message: e && e.message,
      filename: e && e.filename,
      lineno: e && e.lineno,
      colno: e && e.colno,
      error: e && e.error ? (e.error.stack || String(e.error)) : null
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    const r = e && e.reason;
    log('unhandledrejection', { reason: r ? (r.stack || r.message || String(r)) : r });
  });
})();
</script>
`;

html = html.includes('</head>') ? html.replace('</head>', snippet + '\n</head>') : (html + snippet);
fs.writeFileSync(p, html);
NODE

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
