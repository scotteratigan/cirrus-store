const { createHashesFromFSscan, saveHashes, loadHashes } = require("./scan");

test();

async function test() {
  const prevHashes = await loadHashes();
  const newHashes = await createHashesFromFSscan();
  const removedFiles = scanForRemovedFiles(prevHashes, newHashes);
  console.log("total removed files:", removedFiles.length);
  const addedFiles = scanForNewFiles(prevHashes, newHashes);
  console.log("total added files:", addedFiles.length);
  const updatedFiles = scanForUpdatedFiles(prevHashes, newHashes);
  console.log("total files modified:", updatedFiles.length);
  await saveHashes(newHashes);
}

function scanForRemovedFiles(prevHashes, newHashes) {
  const prevFileList = Object.keys(prevHashes);
  const removedFiles = [];
  prevFileList.forEach(file => {
    if (!newHashes[file]) {
      console.log("file removed:", file);
      removedFiles.push(file);
    }
  });
  return removedFiles;
}

function scanForNewFiles(prevHashes, newHashes) {
  const currFileList = Object.keys(newHashes);
  const addedFiles = [];
  currFileList.forEach(file => {
    if (!prevHashes[file]) {
      console.log("File added:", file);
      addedFiles.push(file);
    }
  });
  return addedFiles;
}

function scanForUpdatedFiles(prevHashes, newHashes) {
  const fileList = Object.keys(newHashes);
  const updatedFiles = [];
  fileList.forEach(file => {
    if (!prevHashes[file] || !newHashes[file]) return;
    // skip files that don't exist - handled in scanForNewFiles and scanForRemovedFiles
    if (prevHashes[file][1] !== newHashes[file][1]) {
      console.log(`File: ${file} - size changed.`);
      updatedFiles.push(file);
    } else if (prevHashes[file][0] !== newHashes[file][0]) {
      console.log(`File: ${file} - hash changed.`);
      updatedFiles.push(file);
    }
  });
  return updatedFiles;
}