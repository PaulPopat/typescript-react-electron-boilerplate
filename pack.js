// tslint:disable:no-var-requires
const { execSync } = require("child_process");
const fs = require("fs");
const sass = require("node-sass");
const path = require("path");
const process = require("process");
const shell = require("shelljs");
const request = require("sync-request");
const unzip = require("unzip");

/*
NOTE: This file is designed to be used with ts-node
*/

const copy = (file, target) => {
  shell.mkdir("-p", path.dirname(target));
  fs.createReadStream(file).pipe(fs.createWriteStream(target));
};

const deleteFolderRecursive = dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
        continue;
      }

      fs.unlinkSync(curPath);
    }

    fs.rmdirSync(dir);
  }
};

const ofType = (extension, directory) => {
  const result = [];
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const name = path.join(directory, file);
    if (file.endsWith(extension)) {
      result.push(name);
      continue;
    }

    if (fs.statSync(name).isDirectory()) {
      const results = ofType(extension, name);
      for (const r of results) {
        result.push(r);
      }
    }
  }

  return result;
};

const deleteFile = file => {
  fs.unlinkSync(file);
};

const build = () => {
  console.log("Running install");
  execSync("npm install", {
    stdio: [0, 1, 2]
  });

  console.log("Clearing dist folder");
  deleteFolderRecursive("dist");

  console.log("Making new dist folder");
  shell.mkdir("-p", "dist");

  console.log("Building sass");
  const styles = sass.renderSync({ file: path.join("styles", "index.scss") });

  fs.writeFileSync(path.join("dist", "index.css"), styles.css, {
    encoding: "utf-8"
  });

  console.log("Building type script");
  execSync(path.join(".", "node_modules", ".bin", "tsc"), { stdio: [0, 1, 2] });

  console.log("Removing map files");
  const files = ofType(".map", "dist");
  for (const file of files) {
    deleteFile(file);
  }
};

const serve = () => {
  build();

  console.log("Serving application");
  execSync(path.join(".", "node_modules", ".bin", "electron") + " .", {
    stdio: [0, 1, 2]
  });
};

const pack = (url, target) => {
  const location = path.join(".", "binaries", target);
  let appLocation = path.join(location, "resources", "app");
  if (target === "darwin") {
    appLocation = path.join(
      location,
      "Electron.app",
      "Contents",
      "Resources",
      "app"
    );
  }

  build();

  console.log("Removing old binaries");
  deleteFolderRecursive(location);

  console.log("Downloading binaries");
  const zip = request("GET", url).getBody();
  shell.mkdir("-p", "binaries");
  fs.writeFileSync(location + ".zip", zip);
  fs.createReadStream(location + ".zip").pipe(
    unzip.Extract({ path: location })
  );
  deleteFile(location + ".zip");

  console.log("Moving over distribution code");
  shell.mkdir("-p", appLocation);
  copy("package.json", path.join(appLocation, "package.json"));
  copy("index.html", path.join(appLocation, "index.html"));
  execSync(
    `cp -r ${path.join(".", "node_modules")} ${path.join(".", appLocation)}`,
    { stdio: [0, 1, 2] }
  );
  execSync(`cp -r ${path.join(".", "dist")} ${path.join(".", appLocation)}`, {
    stdio: [0, 1, 2]
  });
};

const args = process.argv.slice(2);

switch (args[0]) {
  case "serve":
    serve();
    break;
  case "build":
    build();
    break;
  case "pack":
    pack(
      `https://github.com/electron/electron/releases/download/${
        args[2]
      }/electron-${args[2]}-${args[1]}-${args[3]}.zip`,
      args[1]
    );
    break;
  default:
    console.log("Unregonised command");
}
