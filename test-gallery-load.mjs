import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const generatedDir = path.join(__dirname, 'public', 'generated');

console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);
console.log('generatedDir:', generatedDir);
console.log('Directory exists:', fs.existsSync(generatedDir));

if (fs.existsSync(generatedDir)) {
  const files = fs.readdirSync(generatedDir).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
  console.log('Images found:', files.length);
  console.log('First 5:', files.slice(0, 5));
}
