#! /bin/bash
#
# $Id: deploy.sh,v 1.7 2013/07/19 11:28:07 gaudenz Exp $
# Copyright (c) 2006-2013, JGraph Ltd
#
# See LICENSE file for license details. If you are unable to locate
# this file please contact info (at) jgraph (dot) com.
#
BUILD=`dirname $0`
WEBROOT=/var/www
VERSION=`cat $BUILD/version.txt | sed "s/\./_/g"`
DOTVERSION=`cat $BUILD/version.txt`

echo "Deploying from $BUILD to $WEBROOT..."
echo

cp -v $BUILD/jgraphx-demo.jar $WEBROOT/demo/jgraphx/
cp -v $BUILD/jgraphx.jnlp $WEBROOT/demo/jgraphx/
cp -v $BUILD/jgraphx.zip $WEBROOT/downloads/jgraphx/archive/jgraphx-$VERSION.zip
cp -v $BUILD/mxgraph-distro.zip $WEBROOT/downloads/mx2/mxgraph-$VERSION.zip
cp -v $BUILD/mxgraph-china.zip $WEBROOT/downloads/mx-cn/mxgraph-china-$VERSION.zip
cp -v $BUILD/ChangeLog $WEBROOT/

# Update mxgraph on github
echo
echo "Updating mxgraph on github..."
cd ~
date=`date +"%H%M%S%d%m%y"`
mkdir tmp-$date
cd tmp-$date
git clone git@github.com:jgraph/mxgraph.git
cp $BUILD/mxgraph-distro.zip .
mkdir tmp
unzip mxgraph-distro.zip -d tmp
cp mxgraph/README.md tmp/mxgraph
cd tmp/mxgraph/javascript/
mv src/js/mxClient.js mxClient.min.js
mv debug/js/mxClient.js .
rm -rf debug
unzip devel/source.zip
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
rm -rf tmp

# Update mxgraph pages on github
echo
echo "Updating mxgraph pages on github..."
cd ~/tmp-$date/mxgraph
git checkout gh-pages
cd ..
cp $BUILD/mxgraph-distro.zip .
mkdir tmp
unzip mxgraph-distro.zip -d tmp
cp mxgraph/README.md tmp/mxgraph
cd tmp/mxgraph/javascript/
rm -rf debug devel
cd ~/tmp-$date
rm -rf mxgraph/*
cp -rf tmp/mxgraph/* mxgraph/
cd mxgraph
git add .
git commit -am "$DOTVERSION release"
git push origin gh-pages
git tag -a v$DOTVERSION -m "v$DOTVERSION"
git push origin gh-pages --tags
cd ../..
rm -rf tmp-$date/*

# Update jgraphx on github
echo
echo "Updating jgraphx on github..."
cd tmp-$date
git clone git@github.com:jgraph/jgraphx.git
cp $BUILD/jgraphx.zip .
mv jgraphx/README.md .
rm -rf jgraphx/*
mv README.md jgraphx
unzip -o jgraphx.zip
cd jgraphx
git add .
git commit -am "$DOTVERSION release"
git push origin master
git tag -a v$DOTVERSION -m "v$DOTVERSION"
git push origin --tags
cd ../..
rm -rf tmp-$date

echo
echo "Deployed from $BUILD to $WEBROOT"
echo "Changelog is at http://www.jgraph.com/mxgraphlog.html"
echo "Done."
