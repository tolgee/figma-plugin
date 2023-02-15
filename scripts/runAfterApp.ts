"type module";

import { ChildProcess, spawn } from "child_process";
import path from "path";

const afterArgs = process.argv.slice(2);

const SEARCHED_TEXTS = ["Tomcat started on port(s):"];

const dockerComposeProcess = spawn(
  "docker-compose",
  ["up", "--force-recreate"],
  {
    cwd: path.join(__dirname, "..", "cypress"),
  }
);

const frontendProcess = spawn("npm", ["run", "debug"], {
  cwd: path.join(__dirname, ".."),
  stdio: "inherit",
});

const appProcesses = [dockerComposeProcess, frontendProcess];

let afterProcess: ChildProcess | undefined;

dockerComposeProcess.stdout.on("data", (data) => {
  const output = data.toString();

  process.stdout.write(data);

  if (SEARCHED_TEXTS.find((text) => output.includes(text))) {
    console.log("Text found, container is running");

    afterProcess = spawn("npx", afterArgs, { stdio: "inherit" });
    afterProcess.on("close", (code) =>
      onChildFinish(afterProcess!.spawnfile, code || 0)
    );
  }
});

dockerComposeProcess.stderr.pipe(process.stderr);

function finishGracefully() {
  const runningProcesses = allProcesses.filter((p) => p?.kill(0));
  runningProcesses.forEach((p) => {
    if (p?.kill(0)) {
      console.log(`Waiting for "${p.spawnfile}"`);
      p.kill("SIGINT");
    }
  });
  if (runningProcesses.length === 0) {
    // if all children are terminated, exit
    console.log(`Finished with status ${finalCode}`);
    process.exit(finalCode);
  }
}

const allProcesses = [...appProcesses, afterProcess];
let finalCode: number;
function killAll(code: number) {
  if (finalCode === undefined) {
    finalCode = code;

    // KILL MYSELF
    process.kill(process.pid, "SIGINT");
    // wait for all children to finish
    finishGracefully();
    setInterval(() => {
      finishGracefully();
    }, 1000);
  }
}

function onChildFinish(finishedProcess: string, code: number) {
  console.log(`"${finishedProcess}" finished with code ${code}`);
  killAll(code);
}

process.on("SIGINT", () => {
  killAll(0);
});

appProcesses.forEach((p) =>
  p.on("close", (code) => onChildFinish(p.spawnfile, code || 0))
);
