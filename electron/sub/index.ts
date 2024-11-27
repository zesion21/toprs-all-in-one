import { ChildProcessWithoutNullStreams, spawn, fork } from "child_process";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const use = () => {
  let ls: ChildProcessWithoutNullStreams;

  const startJava = () => {
    const l = fork(path.join(__dirname, "./sub/jsss.js"));
    l.on("message", (msg) => console.log(msg));
    // ls = spawn("node", ["-v"]);
    // ls.stdout.on("data", (msg) => console.log(msg + ""));
  };

  const kill = () => {
    ls.kill();
  };

  return { startJava };
};
