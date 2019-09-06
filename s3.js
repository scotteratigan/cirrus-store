/* Upload Module - compresses and uploads local files to specified S3 bucket
 * Requires configuraion of options.js
 *
 * Files can be uploaded or downloaded in a streaming or synchronous fashion.
 * Speed advantages for small files to be handled synchronously.
 * Memory footprint advantage for piping/streaming larger files.
 *
 * Todos:
 * Test size breakpoint to determine which method is best.
 * Add encryption step as well (sha-256?)
 */

module.exports = {
  compressAndUploadFile,
  compressAndUploadFileSync,
  downloadAndDecompress
};

// Libraries:
const AWS = require("aws-sdk");
const fs = require("fs");
const stream = require("stream");
const lz4 = require("lz4"); // compression engine
// todo: determine compression type (sync or async based on file size - sync for small files, async large)

// Initialization:
const { s3Key, s3Secret, awsBucketName, awsRegion } = require("./options");
const s3 = new AWS.S3({
  accessKeyId: s3Key,
  secretAccessKey: s3Secret,
  region: awsRegion
});

function uploadFile(filePath) {
  // works but not currently used
  fs.readFile(filePath, (err, data) => {
    if (err) throw err;
    const params = {
      Bucket: awsBucketName,
      Key: filePath,
      Body: data
    };
    s3.upload(params, (s3Err, data) => {
      if (s3Err) throw s3Err;
      return console.log("file uploaded successfully:", data);
    });
  });
}

function compressFile(filePath) {
  // works but not currently used
  const encoder = lz4.createEncoderStream();
  const input = fs.createReadStream(filePath);
  const output = fs.createWriteStream(filePath + ".lz4");
  const stream = input.pipe(encoder).pipe(output);
  stream.on("finish", (err, data) => {
    console.log("err:", err);
    console.log("data:", data);
  });
}

function compressAndUploadFile(filePath) {
  const encoder = lz4.createEncoderStream();
  const input = fs.createReadStream(filePath);
  input.pipe(encoder).pipe(uploadFromStream(filePath + ".lz4"));
  input.on("finish", (err, data) => {
    console.log("upload completed");
  });
}

function compressAndUploadFileSync(filePath) {
  const newFileName = filePath + ".lz4";
  const input = fs.readFileSync(filePath);
  const encodedFile = lz4.encode(input);
  const params = {
    Bucket: awsBucketName,
    Key: filePath,
    Body: encodedFile
  };
  s3.upload(params, (s3Err, data) => {
    if (s3Err) throw s3Err;
    return console.log("file uploaded successfully:", data);
  });
}

function uploadFromStream(filePath) {
  // helper function, allows data stream from lz4 compression to be piped to s3 upload:
  const pass = new stream.PassThrough();
  const params = {
    Bucket: awsBucketName,
    Key: filePath,
    Body: pass // the data we're passing through
  };
  s3.upload(params, function(err, data) {
    console.log(err, data);
  });
  return pass;
}

function downloadFile(filePath) {
  const params = {
    Bucket: awsBucketName,
    Key: filePath
  };
  s3.getObject(params, (err, data) => {
    if (err) console.error(err);
    fs.writeFileSync(filePath, data.Body.toString());
    console.log(`${filePath} has been created!`);
  });
}

function downloadAndDecompress(filePath) {
  // helper function, allows data stream to be piped
  // const pass = new stream.PassThrough();
  const newFileName = "2" + filePath.replace(/.lz4$/, "");
  const decoder = lz4.createDecoderStream();
  const output = fs.createWriteStream(newFileName);
  const params = {
    Bucket: awsBucketName,
    Key: filePath
  };
  s3.getObject(params)
    .createReadStream()
    .pipe(decoder)
    .pipe(output);
}

function decompressFile(filePath) {
  // should be used on large files
  const decoder = lz4.createDecoderStream();
  const newFileName = "2" + filePath.replace(/.lz4$/, "");
  console.log("newFileName:", newFileName);
  const input = fs.createReadStream(filePath);
  const output = fs.createWriteStream(newFileName);
  input.pipe(decoder).pipe(output);
  input.on("error", err => {
    console.error("error captured:", err);
  });
}

function decompressFileSync(filePath) {
  // should be used on small files
  const newFileName = "2" + filePath.replace(/.lz4$/, "");
  var input = fs.readFileSync(filePath);
  var output = lz4.decode(input);
  fs.writeFileSync(newFileName, output);
}

// Additional reading here:
// https://stackoverflow.com/questions/43799246/s3-getobject-createreadstream-how-to-catch-the-error
// Could have saved myself some time by starting here
