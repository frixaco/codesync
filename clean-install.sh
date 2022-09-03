rm -rf dist node_modules pnpm-lock.yaml
rm -rf extension/dist extension/ui extension/node_modules extension/pnpm-lock.yaml
rm -rf api/dist api/node_modules api/pnpm-lock.yaml
rm -rf ui-solidjs/node_modules ui-solidjs/pnpm-lock.yaml

pnpm install