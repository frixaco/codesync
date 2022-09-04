rm -rf `find . -type d -name node_modules`
rm -rf `find . -type d -name dist`
rm -rf `find . -type d -name out`

rm -rf `find . -type d -name ui`
find . -type f -name pnpm-lock.yaml -delete

pnpm install