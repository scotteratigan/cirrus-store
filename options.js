// Prefer js over json for more flexibility and ability to comment

const options = {
  DOCUMENT_DIRECTORY: "/Users/scottratigan/Downloads",
  HASH_FILE: "hashes.json",
  HASH_ALG: "SHA256",
  fileIgnores: { ".env": 1, ".DS_Store": 1 },
  directoryIgnores: { node_modules: 1 },
  bucketName: "cirrus-store"
};

module.exports = options;
