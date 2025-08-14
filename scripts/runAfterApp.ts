import { ChildProcess, spawn } from "child_process";
import path from "path";
import colors from "colors";
import terminate from "terminate";
import http from "http";

const PORT = 22223;

function systemColor(text: string) {
  return colors.grey(text);
}

const appProcesses: ChildProcess[] = [];

const afterProcesses: ChildProcess[] = [];

const afterArgs = process.argv.slice(2);

function checkServerStatus(callback: () => void) {
  const MAX_RETRIES = 300; // 300 seconds timeout
  let retryCount = 0;
  const options = {
    host: "localhost",
    port: PORT,
    path: "/", // Or any other endpoint
    timeout: 2000,
  };

  const req = http.get(options, (res) => {
    if (res.statusCode === 200) {
      console.log(systemColor("Server is up and running!"));
      callback();
    } else {
      if (retryCount++ >= MAX_RETRIES) {
        console.log(
          systemColor(
            "Server failed to start after maximum retries. Exiting..."
          )
        );
        finish(1);
        return;
      }
      setTimeout(() => checkServerStatus(callback), 1000);
    }
    req.end();
  });

  req.on("error", () => {
    console.log(systemColor("Waiting for server to start..."));
    if (retryCount++ >= MAX_RETRIES) {
      console.log(
        systemColor("Server failed to start after maximum retries. Exiting...")
      );
      finish(1);
      return;
    }
    setTimeout(() => checkServerStatus(callback), 1000);
    req.end();
  });
}

function runAfterProcesses() {
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

let isFinishing = false;
async function finish(code: number) {
  if (isFinishing) {
    return true;
  }
  isFinishing = true;
  const runningProcesses = afterProcesses.filter((p) => p.kill(0));
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

async function main() {
  let isRunning = false;

  try {
    const response: any = await fetch(
      `http://localhost:${PORT}/actuator/health`
    ).then((r) => r.json());

    if (response.status === "UP") {
      console.log(`Backend already running on port ${PORT}`);
      isRunning = true;
    }
  } catch {
    // backend not running - continue
  }

  if (!isRunning) {
    const dockerComposeProcess = spawn(
      "docker",
      ["compose", "up", "--force-recreate"],
      {
        cwd: path.join(__dirname, "..", "cypress"),
      }
    );

    appProcesses.push(dockerComposeProcess);

    dockerComposeProcess.stdout.on("data", (data) => {
      process.stdout.write(data);
    });

    dockerComposeProcess.stderr.pipe(process.stderr);

    checkServerStatus(() => {
      runAfterProcesses();
    });
  } else {
    runAfterProcesses();
  }
}

main();
