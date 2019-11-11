#! /bin/bash
#
# Copyright (c) 2006-2013, JGraph Ltd
#
# See LICENSE file for license details. If you are unable to locate
# this file please contact info (at) jgraph (dot) com.
#
BUILD=`dirname $0`
DOTVERSION=`cat $BUILD/version.txt`

# Replaces all dots with underscores
VERSION=`cat $BUILD/version.txt | sed "s/\./_/g"`

cd $BUILD
BUILD=`pwd`

# Update mxgraph on github
echo
echo "Updating mxgraph and mxgraph-js on github..."
cd ~
date=`date +"%H%M%S%d%m%y"`
mkdir tmp-$date
cd tmp-$date
cp $BUILD/mxgraph-distro.zip .
mkdir tmp
unzip -qq mxgraph-distro.zip -d tmp
git clone git@github.com:jgraph/mxgraph.git

# Publish to NPM
sed "s/@VERSION@/$DOTVERSION/" $BUILD/../etc/build/mxgraph-package.json > tmp/mxgraph/package.json
mkdir -p tmp/mxgraph/etc/build
cp -v $BUILD/../etc/build/Gruntfile.js tmp/mxgraph/etc/build/
cp -v $BUILD/../etc/build/.npmignore tmp/mxgraph/

cp mxgraph/README.md tmp/mxgraph
cp mxgraph/LICENSE tmp/mxgraph
cd tmp/mxgraph/javascript/
mv src/js/mxClient.js mxClient.min.js
mv debug/js/mxClient.js .
rm -rf debug
unzip -qq devel/source.zip
rm -rf devel
cd -
rm -rf mxgraph/*
cp -rf tmp/mxgraph/* mxgraph/
cp -v $BUILD/../etc/build/.npmignore mxgraph/
cd mxgraph
git add .
git commit -am "$DOTVERSION release"
git push origin master
git tag -a v$DOTVERSION -m "v$DOTVERSION"
git push origin --tags

# Publish mxgraph to NPM
npm install
npm run prepare
npm publish --access public
cd ..

# Copy selected resources to mxgraph-js and generate package.json
echo
echo "Updating mxgraph-js on github..."
git clone git@github.com:jgraph/mxgraph-js.git
sed "s/@VERSION@/$DOTVERSION/" $BUILD/../etc/build/mxgraph-js-package.json > mxgraph-js/package.json
cp tmp/mxgraph/ChangeLog mxgraph-js
cp tmp/mxgraph/LICENSE mxgraph-js
cp -rf tmp/mxgraph/javascript mxgraph-js
cd mxgraph-js
git add .
git commit -am "$DOTVERSION release"
git push origin master
git tag -a v$DOTVERSION -m "v$DOTVERSION"
git push origin --tags
cd ..

# Clean up
rm -rf tmp

# Update jgraphx on github
echo
echo "Updating jgraphx on github..."
git clone git@github.com:jgraph/jgraphx.git
cp $BUILD/jgraphx.zip .
mv jgraphx/README.md .
rm -rf jgraphx/*
mv README.md jgraphx
unzip -qq -o jgraphx.zip
cd jgraphx
git add -A
git commit -am "$DOTVERSION release"
git push origin master
git tag -a v$DOTVERSION -m "v$DOTVERSION"
git push origin --tags
cd ../..
rm -rf tmp-$date

echo
echo "Updating mxgraph jars to Github Package Registry..."
cd $BUILD/mxgraph/java
mvn deploy:deploy-file -DgroupId=com.mxgraph -DartifactId=mxgraphx-core -Dversion=$DOTVERSION -Dpackaging=jar -Dfile=lib/mxgraph-core.jar -DrepositoryId=github -Durl=https://maven.pkg.github.com/jgraph/mxgraph
mvn deploy:deploy-file -DgroupId=com.mxgraph -DartifactId=mxgraphx-swing -Dversion=$DOTVERSION -Dpackaging=jar -Dfile=lib/mxgraph-swing.jar -DrepositoryId=github -Durl=https://maven.pkg.github.com/jgraph/mxgraph
mvn deploy:deploy-file -DgroupId=com.mxgraph -DartifactId=mxgraphx-all -Dversion=$DOTVERSION -Dpackaging=jar -Dfile=lib/mxgraph-all.jar -DrepositoryId=github -Durl=https://maven.pkg.github.com/jgraph/mxgraph
#mvn deploy:deploy-file -DgroupId=com.mxgraph -DartifactId=mxPdf -Dversion=1.0.2 -Dpackaging=jar -Dfile=jars/mxPdf.jar -DrepositoryId=github -Durl=https://maven.pkg.github.com/jgraph/mxgraph

echo
echo "Done."
