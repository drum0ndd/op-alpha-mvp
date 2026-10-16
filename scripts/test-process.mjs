import { spawnSync } from 'node:child_process';

// Only pass a child created by this test run. POSIX children must have detached:true.
export async function terminateTestProcess(child) {
  if (!child?.pid || child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === 'win32') {
    const result = spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    if (result.status !== 0 && child.exitCode === null) throw new Error('Não foi possível encerrar a árvore do processo de teste.');
    return;
  }
  const signalGroup = signal => {
    try { process.kill(-child.pid, signal); }
    catch (error) { if (error.code !== 'ESRCH') throw error; }
  };
  signalGroup('SIGTERM');
  // Allow shutdown hooks, then remove any remaining descendants in our process group.
  await new Promise(resolve => setTimeout(resolve, 1000));
  signalGroup('SIGKILL');
}
