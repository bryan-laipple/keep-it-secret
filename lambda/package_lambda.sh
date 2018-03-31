#!/usr/bin/env bash

transpileDir=services
temp=ziptemp
zip_file=Lambda.zip
zip_contents=(index.js $transpileDir node_modules)

function transpile {
    yarn install
    npx babel $transpileDir -d ./${temp}/${transpileDir}
}

function package {
    rm $zip_file
    cp package.json ./${temp}/
    cp yarn.lock ./${temp}/
    cp index.js ./${temp}/
    cd $temp
    yarn install --prod
    chmod -R a+r ./node_modules
    zip -r ../${zip_file} ${zip_contents[@]}
    cd -
}

function cleanup {
    rm -rf $temp
}

pushd `dirname $0`
cleanup
transpile
package
cleanup
popd