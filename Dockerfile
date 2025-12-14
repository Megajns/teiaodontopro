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

# Expose Vite env at build-time (set these as Build Args in Portainer)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

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
RUN test -n "$VITE_SUPABASE_URL" || (echo "Missing build arg: VITE_SUPABASE_URL" >&2; exit 1) && \
    test -n "$VITE_SUPABASE_ANON_KEY" || (echo "Missing build arg: VITE_SUPABASE_ANON_KEY" >&2; exit 1) && \
    if [ -f bun.lockb ]; then \
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

  function safe(v){
    try { return typeof v === 'string' ? v : JSON.stringify(v); } catch { return String(v); }
  }

  function ensurePanel(){
    var el = document.getElementById('__odontopro_debug__');
    if (el) return el;
    el = document.createElement('pre');
    el.id = '__odontopro_debug__';
    el.style.cssText = [
      'position:fixed','left:0','right:0','bottom:0','max-height:45vh','overflow:auto',
      'margin:0','padding:10px','z-index:2147483647','background:rgba(0,0,0,.85)',
      'color:#00ff9a','font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace',
      'white-space:pre-wrap','word-break:break-word','border-top:1px solid rgba(255,255,255,.15)'
    ].join(';');
    el.textContent = '[odontopro] debug overlay ativo\\n';
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') el.style.display = (el.style.display === 'none' ? 'block' : 'none');
    });
    document.documentElement.appendChild(el);
    return el;
  }

  function log(){
    var args = Array.prototype.slice.call(arguments);
    try { console.log.apply(console, ['[odontopro]'].concat(args)); } catch {}
    var panel = ensurePanel();
    panel.textContent += args.map(safe).join(' ') + '\\n';
  }

  // Patch console.error/warn to also show in overlay
  var _ce = console.error, _cw = console.warn;
  console.error = function(){ log('console.error:', [].slice.call(arguments)); try { _ce.apply(console, arguments); } catch {} };
  console.warn  = function(){ log('console.warn:',  [].slice.call(arguments)); try { _cw.apply(console, arguments); } catch {} };

  log('boot', { href: location.href, baseURI: document.baseURI, origin: location.origin });
  document.addEventListener('DOMContentLoaded', function(){ log('DOMContentLoaded'); });
  window.addEventListener('load', function(){ log('window.load'); });

  // Log scripts/links currently in HTML
  try {
    log('scripts', Array.from(document.querySelectorAll('script[src]')).map(function(s){ return s.src; }));
    log('styles',  Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(function(l){ return l.href; }));
  } catch(e) { log('enumeration_failed', e && (e.stack || e.message || String(e))); }

  // Capture resource load errors (JS/CSS 404, blocked, etc.)
  window.addEventListener('error', function(e){
    var t = e && e.target;
    if (t && (t.tagName === 'SCRIPT' || t.tagName === 'LINK' || t.tagName === 'IMG')) {
      log('resource_error', { tag: t.tagName, src: t.src || t.href || null, outerHTML: (t.outerHTML || '').slice(0, 300) });
      return;
    }
    log('window.error', {
      message: e && e.message,
      filename: e && e.filename,
      lineno: e && e.lineno,
      colno: e && e.colno,
      error: e && e.error ? (e.error.stack || String(e.error)) : null
    });
  }, true);

  window.addEventListener('unhandledrejection', function(e){
    var r = e && e.reason;
    log('unhandledrejection', { reason: r ? (r.stack || r.message || String(r)) : r });
  });

  // Quick sanity: show base tag (common issue with assets path)
  try {
    var b = document.querySelector('base');
    log('base_tag', b ? (b.getAttribute('href') || '') : '(none)');
  } catch {}
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
