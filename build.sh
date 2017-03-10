
echo "- http://content-distribution.apps.xiaoyun.com/api"
echo "- http://content-distribution-test-1.apps.xiaoyun.com/api"
echo "- http://content-distribution-test-2.apps.xiaoyun.com/api"

echo "API_PREFIX=\c"

read API_PREFIX

rm -rf dist

NODE_ENV=production API_PREFIX=$API_PREFIX ./node_modules/.bin/webpack

./node_modules/.bin/electron-packager . client --ignore=node_modules --ignore=src --ignore=webpack.config.js --ignore=main.dev.js --overwrite

echo "\nDeploy API_PREFIX with $API_PREFIX success!\n"
