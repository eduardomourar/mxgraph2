#! /bin/bash
#
# Copyright (c) 2006-2013, JGraph Ltd
#
# See LICENSE file for license details. If you are unable to locate
# this file please contact info (at) jgraph (dot) com.
#
# This script creates the following distributions:
#
# jgraphx.zip: Java source code, BSD license
# mxgraph-eval.zip: Eval license, full JS code
# mxgraph-full-src.zip: Commercial license, full JS code
#

# Other build variables
VERSION=`cat VERSION`
TODAY=`date '+%d. %B %Y'`
DIR=build/mxgraph
JSFILE=$DIR/javascript/src/js/mxClient.js
DEBUGFILE=$DIR/javascript/debug/js/mxClient.js
JSDOC=/opt/system/bin/naturaldocs/NaturalDocs
DOXYGEN=/usr/bin/doxygen
PERL=/usr/bin/perl
JSDIR=javascript/src/js
PHPDIR=$DIR/php/src

# Echo version
echo "Building $VERSION..."

# Cleans the build directory
echo "Cleaning $DIR..."
rm -rf $DIR
mkdir -p `dirname $JSFILE`

# Generates docs directory
echo "Generating API docs..."
sed "s/@MXGRAPH-VERSION@/$VERSION/;s/@MXGRAPH-DATE@/$TODAY/" index.html > $DIR/index.html

mkdir -p $DIR/docs
cp -r 2>/dev/null docs/images $DIR/docs/
cp -r 2>/dev/null docs/css $DIR/docs/
rm -rf $DIR/docs/css/CVS
cp -r 2>/dev/null docs/js $DIR/docs/
rm -rf $DIR/docs/js/CVS
cp 2>/dev/null docs/tutorial.html $DIR/docs/
cp 2>/dev/null docs/stencils.xsd $DIR/docs/
sed "s/@MXGRAPH-VERSION@/$VERSION/;s/@MXGRAPH-DATE@/$TODAY/" docs/manual.html > $DIR/docs/manual.html
sed "s/@MXGRAPH-VERSION@/$VERSION/;s/@MXGRAPH-DATE@/$TODAY/" docs/manual_javavis.html > $DIR/docs/manual_javavis.html
cp 2>/dev/null docs/known-issues.html $DIR/docs/
cp 2>/dev/null docs/mxGraphUserManual.pdf $DIR/docs/

# Copies Resources
echo "Copying Resources..."
cp -r 2>/dev/null ChangeLog $DIR/
cp -r 2>/dev/null mxgraph-dotnet.sln $DIR/
cp -r 2>/dev/null etc/build/.project $DIR/
cp -r 2>/dev/null etc/build/.classpath $DIR/
cp -r 2>/dev/null javascript/index.html $DIR/javascript
cp -r 2>/dev/null javascript/examples $DIR/javascript
cp -r 2>/dev/null javascript/src/css $DIR/javascript/src
cp -r 2>/dev/null javascript/src/images $DIR/javascript/src
cp -r 2>/dev/null javascript/src/resources $DIR/javascript/src
cp -r 2>/dev/null dotnet $DIR/dotnet
cp -r 2>/dev/null java $DIR/java
cp -r 2>/dev/null php $DIR/php

# Replaces the version number in the Java build files and mxGraph classes
rm -f $DIR/dotnet/src/view/mxGraph.cs
sed "s/@MXGRAPH-VERSION@/$VERSION/;s/@MXGRAPH-DATE@/$TODAY/" dotnet/src/view/mxGraph.cs > $DIR/dotnet/src/view/mxGraph.cs

rm -f $DIR/php/src/mxServer.php
sed "s/@MXGRAPH-VERSION@/$VERSION/;s/@MXGRAPH-DATE@/$TODAY/" php/src/mxServer.php > $DIR/php/src/mxServer.php

rm -f $DIR/java/src/com/mxgraph/view/mxGraph.java
sed "s/@MXGRAPH-VERSION@/$VERSION/;s/@MXGRAPH-DATE@/$TODAY/" java/src/com/mxgraph/view/mxGraph.java > $DIR/java/src/com/mxgraph/view/mxGraph.java

rm -f $DIR/java/build.xml
sed "s/@MXGRAPH-VERSION@/$VERSION/;s/@MXGRAPH-DATE@/$TODAY/" java/build.xml > $DIR/java/build.xml

# Generates PHP API docs
mkdir -p build/tmp
mkdir -p $DIR/docs/php-api
$JSDOC -img $DIR/docs -i $PHPDIR -i $PHPDIR/model -i $PHPDIR/util \
	-i $PHPDIR/view -i $PHPDIR/canvas \
	-i $PHPDIR/reader -o HTML $DIR/docs/php-api -p build/tmp
rm -rf build/tmp

