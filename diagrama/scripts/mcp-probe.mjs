import { spawn } from 'node:child_process';
import readline from 'node:readline';

const [exe, ...args] = process.argv.slice(2);
if (!exe) {
  console.error('usage: node mcp-probe.mjs <exe> [args...]');
  process.exit(2);
}

const child = spawn(exe, args, { stdio: ['pipe', 'pipe', 'pipe'] });
const rl = readline.createInterface({ input: child.stdout });
const pending = new Map();
let nextId = 1;

function request(method, params) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });
}
function notify(method, params) {
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
}

rl.on('line', (line) => {
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
    else p.resolve(msg.result);
  }
});

let stderr = '';
child.stderr.on('data', (d) => { stderr += d; });

(async () => {
  try {
    const init = await request('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'mcp-probe', version: '1.0.0' }
    });
    notify('notifications/initialized', {});
    console.log('server  :', JSON.stringify(init.serverInfo));
    console.log('protocol:', init.protocolVersion);
    const tools = await request('tools/list', {});
    console.log('tools   :', tools.tools.length);
    for (const t of tools.tools) {
      const d = (t.description || '').split('\n')[0].slice(0, 130);
      console.log(`- ${t.name} :: ${d}`);
    }
  } catch (e) {
    console.error('ERROR:', e.message);
    if (stderr) console.error('stderr:', stderr.slice(-2000));
  } finally {
    try { child.stdin.end(); } catch {}
    setTimeout(() => { try { child.kill(); } catch {} process.exit(0); }, 400);
  }
})();

setTimeout(() => {
  console.error('TIMEOUT');
  if (stderr) console.error('stderr:', stderr.slice(-2000));
  try { child.kill(); } catch {}
  process.exit(1);
}, 60000);
