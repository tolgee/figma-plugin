import { ChildProcess, spawn } from "child_process";
import path from "path";
import colors from "colors";

function systemColor(text: string) {
  return colors.grey(text);
}

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

  const searchedText = SEARCHED_TEXTS.find((text) => output.includes(text));
  if (searchedText) {
    console.log(systemColor(`"${searchedText}" found, container is running`));

    if (afterArgs.length) {
      afterProcess = spawn(afterArgs[0], afterArgs.slice(1), {
        stdio: "inherit",
      });
      afterProcess.on("close", (code) =>
        onChildFinish(getProcessName(afterProcess), code || 0)
      );
    }
  }
});

dockerComposeProcess.stderr.pipe(process.stderr);

const allProcesses = [...appProcesses, afterProcess];
let finalCode: number;

function finish(force = false) {
  const runningProcesses = allProcesses.filter((p) => p?.kill(0));
  runningProcesses.forEach((p) => {
    if (p?.kill(0)) {
      console.log(
        systemColor(
          `${force ? "Killing" : "Waiting for"} "${getProcessName(p)}"`
        )
      );
      p.kill(force ? "SIGTERM" : "SIGINT");
    }
  });
  if (runningProcesses.length === 0 || force) {
    // if all children are terminated, exit
    console.log(systemColor(`Finished with status ${finalCode}`));
    process.exit(finalCode);
  }
}

function killAll(code: number) {
  if (finalCode === undefined) {
    finalCode = code;

    // wait for all children to finish
    finish();
    setInterval(() => {
      finish(true);
    }, 1000);
  }
}

function getProcessName(p?: ChildProcess) {
  if (!p) {
    return `${process.argv.join(" ")}`;
  }
  return `${p.spawnargs.join(" ")}`;
}

function onChildFinish(finishedProcess: string, code: number) {
  console.log(systemColor(`"${finishedProcess}" finished with code ${code}`));
  killAll(code);
}

process.on("SIGINT", () => {
  console.log(systemColor("Terminated by user"));
  killAll(1);
});

appProcesses.forEach((p) =>
  p.on("close", (code) => onChildFinish(getProcessName(p), code || 0))
);
