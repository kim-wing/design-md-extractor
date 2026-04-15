import { readFile, writeFile, readdir } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getMainJsFile() {
  const assetsDir = resolve(__dirname, '../dist/assets');
  const files = await readdir(assetsDir);
  const mainJs = files.find(f => f.startsWith('main-') && f.endsWith('.js'));
  return mainJs;
}

async function getMainCssFile() {
  const assetsDir = resolve(__dirname, '../dist/assets');
  const files = await readdir(assetsDir);
  const mainCss = files.find(f => f.startsWith('main-') && f.endsWith('.css'));
  return mainCss;
}

async function fixSidepanel() {
  const sidepanelPath = resolve(__dirname, '../dist/sidepanel.html');
  const mainJs = await getMainJsFile();
  const mainCss = await getMainCssFile();
  
  let content = await readFile(sidepanelPath, 'utf-8');
  
  content = content.replace('/src/main.tsx', `./assets/${mainJs}`);
  
  if (!content.includes('stylesheet')) {
    content = content.replace(
      '</head>',
      `<link rel="stylesheet" href="./assets/${mainCss}">\n  </head>`
    );
  }
  
  await writeFile(sidepanelPath, content);
  console.log('Fixed sidepanel.html');
}

fixSidepanel();
