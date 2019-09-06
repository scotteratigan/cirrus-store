# cirrus-store

## A cloud-based storage system built on AWS S3.

Taking inspiration from modern products like DropBox, re-create the basic functionality cloud storage utilizing AWS S3 Buckets.

Upon system startup, run the file scan to search for changes to files.
Then, keep a monitoring process running in the background to catch file changes as they happen.
When a change is detected, update the S3 bucket.
Compress files prior to upload to save bandwidth.
Folders and Files can be excluded from scanning based on configured options.

## To Get Started

Create an AWS account: https://aws.amazon.com/
Create an S3 bucket. Be sure to create it in the closest region. Default is "us-west-1" Keep the bucket private (default is private). https://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html
Create an access key with Programmatic access (not console) with full permissions for S3 (Read & Write): https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey
Enter the access key info into .env.sample, and rename that file to .env
Enter the bucket name into options.js and local file system path (DOCUMENT_DIRECTORY) and region if necessary.
Once configured, node cirrus-store to upload all files in DOCUMENT_DIRECTORY to the specified bucket.
Running the command again will auto-update the bucket to mirror your local file system

## Future Goals:

Encrypt the file paths and contents so that no personal information is exposed in the cloud.
Detect when files are moved and trigger a lamda function to handle that in the cloud rather than re-uploading entire file.
Handle conflicts - cloud data may be newer than local FS. (the rename -conflicted model seems like a good idea, need to look at timestamps)
Store Hash file in cloud too in order to allow multiple active clients for same account/bucket
