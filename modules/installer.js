const { execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const https = require('https');
const { getPlatform, getPlatformType } = require('./detector');
const { getDependency, getProductById } = require('./products');
const logger = require('./logger');

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

/**
 * Retry wrapper: retries an async function up to `maxRetries` times
 * with exponential backoff (1s, 3s, 7s).
 */
async function withRetry(fn, label, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info('installer', `[${label}] attempt ${attempt}/${maxRetries}`);
      return await fn();
    } catch (err) {
      logger.warn('installer', `[${label}] attempt ${attempt} failed: ${err.message}`);
      if (attempt >= maxRetries) throw err;
      const delay = Math.min(1000 * Math.pow(3, attempt - 1), 10000);
      await new Promise(r => setTimeout(r, delay));
    }
  }
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

/**
 * Post-install verification: checks if a command is available in PATH.
 */
function verifyInstall(cmdName) {
  try {
    const out = execSync(`which ${cmdName} 2>/dev/null || where ${cmdName} 2>/dev/null`, {
      timeout: 5000, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe']
    });
    const verified = out.trim();
    if (verified) {
      logger.info('verify', `${cmdName} verified at: ${verified}`);
      return verified;
    }
  } catch {
    // Try npx fallback
    try {
      const out2 = execSync(`npx ${cmdName} --version 2>/dev/null`, {
        timeout: 5000, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe']
      });
      if (out2.trim()) {
        logger.info('verify', `${cmdName} verified via npx: v${out2.trim()}`);
        return `npx ${cmdName}`;
      }
    } catch {}
  }
  logger.warn('verify', `${cmdName} not found in PATH after install`);
  return null;
}

// Symlink npm binaries to ~/.local/bin (always writable and in PATH)
function linkBin(cmdName) {
  try {
    execSync(`which ${cmdName} 2>/dev/null || where ${cmdName} 2>/dev/null`, { stdio: 'pipe', timeout: 3000 });
    return; // Already accessible
  } catch {}

  const npmRoot = execSync('npm root -g', { encoding: 'utf-8' }).trim();
  const npmBin = path.join(npmRoot, '..', 'bin');
  const localBin = path.join(os.homedir(), '.local', 'bin');

  if (!fs.existsSync(localBin)) fs.mkdirSync(localBin, { recursive: true });

  try {
    const files = fs.readdirSync(npmBin);
    for (const file of files) {
      if (file === cmdName || file.startsWith(cmdName)) {
        const src = path.join(npmBin, file);
        const dst = path.join(localBin, file);
        if (!fs.existsSync(dst)) {
          fs.symlinkSync(src, dst);
          logger.info('linkBin', `symlinked ${src} -> ${dst}`);
        }
        return;
      }
    }
  } catch (e) {
    logger.warn('linkBin', `failed to link ${cmdName}: ${e.message}`);
  }
}

async function installNpm(pkg) {
  const reg = networkStatus === 'mirror' ? ' --registry https://registry.npmmirror.com' : '';
  return withRetry(
    () => execAsync(`npm install -g ${pkg}${reg}`),
    `npm:${pkg}`,
    3
  );
}

async function installProduct(product) {
  const { id, name, installType, mainCmd } = product;
  if (!onProgress) return false;
  onProgress._lastId = id;

  logger.info('installer', `Starting install: ${name} (${id}) type=${installType}`);

  if (installType === 'npm') {
    emit(id, 'installing', 10, '正在安装...');
    try {
      await installNpm(product.packageName);
      // Link binaries to PATH
      const cmds = [id, mainCmd].filter(Boolean);
      for (const c of cmds) linkBin(c);

      // Verify installation
      const verified = verifyInstall(id) || verifyInstall(mainCmd);
      if (verified) {
        logger.info('installer', `${name} installed successfully at ${verified}`);
        emit(id, 'completed', 100, `✅ 安装完成 (${verified})`);
      } else {
        emit(id, 'completed', 100, '✅ 安装完成（可能需要重启终端）');
      }
      return true;
    } catch (e) {
      logger.error('installer', `${name} install failed: ${e.message}`);
      emit(id, 'failed', 0, `❌ ${e.message}`);
      return false;
    }
  }

  if (installType === 'script') {
    emit(id, 'installing', 20, '正在安装...');
    try {
      await withRetry(
        () => execAsync(product.installScript, 300000),
        `script:${id}`,
        2
      );
      logger.info('installer', `${name} script install completed`);
      emit(id, 'completed', 100, '✅ 安装完成');
      return true;
    } catch (e) {
      logger.error('installer', `${name} script install failed: ${e.message}`);
      emit(id, 'failed', 0, `❌ ${e.message}`);
      return false;
    }
  }

  if (installType === 'download') {
    const plat = getPlatform();
    const url = product.downloadUrls?.[plat] || product.downloadUrl;
    if (!url) {
      logger.warn('installer', `${name} no download URL for platform ${plat}`);
      emit(id, 'failed', 0, '❌ 无下载链接');
      return false;
    }

    const ext = os.platform() === 'darwin' ? '.dmg' : '.exe';
    const tmp = path.join(os.tmpdir(), url.split('/').pop() || `${id}${ext}`);

    try {
      emit(id, 'downloading', 10, '正在下载...');
      await withRetry(
        () => downloadFile(url, tmp),
        `download:${id}`,
        3
      );
      emit(id, 'installing', 85, '下载完成，正在打开安装器...');
      execSync(`${os.platform() === 'darwin' ? 'open' : 'start'} "${tmp}"`, { timeout: 5000 });
      logger.info('installer', `${name} download opened: ${tmp}`);
      emit(id, 'completed', 100, '✅ 已下载，请完成安装向导');
      return true;
    } catch (e) {
      logger.warn('installer', `${name} download failed, opening website: ${e.message}`);
      emit(id, 'installing', 50, '打开官网下载页...');
      execSync(`open "${product.websiteUrl || url}"`, { timeout: 5000 });
      emit(id, 'completed', 100, '🔗 已打开官网下载页');
      return true;
    }
  }

  logger.error('installer', `${name} unsupported install type: ${installType}`);
  emit(id, 'failed', 0, '❌ 不支持的安装类型');
  return false;
}

async function startInstallation(productIds, netStatus) {
  networkStatus = netStatus;
  const completed = [], failed = [];

  logger.info('installer', `Starting batch install: ${productIds.join(', ')} (network: ${netStatus})`);

  for (const id of productIds) {
    const product = getProductById(id);
    if (!product) {
      logger.warn('installer', `Product not found: ${id}`);
      failed.push(id);
      continue;
    }
    const ok = await installProduct(product);
    if (ok) completed.push(id);
    else failed.push(id);
  }

  logger.info('installer', `Batch install complete. Completed: ${completed.length}, Failed: ${failed.length}`);
  return { completed, failed, skipped: [] };
}

module.exports = { startInstallation, setProgressCallback: (cb) => { onProgress = cb; } };
