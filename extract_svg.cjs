const fs = require('fs');
const glob = require('glob');

const logFiles = glob.sync('/.gemini/antigravity/brain/*/.system_generated/logs/overview.txt');
if (logFiles.length > 0) {
  const content = fs.readFileSync(logFiles[0], 'utf8');
  const match = content.match(/<svg[\s\S]*?<\/svg>/);
  if (match) {
    fs.mkdirSync('public', { recursive: true });
    fs.writeFileSync('public/ivx-logo.svg', match[0]);
    console.log('Extracted SVG to public/ivx-logo.svg');
  } else {
    console.log('No SVG found in logs');
  }
} else {
  console.log('Log file not found');
}
