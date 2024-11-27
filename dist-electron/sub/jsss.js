import { spawn } from "node:child_process";
const ls = spawn("java", ["-version"]);

ls.stderr.on("data", (msg) => process.send(msg + ""));

ls.stdout.on("data", (msg) => process.send(msg + ""));
