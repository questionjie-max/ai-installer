const { execSync } = require('child_process');
const os = require('os');
const { getDependency } = require('./products');

function getPlatform() {
  const type = os.platform();
  const arch = os.arch();
  if (type === 'darwin') {
    return arch === 'arm64' ? 'mac-arm64' : 'mac-x64';
  }
  if (type === 'win32') return 'win-x64';
  return 'linux-x64';
}

function getPlatformType() {
  const p = os.platform();
  if (p === 'darwin') return 'mac';
  if (p === 'win32') return 'win';
  return 'linux';
}

function execSilent(cmd) {
  try {
    const out = execSync(cmd, { timeout: 5000, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    return out.trim();
  } catch {
    return null;
  }
}

function checkDependency(name) {
  const dep = getDependency(name);
  if (!dep) return { name, status: 'unknown', message: '未知依赖' };

  const versionStr = execSilent(dep.checkCmd);
  if (versionStr === null) {
    return { name, status: 'missing', message: '未安装', dep };
  }

  const match = versionStr.match(new RegExp(dep.versionRegex));
  if (match) {
    const version = match[1];
    if (compareVersions(version, dep.minVersion) >= 0) {
      return { name, status: 'ok', version, message: `已安装 v${version}`, dep };
    } else {
      return { name, status: 'old', version, message: `版本过低 v${version}，需要 v${dep.minVersion}+`, dep };
    }
  }
  return { name, status: 'ok', version: versionStr, message: `已安装`, dep };
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

async function checkNetwork() {
  try {
    execSync('curl -s --max-time 5 https://registry.npmjs.org/.ping', { timeout: 6000, stdio: 'pipe' });
    return { status: 'direct', message: '可直连官方源' };
  } catch {
    try {
      execSync('curl -s --max-time 5 https://registry.npmmirror.com/.ping', { timeout: 6000, stdio: 'pipe' });
      return { status: 'mirror', message: '使用国内镜像源' };
    } catch {
      return { status: 'offline', message: '无网络连接' };
    }
  }
}

async function detectAll(requiredDeps) {
  const results = {};
  for (const depName of requiredDeps) {
    results[depName] = checkDependency(depName);
  }
  results._platform = getPlatform();
  results._platformType = getPlatformType();
  results._network = await checkNetwork();
  return results;
}

module.exports = { detectAll, checkDependency, getPlatform, getPlatformType, checkNetwork };
