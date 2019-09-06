/* Module to monitor the specified directory for file changes.
 *
 * Todos:
 * Trigger a new upload to S3 on update
 */

module.exports = { watchfs };

const chokidar = require("chokidar");

async function watchFS() {
  // One-liner for current directory, ignores .dotfiles
  chokidar.watch(".", { ignored: /(^|[\/\\])\../ }).on("all", (event, path) => {
    console.log(event, path);
  });

  // Loop forever waiting for events...
  for (i = 0; true; i++) {
    console.log("waiting for FS events...");
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        return resolve();
      }, 10000);
    });
  } // Todo: better way to keep process running
}
