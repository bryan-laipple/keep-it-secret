# keep-it-secret
Serverless app for securing data in Amazon Cognito


## Serverless Backend

The backend heavily leverages these AWS services:
- S3
- CloudFront
- Route53
- Mobile Hub
- Cognito
- Lambda and Lambda@Edge
- SES

### Configuration

Create an AWS Mobile Hub project that uses a Cognito User Pool.
In the Mobile Hub project you can also create a CloudFront distribution, however, I generated one separately.

Hook up CloudFront/Route53/S3 according to your needs.  Since this project is trying to secure data I'm only supporting
HTTPS on my custom domain with an S3 origin.

The Lambda functions in `lambdas` dir expect a `config.json` file that is ignored by git.
Create **`lambda/config.json`** with the following structure:
```
{
  "congito": {
    "from_email": "<from email>"
  },
  "allowed": [
    "<path of allowed resources>",
    "<path of another allowed resources>",
  ],
  "validations": [
    {
      "path": "<path>",
      "expected": "<expected value>"
    },
    <other validations against the request>
  ]
}
```

## Client

This `client` leverages
[create-react-app](https://github.com/facebookincubator/create-react-app),
[awsmobile-cli](https://github.com/aws/awsmobile-cli) and
[aws-amplify](https://github.com/aws/aws-amplify).

This [quick start guide](https://aws.github.io/aws-amplify/media/quick_start) from aws-amplify explains the steps
used to get the `client` bootstrapped and configured.

### Configuration

Once AWS Mobile Hub project is set up in your AWS account you can configure the client
(generating **`client/src/aws-exports.js`**) by running:
```
$ awsmobile init <mobile-hub-project-id>
```

Create `client/src/config.json` (ignored by git) with the following structure:
```
{
  "custom_attribute": {
    "name": "<attribute name>",
    "max_length": <max length>
  }
}
```

### Build and Deploy

Two scripts are provided to build and deploy the client (requires AWS CLI to be installed):
**`client/deploy-to-aws-s3.sh`** and **`client/invalidate-aws-cloudfront.sh`**

**NOTE:** At the time of this writing, AWS CLI support for CloudFront is only available in a preview stage.
Update your CLI config file by running the following command
before trying to execute the `invalidate-aws-cloudfront.sh` script:
```
$ aws configure set preview.cloudfront true
```

The two scripts can easily be combined in another script that is ignored by git named **`client/run-deploy.sh`**` in
order to hide sensitive information:
```
#!/usr/bin/env bash

profile=<your aws cli profile name>
bucket=<your s3 bucket>
distribution_id=<your cloudfront distribution id>

pushd `dirname $0` > /dev/null
./deploy-to-aws-s3.sh ${bucket} ${profile} /site && \
./invalidate-aws-cloudfront.sh ${distribution_id} ${profile}
popd > /dev/null
```
