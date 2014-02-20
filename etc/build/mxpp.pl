#!/usr/local/bin/perl
#
# mxGraph Preprocessor replaces all mxClient.includes with the contents of the
# respective file in build/tmp

while ($_ = <STDIN>)
{
	if (s/mxClient.include.mxClient.basePath\+.\/js/build\/tmp/)
	{
		$_ =~ s/.\).//;
		print STDERR "Merging $_";
		open(INCL, $_) || die("Could not open file!");
		print <INCL>;
		close(INCL);
	}
	else
	{
		print $_;
	}
}
