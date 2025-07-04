// scripts/copy-test-data.js
const fs = require('fs');
const path = require('path');

const srcRoot = path.join(__dirname, '../src/test');
const destRoot = path.join(__dirname, '../out/test');

function copyRecursive(srcDir, destDir) {
    fs.mkdirSync(destDir, { recursive: true });

    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
        const srcPath = path.join(srcDir, entry.name);
        const destPath = path.join(destDir, entry.name);

        if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath); // recurse into subdirectory
        } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Copy everything from src/test/* to out/test/*
copyRecursive(srcRoot, destRoot);
console.log(`✅ Copied YAML test data from ${srcRoot} to ${destRoot}`);