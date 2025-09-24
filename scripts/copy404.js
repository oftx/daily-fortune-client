import fs from 'fs-extra';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const indexFile = path.join(distDir, 'index.html');
const notFoundFile = path.join(distDir, '404.html');

try {
  // 确保 dist 目录存在
  if (!fs.existsSync(distDir)) {
    console.error('Error: dist directory does not exist. Please run npm run build first.');
    process.exit(1);
  }
  
  // 复制 index.html 到 404.html
  fs.copyFileSync(indexFile, notFoundFile);
  console.log('Successfully created 404.html from index.html');
} catch (err) {
  console.error('Error creating 404.html:', err);
  process.exit(1);
}