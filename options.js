// Prefer js over json for more flexibility and ability to comment

// Be sure to configure .env with S3 access key.
// Example:
// S3_KEY_ID=CHOIUAEHLAKJDHFLJHFD
// S3_SECRET=CPf2jl2kj3f/sfjkfl32kjf8sdf/jflkdsjlkjs3

require("dotenv").config();

const options = {
  DOCUMENT_DIRECTORY: "/Users/scottratigan/Downloads",
  HASH_FILE: "hashes.json",
  HASH_ALG: "SHA256",
  fileIgnores: { ".env": 1, ".DS_Store": 1 },
  directoryIgnores: { node_modules: 1 },
  awsBucketName: "cirrus-store",
  awsRegion: "us-west-1",
  s3Key: process.env.S3_KEY_ID,
  s3Secret: process.env.S3_SECRET
};

module.exports = options;
