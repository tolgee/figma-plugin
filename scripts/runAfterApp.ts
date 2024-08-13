import { ChildProcess, spawn } from "child_process";
import path from "path";
import colors from "colors";
import terminate from "terminate";

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

const appProcesses = [dockerComposeProcess];

const afterProcesses: ChildProcess[] = [];

dockerComposeProcess.stdout.on("error", (e) => {
  process.stderr.write(String(e));
});

dockerComposeProcess.stdout.on("data", (data) => {
  const output = data.toString();

  process.stdout.write(data);

  const searchedText = SEARCHED_TEXTS.find((text) => output.includes(text));
  if (searchedText) {
    console.log(systemColor(`"${searchedText}" found, container is running`));

    if (afterArgs.length) {
      afterArgs.forEach((command) => {
        const afterProcess = spawn(command, [], {
          stdio: "inherit",
          shell: true,
        });
        afterProcess.on("close", (code) =>
          onChildFinish(getProcessName(afterProcess), code || 0)
        );
        afterProcesses.push(afterProcess);
      });
    }
  }
});

dockerComposeProcess.stderr.pipe(process.stderr);

let isFinishing = false;
async function finish(code: number) {
  if (isFinishing) {
    return true;
  }
  isFinishing = true;
  const allProcesses = [...appProcesses, ...afterProcesses];
  const runningProcesses = allProcesses.filter((p) => p.kill(0));
  const childrenPending = runningProcesses.map(
    (p) =>
      new Promise<void>((resolve, reject) => {
        console.log(systemColor(`Terminating process "${getProcessName(p)}"`));
        terminate(p.pid!, { timeout: 5000 }, (err) =>
          err ? reject(err) : resolve()
        );
      })
  );

  await Promise.all(childrenPending);

  // if all children are terminated, exit
  console.log(systemColor(`Finished with status ${code}`));
  process.exit(code);
}

function getProcessName(p?: ChildProcess) {
  if (!p) {
    return `${process.argv.join(" ")}`;
  }
  return `${p.spawnargs.join(" ")}`;
}

function onChildFinish(finishedProcess: string, code: number) {
  console.log(systemColor(`"${finishedProcess}" finished with code ${code}`));
  finish(code);
}

process.on("SIGINT", () => {
  console.log(systemColor("Terminated by user"));
  finish(1);
});

appProcesses.forEach((p) =>
  p.on("close", (code) => onChildFinish(getProcessName(p), code || 0))
);
