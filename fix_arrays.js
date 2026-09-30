const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('f:/Fiverr/Projects done Fiverr/davida client scoms/scoms/src/app');

let fixedFiles = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match setSomething(data); or setSomething(json.data); where Something is plural (s or ies)
  // and data is a variable (data or json.data or res.data)
  // We'll just replace all of them with (data || []) if they don't already have it
  let newContent = content.replace(/(set[A-Z][a-zA-Z]*(?:s|ies))\((([a-zA-Z]+\.)?data)\);/g, '$1($2 || []);');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    fixedFiles++;
    console.log('Fixed', file);
  }
});

console.log('Total fixed files:', fixedFiles);
