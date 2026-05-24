const path = require("node:path");
const { app, BrowserWindow, ipcMain, shell, nativeTheme } = require("electron");
const { generateRecommendation, getOptions } = require("../pc-generator.cjs");

const isDev = !app.isPackaged;
const isSmokeTest = process.argv.includes("--smoke-test");

if (isSmokeTest) {
  app.setPath("userData", path.join(app.getPath("temp"), "pc-generator-smoke-test"));
}

function resolveAsset(...segments) {
  return isDev
    ? path.join(__dirname, "..", ...segments)
    : path.join(process.resourcesPath, "app.asar", ...segments);
}

function createWindow() {
  nativeTheme.themeSource = "system";

  const window = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 980,
    minHeight: 660,
    backgroundColor: "#08111f",
    title: "PC Generator",
    icon: resolveAsset("assets", "app-icon.ico"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isSmokeTest) {
    window.webContents.once("did-finish-load", () => {
      setTimeout(async () => {
        try {
          const smokeResult = await window.webContents.executeJavaScript(`({
            title: document.querySelector(".result-title")?.textContent || "",
            firstLink: document.querySelector(".part-name")?.href || ""
          })`);
          console.log(`SMOKE_RESULT=${smokeResult.title}`);
          console.log(`SMOKE_LINK=${smokeResult.firstLink}`);
          app.exit(smokeResult.title && smokeResult.firstLink.includes("geizhals.de") ? 0 : 1);
        } catch (error) {
          console.error(`SMOKE_ERROR=${error.message}`);
          app.exit(1);
        }
      }, 900);
    });
  }

  window.loadFile(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  ipcMain.handle("pc:get-options", () => getOptions());
  ipcMain.handle("pc:recommend", (_event, payload) => generateRecommendation(payload));
  ipcMain.handle("pc:open-external", async (_event, url) => {
    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol)) {
      throw new Error("Nur Web-Links koennen geoeffnet werden.");
    }
    await shell.openExternal(parsed.toString());
    return true;
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
