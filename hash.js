/* Local File System Scanning Module
 * Creates a JSON file containg a list of files within a directory (and subdirectories) and the corresponding file size and hash
 * Scanning function is an efficient recursive function
 *
 * Todos:
 * Add additional error handling
 * Consider skipping re-hash of large files (video for example) where file size hasn't changed for performance
 * Hash large files in streaming fashion (pipes)
 */

// CONIFIG:
const options = require("./options");
const {
  DOCUMENT_DIRECTORY,
  HASH_FILE,
  HASH_ALG,
  fileIgnores,
  directoryIgnores,
  maxFileSizeBytes
} = options;

// INCLUDES:
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

module.exports = {
  createHashesFromFSscan,
  saveHashes,
  loadHashes,
  constructHashes
};

function loadHashes() {
  console.log("loading hashes from:", HASH_FILE);
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(HASH_FILE)) {
      console.error("No previous hash file found.");
      return resolve({});
    }
    fs.readFile(HASH_FILE, (err, data) => {
      if (err) return reject({});
      const jsonData = JSON.parse(data);
      return resolve(jsonData);
    });
  });
}

function saveHashes(json) {
  return new Promise((resolve, reject) => {
    if (!json) return reject("saveHashes called with no json supplied.");
    fs.writeFile(HASH_FILE, JSON.stringify(json), err => {
      if (err) return reject(err);
      console.log("Hashes saved to file.");
      return resolve();
    });
  });
}

function createHashesFromFSscan() {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Constructing file list...");
      const fileList = rfc(DOCUMENT_DIRECTORY) // previously "cloud"
        .flat()
        .filter(elm => typeof elm === "string");
      console.log("Calculating hashes for", fileList.length, "files...");
      const hashes = await constructHashes(fileList);
      return resolve(hashes);
    } catch (err) {
      return reject(err);
    }
  });
}

function constructHashes(fileArr) {
  return new Promise(async (resolve, reject) => {
    const hashes = {};
    await Promise.all(
      fileArr.map(file => {
        return new Promise(async (resolve, reject) => {
          hashes[file] = await getHash(file);
          return resolve();
        });
      })
    );
    return resolve(hashes);
  });
}

function rfc(dir) {
  // Recursive File Search - returns an array of strings representing the relative path from the base directory
  const objs = fs.readdirSync(dir, { withFileTypes: true });
  return objs.map(obj => {
    const { name: file } = obj;
    const stats = fs.statSync(path.join(dir, file)); // todo: make this non-sync
    const fileSizeInBytes = stats.size;
    // console.log(obj.name, "-", fileSizeInBytes, "/", maxFileSizeBytes);
    // todo: save file creation, modification, and access information (obj.Stats)
    // https://nodejs.org/api/fs.html#fs_class_fs_dirent
    if (
      obj.isFile() &&
      !fileIgnores[file] &&
      fileSizeInBytes <= maxFileSizeBytes
    )
      return path.join(dir, file);
    if (obj.isDirectory() && !directoryIgnores[file])
      return rfc(path.join(dir, file));
  });
}

function getHash(path) {
  // Returns a promise to generate a hash of a given file
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(HASH_ALG);
    const fileSize = getFilesizeInBytes(path);
    const rs = fs.createReadStream(path);
    rs.on("error", reject);
    rs.on("data", chunk => hash.update(chunk));
    rs.on("end", () => {
      return resolve([hash.digest("hex"), fileSize]);
    });
  });
}

function getFilesizeInBytes(filename) {
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

// https://stackoverflow.com/questions/25110983/node-reading-file-in-specified-chunk-size
