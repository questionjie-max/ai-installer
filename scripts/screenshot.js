const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

async function takeScreenshots() {
  const win = new BrowserWindow({
    width: 700, height: 800, resizable: false,
    frame: false, backgroundColor: '#0f0f13',
    show: true,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true, nodeIntegration: false
    }
  });
  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  
  await new Promise(r => win.webContents.on('did-finish-load', r));
  await new Promise(r => setTimeout(r, 2000));

  const dir = path.join(__dirname, '..', 'docs', 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Screenshot 1: Welcome
  let img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(dir, 'welcome.png'), img.toPNG());
  console.log('ok welcome');

  // Screenshot 2: Select page
  await win.webContents.executeJavaScript('app.goToSelect()');
  await new Promise(r => setTimeout(r, 500));
  img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(dir, 'select-products.png'), img.toPNG());
  console.log('ok select');

  // Screenshot 3: Detect with some products selected
  await win.webContents.executeJavaScript(`
    app.selected.add('claude-code');
    app.selected.add('deepseek-tui');
    app.selected.add('cursor');
    app.goToDetect();
  `);
  await new Promise(r => setTimeout(r, 3000));
  img = await win.webContents.capturePage();
  fs.writeFileSync(path.join(dir, 'detect-result.png'), img.toPNG());
  console.log('ok detect');

  app.quit();
}

app.whenReady().then(takeScreenshots);
