const { execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const https = require('https');
const { getPlatform, getPlatformType } = require('./detector');
const { getDependency, getProductById } = require('./products');

let onProgress = null;
let networkStatus = 'direct';

function emit(current, status, progress, message) {
  if (onProgress) onProgress({ current, status, progress, message });
}

function execAsync(cmd, timeout = 180000) {
  return new Promise((resolve, reject) => {
    const child = exec(cmd, { timeout, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err && err.killed) reject(new Error('执行超时'));
      else if (err) reject(new Error((stderr || '').slice(0, 200) || err.message));
      else resolve(stdout);
    });
    child.stdout?.on('data', (data) => {
      if (onProgress && onProgress._lastId) {
        const lines = data.toString().trim().split('\n').filter(Boolean);
        for (const line of lines.slice(-2)) {
          emit(onProgress._lastId, 'installing', 50, line.slice(0, 60));
        }
      }
    });
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close(); fs.unlinkSync(dest, () => {});
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close(); fs.unlinkSync(dest, () => {});
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const total = parseInt(res.headers['content-length'] || '0');
      let downloaded = 0;
      res.on('data', (chunk) => {
        downloaded += chunk.length;
        if (total && onProgress && onProgress._lastId) {
          const pct = Math.round((downloaded / total) * 60) + 20;
          emit(onProgress._lastId, 'downloading', Math.min(pct, 80),
            `下载中 ${(downloaded/1024/1024).toFixed(1)}MB/${(total/1024/1024).toFixed(1)}MB`);
        }
      });
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (e) => { file.close(); fs.unlinkSync(dest, () => {}); reject(e); });
  });
}

// Symlink npm binaries to ~/.local/bin (always writable and in PATH)
function linkBin(cmdName) {
  try {
    execSync(`which ${cmdName}`, { stdio: 'pipe', timeout: 3000 });
    return; // Already accessible
  } catch {}

  const npmRoot = execSync('npm root -g', { encoding: 'utf-8' }).trim();
  const npmBin = path.join(npmRoot, '..', 'bin');
  const localBin = path.join(os.homedir(), '.local', 'bin');

  // Ensure ~/.local/bin exists
  if (!fs.existsSync(localBin)) fs.mkdirSync(localBin, { recursive: true });

  try {
    const files = fs.readdirSync(npmBin);
    for (const file of files) {
      if (file === cmdName || file.startsWith(cmdName)) {
        const src = path.join(npmBin, file);
        const dst = path.join(localBin, file);
        if (!fs.existsSync(dst)) {
          fs.symlinkSync(src, dst);
        }
        return;
      }
    }
  } catch {}
}

async function installNpm(pkg) {
  const reg = networkStatus === 'mirror' ? ' --registry https://registry.npmmirror.com' : '';
  await execAsync(`npm install -g ${pkg}${reg}`);
}

async function installProduct(product) {
  const { id, name, installType } = product;
  if (!onProgress) return false;
  onProgress._lastId = id;

  if (installType === 'npm') {
    emit(id, 'installing', 10, '正在安装...');
    try {
      await installNpm(product.packageName);
      // Link binaries to PATH
      const cmds = [id, product.mainCmd].filter(Boolean);
      for (const c of cmds) linkBin(c);
      emit(id, 'completed', 100, '✅ 安装完成');
      return true;
    } catch (e) {
      emit(id, 'failed', 0, `❌ ${e.message}`);
      return false;
    }
  }

  if (installType === 'script') {
    emit(id, 'installing', 20, '正在安装...');
    try {
      await execAsync(product.installScript, 300000);
      emit(id, 'completed', 100, '✅ 安装完成');
      return true;
    } catch (e) {
      emit(id, 'failed', 0, `❌ ${e.message}`);
      return false;
    }
  }

  if (installType === 'download') {
    const plat = getPlatform();
    const url = product.downloadUrls?.[plat] || product.downloadUrl;
    if (!url) { emit(id, 'failed', 0, '❌ 无下载链接'); return false; }

    if (id === 'cursor' || id === 'vscode') {
      const tmp = path.join(os.tmpdir(), url.split('/').pop() || `${id}.dmg`);
      try {
        emit(id, 'downloading', 10, '正在下载...');
        await downloadFile(url, tmp);
        emit(id, 'installing', 85, '下载完成，正在打开安装器...');
        execSync(`open "${tmp}"`, { timeout: 5000 });
        emit(id, 'completed', 100, '✅ 已下载，请在 Finder 中完成安装');
        return true;
      } catch (e) {
        emit(id, 'failed', 0, `❌ 下载失败: ${e.message}`);
        return false;
      }
    }

    try {
      emit(id, 'downloading', 10, '正在下载...');
      const tmp = path.join(os.tmpdir(), `${id}.dmg`);
      await downloadFile(url, tmp);
      execSync(`open "${tmp}"`, { timeout: 5000 });
      emit(id, 'completed', 100, '✅ 已下载');
      return true;
    } catch {
      emit(id, 'installing', 50, '打开官网下载页...');
      execSync(`open "${product.websiteUrl || url}"`, { timeout: 5000 });
      emit(id, 'completed', 100, '🔗 已打开官网下载页');
      return true;
    }
  }

  emit(id, 'failed', 0, '❌ 不支持的安装类型');
  return false;
}

async function startInstallation(productIds, netStatus) {
  networkStatus = netStatus;
  const completed = [], failed = [];

  for (const id of productIds) {
    const product = getProductById(id);
    if (!product) { failed.push(id); continue; }
    const ok = await installProduct(product);
    if (ok) completed.push(id);
    else failed.push(id);
  }

  return { completed, failed, skipped: [] };
}

module.exports = { startInstallation, setProgressCallback: (cb) => { onProgress = cb; } };
