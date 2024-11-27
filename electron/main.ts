import { app, BrowserWindow, globalShortcut, ipcMain, Menu, shell } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import * as os from "node:os";
import path from "node:path";
import * as fs from "node:fs";

import {
  ChildProcessWithoutNullStreams,
  exec,
  execFile,
  spawn,
} from "node:child_process";
import { promisify } from "node:util";
import { coding } from "./utils";

const promisExecFile = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

process.env.HOME_DIR = VITE_DEV_SERVER_URL
  ? app.getAppPath()
  : path.join(app.getPath("exe"), "..");

let win: BrowserWindow | null;
let win2: BrowserWindow | null;
const initListener = () => {
  //Web部分
  ipcMain.on("openWeb", () => {
    win2 = new BrowserWindow({
      maximizable: true,
      autoHideMenuBar: true,
    });
    win2.loadURL("http://127.0.0.1:8080/expenseApplication");
    win2.maximize();
  });

  const rootDir = path.join(process.env.HOME_DIR, "others");

  // NGINX部分
  const nginxDir = path.join(rootDir, "nginx-1.24.0");
  ipcMain.handle("getNginxState", () => {
    const pidPath = path.join(nginxDir, "logs", "nginx.pid");
    if (fs.existsSync(pidPath)) {
      const pid = fs.readFileSync(pidPath, { encoding: "utf-8" });
      return { code: 200, msg: { pid } };
    } else {
      return { code: -1, msg: "未运行" };
    }
  });

  ipcMain.handle("handleNginx", async (evt, { op }) => {
    console.log(op);

    try {
      if (op == "start") {
        promisify(exec)(`cd ${nginxDir} && start nginx.exe`);
        return { code: 200, msg: "success" };
      } else if (op == "stop") {
        const { stderr, stdout } = await promisify(exec)(
          `cd ${nginxDir} && nginx -s stop`
        );
        return { code: 200, msg: { stderr, stdout } };
      }
    } catch (error) {
      return { code: -1, msg: error };
    }
  });

  // 数据库部分

  let myPg: ChildProcessWithoutNullStreams;
  const pgDir = path.join(rootDir, "pgsql");
  const pgDataDir = path.join(pgDir, "data");

  ipcMain.handle("getPgState", () => {
    const pidPath = path.join(pgDataDir, "postmaster.pid");
    if (fs.existsSync(pidPath)) {
      const pid = fs.readFileSync(pidPath, { encoding: "utf-8" });
      return { code: 200, msg: { pid } };
    } else {
      return { code: -1, msg: "未运行" };
    }
  });

  ipcMain.handle("startPg", async () => {
    try {
      myPg = spawn("./others/pgsql/bin/pg_ctl", ["start", "-D", pgDataDir]);

      myPg.stdout.on("data", (msg) => {
        win?.webContents.send("pgMsg", { type: "out", msg: coding(msg) });
      });
      myPg.stderr.on("data", (msg) => {
        win?.webContents.send("pgMsg", { type: "error", msg: coding(msg) });
      });

      myPg.on("close", () => {
        win?.webContents.send("pgMsg", { type: "close", msg: "退出PG" });
      });

      return Promise.resolve(true);
    } catch (err) {
      return Promise.reject(err);
    }
  });

  const killPg = async () => {
    const pidPath = path.join(pgDataDir, "postmaster.pid");

    try {
      const text = fs.readFileSync(path.join(pgDataDir, "postmaster.pid"), {
        encoding: "utf-8",
      });

      const [pid] = text.split("\n");

      const cmd = `taskkill`;

      const { stderr, stdout } = await promisify(execFile)(cmd, [
        "/f",
        "/pid",
        pid,
      ]);

      fs.existsSync(pidPath) && fs.unlinkSync(pidPath);

      return { code: 200, msg: stdout };
    } catch (error) {
      // fs.unlinkSync(path.join(pgDataDir, "postmaster.pid"));
      fs.existsSync(pidPath) && fs.unlinkSync(pidPath);
      return { code: -1, msg: "未发现服务！" };
    }
  };

  ipcMain.handle("killPg", killPg);

  // JAVA部分
  let myjar: ChildProcessWithoutNullStreams;

  const jarDir = path.join(process.env.HOME_DIR, "others", "jars");

  ipcMain.handle("get-java-version", async () => {
    const controller = new AbortController();
    const { signal } = controller;
    const { stdout, stderr } = await promisExecFile(
      "./others/jre/bin/java",
      ["-version"],
      { signal }
    );
    controller.abort();
    return stderr;
  });

  ipcMain.handle("start-jar", async () => {
    const dis = fs.readdirSync(jarDir).filter((n) => n.endsWith(".jar"));

    let jarPath = "";

    if (dis.length > 1 || dis.length == 0) {
      return Promise.reject("请打开JAR包目录检查");
    } else {
      jarPath = path.join(jarDir, dis[0]);
    }
    try {
      myjar = spawn("./others/jre/bin/java", ["-jar", jarPath]);

      myjar.stdout.on("data", (msg) => {
        win?.webContents.send("jarData", coding(msg));
      });

      myjar.on("close", () => {
        win?.webContents.send("jarData", "已退出！");
      });
      return Promise.resolve(true);
    } catch (error) {
      return Promise.resolve(error);
    }
  });

  ipcMain.on("kill-jar", async () => {
    myjar.kill();
  });

  ipcMain.on("open-path", (event, path_) => {
    shell.openPath(jarDir);
  });

  const stopAll = async () => {
    await killPg();
    promisify(exec)(`cd ${nginxDir} && nginx -s stop`);
    // myjar && myjar.kill();
  };

  return stopAll;
};

let stopAll = async () => {};

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "bao", "64.png"),
    width: 900,
    height: 520,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
    autoHideMenuBar: true,
  });

  win.webContents.on("did-finish-load", () => {
    win?.setTitle(`一键部署集成软件`);
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  globalShortcut.register("ctrl+F12", () => {
    win?.webContents.openDevTools();
  });
  stopAll = initListener();
  // Menu.setApplicationMenu(null);
  win.on("close", () => {
    if (!win2?.isDestroyed()) {
      win2?.close();
    }
  });
}

app.on("window-all-closed", async () => {
  if (process.platform !== "darwin") {
    await stopAll();
    app.quit();
    win = null;
    win2 = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
