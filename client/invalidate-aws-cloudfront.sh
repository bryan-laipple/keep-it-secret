#!/usr/bin/env bash
#
# This script will create an Amazon CloudFront invalidation to bust the CDR cache
#
# If your AWS CLI configuration has a named profile other than 'default' for AWS account
# then pass the profile name as the second argument.  If a profile is not passed as an argument
# the default profile is used.
#
# Usage:
#
# ./invalidate-aws-cloudfront.sh <distribution id> [<profile>]
#
distribution_id=$1
profile=${2:-default}

function bust_cdr_cache() {
	aws --profile ${profile} cloudfront create-invalidation --distribution-id ${distribution_id} --paths "/*"
}

pushd `dirname $0` > /dev/null
bust_cdr_cache
popd > /dev/null