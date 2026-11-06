#!/usr/bin/env bash
# Builds the site and ships it to the VPS as a new release, then switches to it.
#   bash deploy/deploy.sh            (needs the "dayfolio-vps" SSH host and passwordless sudo)
# Only touches /srv/artforge and artforge.service; data in /srv/artforge/data is never modified.
set -euo pipefail

HOST="${DEPLOY_HOST:-dayfolio-vps}"
URL="${APP_URL:-https://artforge.54-38-241-221.sslip.io}"
STAMP="$(date +%Y%m%d-%H%M%S)"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf -- "$WORK"' EXIT

cd "$ROOT"
echo "→ checks"
npx tsc --noEmit -p tsconfig.json
npx eslint src --quiet

echo "→ build for $URL"
NEXT_PUBLIC_APP_URL="$URL" npx next build >/dev/null

echo "→ assemble release $STAMP"
REL="$WORK/release"
mkdir -p "$REL/.next"
cp -r .next/standalone/. "$REL/"
cp -r .next/static "$REL/.next/static"
cp -r public "$REL/public"
# sharp (image optimisation) for Linux x64
SHARP_VERSION="$(node -p "require('./node_modules/sharp/package.json').version")"
( cd "$WORK" && npm init -y >/dev/null && npm install --silent --no-audit --no-fund --os=linux --cpu=x64 --libc=glibc "sharp@$SHARP_VERSION" >/dev/null )
cp -r "$WORK/node_modules/@img/sharp-linux-x64" "$WORK/node_modules/@img/sharp-libvips-linux-x64" "$REL/node_modules/@img/"
if find "$REL" -name ".env*" | grep -q .; then echo "refusing to ship .env files" >&2; exit 1; fi

echo "→ upload and switch"
( cd "$REL" && tar czf - . ) | ssh "$HOST" "set -e
  R=/srv/artforge/releases/$STAMP
  sudo -n install -d -o root -g artforge -m 0750 \$R
  sudo -n tar xzf - -C \$R --no-same-owner
  sudo -n chown -R root:artforge \$R
  sudo -n chmod -R u=rwX,g=rX,o= \$R
  sudo -n install -d -o artforge -g artforge -m 0750 \$R/.next/cache
  PREV=\$(readlink -f /srv/artforge/current || true)
  sudo -n ln -sfn \$R /srv/artforge/current
  sudo -n systemctl restart artforge
  sleep 4
  if ! curl -fsS -o /dev/null -A 'Mozilla/5.0 deploy-check' http://127.0.0.1:3004/; then
    echo 'health check failed, rolling back' >&2
    [ -n \"\$PREV\" ] && sudo -n ln -sfn \"\$PREV\" /srv/artforge/current && sudo -n systemctl restart artforge
    exit 1
  fi
  # keep the 3 most recent releases
  ls -1dt /srv/artforge/releases/*/ 2>/dev/null | tail -n +4 | xargs -r sudo -n rm -rf --
  echo \"live: \$R\""

echo "→ public check"
curl -fsS -o /dev/null -w "%{http_code} $URL\n" "$URL/"
