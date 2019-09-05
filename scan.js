// creates hashes of all files in a directory, recursively, and saves to hashes.json (minified)

// for reading large files in chunks:
// https://stackoverflow.com/questions/25110983/node-reading-file-in-specified-chunk-size

// todo: add additional error handling (try/catch - return reject() blocks)
// todo: quicker hashing algorithm for very large files? (if size remains constant and we hash the very beginning and end of the file, it likely didn't change)

// CONIFIG:
const DOCUMENT_DIRECTORY = "/Users/scottratigan/Downloads";
const HASH_FILE = "hashes.json";
const HASH_ALG = "SHA256";
const fileIgnores = { ".env": 1, ".DS_Store": 1 };
const directoryIgnores = { node_modules: 1 };

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
          // console.log("file is:", file);
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
    // console.log("object.name:", obj.name);
    const { name: file } = obj;
    if (obj.isFile() && !fileIgnores[file]) return path.join(dir, file);
    if (obj.isDirectory() && !directoryIgnores[file])
      return rfc(path.join(dir, file));
  });
}

function getHash(path) {
  // returns a promise to generate a hash of a given file
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
