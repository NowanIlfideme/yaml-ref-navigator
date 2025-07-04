// scripts/copy-test-data.js
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../src/test/workspace1');
const dest = path.join(__dirname, '../out/test/workspace1');

fs.mkdirSync(dest, { recursive: true });

for (const file of fs.readdirSync(src)) {
    if (file.endsWith('.yaml') | file.endsWith('.yml')) {
        fs.copyFileSync(path.join(src, file), path.join(dest, file));
    }
}
