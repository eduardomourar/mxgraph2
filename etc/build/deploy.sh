#! /bin/bash
#
# Copyright (c) 2006-2013, JGraph Ltd
#
# See LICENSE file for license details. If you are unable to locate
# this file please contact info (at) jgraph (dot) com.
#
BUILD=`dirname $0`
WEBROOT=/var/www/www.jgraph.com
DOTVERSION=`cat $BUILD/version.txt`

# Replaces all dots with underscores
VERSION=`cat $BUILD/version.txt | sed "s/\./_/g"`

cd $BUILD
BUILD=`pwd`

echo "Deploying from $BUILD to $WEBROOT..."
echo

cp -v $BUILD/jgraphx-demo.jar $WEBROOT/demo/jgraphx/
cp -v $BUILD/jgraphx.jnlp $WEBROOT/demo/jgraphx/
cp -v $BUILD/jgraphx.zip $WEBROOT/downloads/jgraphx/archive/jgraphx-$VERSION.zip
cp -v $BUILD/mxgraph-distro.zip $WEBROOT/downloads/mx2/mxgraph-$VERSION.zip
cp -v $BUILD/ChangeLog $WEBROOT/

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
cp -v $BUILD/../etc/build/Gruntfile.js tmp/mxgraph/
npm publish tmp/mxgraph --access public
mv tmp/mxgraph/Gruntfile.js tmp/mxgraph/etc/build/Gruntfile.js

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
cd mxgraph
git add .
git commit -am "$DOTVERSION release"
git push origin master
git tag -a v$DOTVERSION -m "v$DOTVERSION"
git push origin --tags
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
echo "Deployed from $BUILD to $WEBROOT"
echo "Changelog is at https://www.jgraph.com/mxchangelog.html"
echo "Done."
