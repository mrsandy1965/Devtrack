const fs = require('fs');
const path = require('path');

function renameRecursive(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist') continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      renameRecursive(fullPath);
    } else if (file.endsWith('.js') && file !== 'rename.js' && !fullPath.includes('eslint.config.js') && !fullPath.includes('vite.config.js')) {
      const newPath = fullPath.slice(0, -3) + '.ts';
      fs.renameSync(fullPath, newPath);
      console.log(`Renamed ${file} to ${path.basename(newPath)}`);
    } else if (file.endsWith('.jsx')) {
      const newPath = fullPath.slice(0, -4) + '.tsx';
      fs.renameSync(fullPath, newPath);
      console.log(`Renamed ${file} to ${path.basename(newPath)}`);
    }
  }
}

console.log('Renaming server files...');
renameRecursive(__dirname);
console.log('Renaming client files...');
renameRecursive(path.join(__dirname, '../client/src'));
console.log('Done!');
