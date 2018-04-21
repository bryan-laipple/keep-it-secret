#!/usr/bin/env bash
#
# This script will build and deploy the project to AWS S3
#
# If your AWS CLI configuration has a named profile other than 'default' for AWS account
# then pass the profile name as the second argument.  If a profile is not passed as an argument
# the default profile is used.
#
# Usage:
#
# ./deploy-to-aws-s3.sh <bucket> [<profile> [<path>]]
#
bucket=$1
profile=${2:-default}
path=${3}

function build() {
	rm -rf build
	yarn build
}

function deploy() {
	aws --profile ${profile} s3 sync ./build s3://${bucket}${path} --exclude "*" --include "static/*" --delete && \
	aws --profile ${profile} s3 sync ./build s3://${bucket}${path} --exclude "static/*" --exclude "default/*" --delete
	aws --profile ${profile} s3 sync ./default s3://${bucket}${path}/default --delete
}

pushd `dirname $0` > /dev/null
build && deploy
popd > /dev/null