const chokidar = require("chokidar");

// One-liner for current directory, ignores .dotfiles
chokidar.watch(".", { ignored: /(^|[\/\\])\../ }).on("all", (event, path) => {
  console.log(event, path);
});

(async function() {
  for (i = 0; true; i++) {
    console.log("waiting for FS events...");
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        return resolve();
      }, 10000);
    });
  }
})();
