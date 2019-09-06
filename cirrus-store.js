// Includes:
const {
  returnHashes,
  scanForNewFiles,
  scanForRemovedFiles,
  scanForUpdatedFiles
} = require("./scan");
const { compressAndUploadFile, deleteRemoteFile } = require("./s3");
const { saveHashes } = require("./hash");
const { DOCUMENT_DIRECTORY } = require("./options");

// Initialization:
syncToCloud();

async function syncToCloud() {
  const { prevHashes, newHashes } = await returnHashes();
  const newFileArr = await scanForNewFiles(prevHashes, newHashes);
  console.log("New Files to Add:", newFileArr.length);
  uploadFiles(newFileArr);
  saveHashes(newHashes);
  const updatedFileArr = await scanForUpdatedFiles(prevHashes, newHashes);
  console.log("Modified files to update:", updatedFileArr);
  uploadFiles(updatedFileArr);
  const removedFileArr = await scanForRemovedFiles(prevHashes, newHashes);
  console.log("Files to Remove:", removedFileArr.length);
  deleteFiles(removedFileArr);
}

function uploadFiles(fileArr) {
  if (!fileArr) return;
  // todo: implement queue so we send x file transfers at a time
  fileArr.forEach(async localFilePath => {
    const baseDirRegex = new RegExp(`^${DOCUMENT_DIRECTORY}/`);
    const remoteFilePath = localFilePath.replace(baseDirRegex, "");
    console.log("uploading file:", localFilePath, "to:", remoteFilePath);
    await compressAndUploadFile(localFilePath, remoteFilePath);
  });
}

function deleteFiles(fileArr) {
  if (!fileArr) return;
  fileArr.forEach(localFilePath => {
    const baseDirRegex = new RegExp(`^${DOCUMENT_DIRECTORY}/`);
    const remoteFilePath = localFilePath.replace(baseDirRegex, "") + ".lz4";
    deleteRemoteFile(remoteFilePath);
  });
}
