rm -rf dist node_modules pnpm-lock.yaml
rm -rf extension/dist extension/node_modules extension/pnpm-lock.yaml
rm -rf api/dist api/node_modules api/pnpm-lock.yaml
rm -rf ui/dist ui/node_modules ui/pnpm-lock.yaml

pnpm install