# Builds Java version and Javadocs
cd $DIR/java
#export JAVA_HOME=$JAVA
ant
cd - >/dev/null

# Builds Dotnet API docs
cd $DIR/dotnet
$DOXYGEN ../../../etc/build/Doxyfile
# Compilation currently not required
# gmcs -target:library -r:System.Windows.Forms.dll -r:System.Drawing.dll \
# -recurse:src/*.cs -out:dotnet.dll -doc:dotnet.xml
cd - >/dev/null

# Builds JavaScript version
cd etc/build
ant
cd - >/dev/null
mkdir -p $DIR/javascript/debug/js
mkdir -p $DIR/javascript/src/js
mv etc/build/mxClient-debug.js $DEBUGFILE
mv etc/build/mxClient.js $JSFILE

# Removes CVS directories
find $DIR -name CVS | xargs rm -rf

# Creates JavaScript source archive
mkdir -p $DIR/javascript/src/src
cp -r 2>/dev/null javascript/src/js $DIR/javascript/src/src

rm -f $DIR/javascript/src/src/js/mxClient.js
sed "s/@MXGRAPH-VERSION@/$VERSION/;s/@MXGRAPH-DATE@/$TODAY/" javascript/src/js/mxClient.js > $DIR/javascript/src/src/js/mxClient.js

find $DIR/javascript/src/src -name CVS | xargs rm -rf
JSDDIR=$DIR/javascript/src/src/js

# Generates JavaScript API docs
mkdir -p build/tmp
mkdir -p $DIR/docs/js-api

$JSDOC -img $DIR/docs -i $JSDDIR -i $JSDDIR/model \
	-i $JSDDIR/util -i $JSDDIR/editor -i $JSDDIR/handler \
	-i $JSDDIR/layout -i $JSDDIR/shape -i $JSDDIR/view \
	-i $JSDDIR/layout/hierarchical \
	-i $JSDDIR/layout/hierarchical/model \
	-i $JSDDIR/layout/hierarchical/stage \
	-i $JSDDIR/io -o HTML $DIR/docs/js-api -p build/tmp
rm -rf build/tmp

cd $DIR/javascript/src; zip -q -r ../source.zip src/*; rm -rf src; cd - >/dev/null
mkdir -p $DIR/javascript/devel
mv $DIR/javascript/source.zip $DIR/javascript/devel/
find $DIR -name .cvsignore | xargs rm -rf

echo "Generating distribution..."
cd build; zip 2>/dev/null -q -r mxgraph-distro.zip mxgraph/.classpath mxgraph/.project mxgraph/*; cd ..

# Creates archive for open source JGraph 6+
echo "Creating archive for open source Java distribution..."
cd build
mkdir -p jgraphx/lib
mkdir -p jgraphx/docs/manual/images
mkdir -p jgraphx/examples/com/mxgraph/examples/swing

sed "s/@MXGRAPH-VERSION@/$VERSION/;s/@MXGRAPH-DATE@/$TODAY/" ../docs/manual_javavis.html > jgraphx/docs/manual/index.html
cp -r ../docs/css jgraphx/docs/manual
rm -rf jgraphx/docs/manual/css/CVS
cp -r ../docs/js jgraphx/docs/manual
rm -rf jgraphx/docs/manual/js/CVS
cp ../docs/images/mx_man_* jgraphx/docs/manual/images

cp -r 2>/dev/null mxgraph/java/lib/jgraphx.jar jgraphx/lib
cp -r 2>/dev/null mxgraph/java/examples/com/mxgraph/examples/swing jgraphx/examples/com/mxgraph/examples
cp -r 2>/dev/null mxgraph/java/src jgraphx
cp ../docs/jgraphx_license.txt jgraphx/license.txt

sed "s/@MXGRAPH-VERSION@/$VERSION/;s/@MXGRAPH-DATE@/$TODAY/" ../etc/build/jgraphx-build.xml > jgraphx/build.xml
sed "s/@MXGRAPH-VERSION@/$VERSION/;s/@MXGRAPH-DATE@/$TODAY/" ../etc/build/jgraphx-pom.xml > jgraphx/pom.xml
cd jgraphx
ant
cd ..
zip 2>/dev/null -q -r jgraphx.zip jgraphx/*;

sed "s/@MXGRAPH-VERSION@/$VERSION/;s/@MXGRAPH-DATE@/$TODAY/" ../etc/build/jgraphx-www-build.xml > jgraphx/build-www.xml
cd jgraphx
ant -f build-www.xml
cp lib/jgraphx-demo.jar ../
cd ..
rm -rf jgraphx
cd ..

cp VERSION build/version.txt
cp ChangeLog build/
cp etc/build/deploy.sh build/
cp etc/build/jgraphx.jnlp build/

echo "Build Done. Execute build/deploy.sh for deployment."
