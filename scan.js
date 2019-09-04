// for reading large files in chunks:
// https://stackoverflow.com/questions/25110983/node-reading-file-in-specified-chunk-size

const HASH_ALG = "sha256";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const fileIgnores = { ".env": 1, ".DS_Store": 1 };
const directoryIgnores = { node_modules: 1 };

(async function() {
  console.log("Constructing file list...");
  const fileList = rfc("/Users/scottratigan/Downloads") // previously "cloud"
    .flat()
    .filter(elm => typeof elm === "string");
  // console.log("fileList:", fileList);
  console.log("Calculating hashes for", fileList.length, "files...");
  const hashes = await constructHashes(fileList);
  // console.log("hashes:", hashes);
  saveHashJson(hashes);
})();

function saveHashJson(json) {
  fs.writeFile("hashes.json", JSON.stringify(json), err => {
    if (err) throw err;
    console.log("Hashes saved to hashes.json");
  });
}

function constructHashes(fileArr) {
  return new Promise(async (resolve, reject) => {
    const hashes = {};
    const hashArr = await Promise.all(
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

// async function constructHashes2(fileArr) {
//   const fileHashes = {};
//   for (let i = 0; i < fileArr.length; i++) {
//     const file = fileArr[i];
//     fileHashes[file] = await getHash(file);
//   }
//   return fileHashes;
// }

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
  // console.log("getting hash for:", path);
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(HASH_ALG);
    const rs = fs.createReadStream(path);
    rs.on("error", reject);
    rs.on("data", chunk => hash.update(chunk));
    rs.on("end", () => resolve(hash.digest("hex")));
  });
}
