// Sklapa src/app.html u samostalni index.html (za Vercel ili bilo koji statički hosting).
const fs = require('fs');
const path = require('path');
const [head, body] = fs.readFileSync(path.join(__dirname, 'src/app.html'), 'utf8').split('<!--BODY-->');
const html = `<!DOCTYPE html>
<html lang="bs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Brojanje poena i pobjeda za Uno, Remi, Tablić i druge kartaške igre.">
<meta name="theme-color" content="#0E3B2D" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0C3326" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Brojanje igara">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>
${head.trim()}
</head>
<body>
${body.trim()}
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('index.html', html.length, 'bytes');
