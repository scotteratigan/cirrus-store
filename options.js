// Prefer js over json for more flexibility and ability to comment

// Be sure to configure .env with S3 access key.
// Example:
// S3_KEY_ID=CHOIUAEHLAKJDHFLJHFD
// S3_SECRET=CPf2jl2kj3f/sfjkfl32kjf8sdf/jflkdsjlkjs3

require("dotenv").config();

const options = {
  DOCUMENT_DIRECTORY: "/Users/scottratigan/Downloads", // You will want to change this
  HASH_FILE: "hashes.json", // saved in this directory
  HASH_ALG: "SHA256", // alternatives depend on your environment
  fileIgnores: { ".env": 1, ".DS_Store": 1, ".localized": 1 },
  directoryIgnores: { node_modules: 1 }, // just in case, lol
  maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB (10*1024*1024 or 10485760) is default. This is the size prior to compression.
  awsBucketName: "cirrus-store", // "cirrus-store" is default
  awsRegion: "us-west-1", // "us-west-1" is default
  s3Key: process.env.S3_KEY_ID,
  s3Secret: process.env.S3_SECRET
};

module.exports = options;
