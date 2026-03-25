const fs = require('fs');
const path = require('path');

console.log('--- 🔍 开始全自动化文件检查 ---');
const srcPath = path.join(__dirname, 'src');

if (!fs.existsSync(srcPath)) {
  console.error('❌ 错误：找不到 src 文件夹！');
  process.exit(1);
}

const files = fs.readdirSync(srcPath);
console.log('当前 src 文件夹内的文件列表：');
files.forEach(file => {
  console.log(` - ${file}`);
});

// 特别检查关键文件
const target = 'storage.ts';
const found = files.find(f => f.toLowerCase() === target.toLowerCase());

if (found) {
  console.log(`✅ 找到了 storage 文件，它在系统里的真实名称是: "${found}"`);
  if (found !== target) {
    console.warn(`⚠️ 警告：大小写不一致！代码里找的是 "${target}"，但实际是 "${found}"`);
  }
} else {
  console.error(`❌ 严重错误：在 src 里完全找不到任何叫 ${target} 的文件！`);
}

console.log('--- 🔍 检查结束 ---');
