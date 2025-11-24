import { spawn } from 'node:child_process';

const children = [];
let shuttingDown = false;

function spawnProcess(command, args) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code) => {
    if (!shuttingDown) {
      shutdown(typeof code === 'number' ? code : 0);
    }
  });

  children.push(child);
}

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }

  // Give children a moment to clean up before exiting
  setTimeout(() => {
    process.exit(code);
  }, 100);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

spawnProcess('npm', ['run', 'server']);
spawnProcess('npm', ['run', 'dev:docker']);
