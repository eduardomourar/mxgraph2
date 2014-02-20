#! /bin/bash
#
# build.sh,v 1.1 16.02.2006 22:33:37 gaudenz Exp $
# Copyright (c) 2006, Gaudenz Alder
#
# See LICENSE file for license details. If you are unable to locate
# this file please contact info (at) jgraph (dot) com.
#
JSDOC=/opt/system/bin/naturaldocs/NaturalDocs
dir=`dirname $0`

# Creates core distribution
cd $dir/../../../
chmod 775 build.sh
./build.sh notag
cd -

# Uncompresses core distribution as basis for visa distribution
cd $dir/../../../build
unzip mxgraph-full.zip
cd -

# Merges core distribution with visa project files
mkdir -p $dir/../../../build/mxgraph-visa/visa
mv $dir/../../../build/mxgraph  $dir/../../../build/mxgraph-visa
cp -r $dir $dir/../../../build/mxgraph-visa/visa

# Removes unused files from distribution
find $dir/../../../build/mxgraph-visa/visa -name CVS | xargs rm -rf
rm -rf $dir/../../../build/mxgraph-visa/visa/build.sh
rm -rf $dir/../../../build/mxgraph-visa/visa/TODO

# Creates JS documentation
mkdir -p $dir/../../../build/mxgraph-visa/visa/docs/js-api
mkdir -p $dir/../../../build/tmp
$JSDOC -i $dir/../../../build/mxgraph-visa/visa/javascript/src/js \
	-o FramedHTML $dir/../../../build/mxgraph-visa/visa/docs/js-api \
	-p $dir/../../../build/tmp
rm -rf $dir/../../../build/tmp

# Creates PHP documentation
mkdir -p $dir/../../../build/mxgraph-visa/visa/docs/php-api
mkdir -p $dir/../../../build/tmp
$JSDOC -i $dir/../../../build/mxgraph-visa/visa/php/src \
	-o FramedHTML $dir/../../../build/mxgraph-visa/visa/docs/php-api \
	-p $dir/../../../build/tmp
rm -rf $dir/../../../build/tmp

# Creates compressed archive
cd $dir/../../../build; zip 2>/dev/null -q -r mxgraph-visa.zip mxgraph-visa/*; cd -
rm -rf $dir/../../../build/mxgraph-visa

echo "Created $dir/../../../build/mxgraph-visa.zip"
echo "Done."
