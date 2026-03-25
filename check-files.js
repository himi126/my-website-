const fs = require('fs');
const path = require('path');

console.log('--- 🔍 Vercel 文件环境自检 ---');
const srcPath = path.join(__dirname, 'src');

if (fs.existsSync(srcPath)) {
    const files = fs.readdirSync(srcPath);
    console.log('src 目录内的真实文件清单:', files);
    
    // 自动检查 storage
    const hasStorage = files.some(f => f.toLowerCase().startsWith('storage.t'));
    if (!hasStorage) {
        console.log('❌ 严重错误：src 目录下确实没有 storage.ts 或 storage.tsx！');
    }
} else {
    console.log('❌ 报错: 根本没找到 src 目录');
}
console.log('--- 🔍 自检结束 ---');
