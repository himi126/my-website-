const fs = require('fs');
const path = require('path');
console.log('--- 🔍 Vercel 文件环境自检 ---');
const srcPath = path.join(__dirname, 'src');
if (fs.existsSync(srcPath)) {
    console.log('src 目录内的真实文件清单:', fs.readdirSync(srcPath));
} else {
    console.log('❌ 报错: 没找到 src 目录');
}
console.log('--- 🔍 自检结束 ---');
