echo "API_PREFIX: \c"

read API_PREFIX

rm -rf dist

NODE_ENV=production API_PREFIX=$API_PREFIX ./node_modules/.bin/webpack

./node_modules/.bin/electron-packager . client --ignore=node_modules,src --overwrite

echo "\nDeploy $VERSION success!\n"
