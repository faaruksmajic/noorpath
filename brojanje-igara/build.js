// Sklapa src/app.html u samostalni index.html (za Vercel ili bilo koji statički hosting).
const fs = require('fs');
const path = require('path');
const SITE = 'https://game-counter-nu.vercel.app';
const DESC = 'Brojač poena i pobjeda za Uno, Remi, Tablić i druge igre. Bez registracije: dodaj igrače i broji.';
const [head, body] = fs.readFileSync(path.join(__dirname, 'src/app.html'), 'utf8').split('<!--BODY-->');
const html = `<!DOCTYPE html>
<html lang="bs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="${DESC}">
<meta name="theme-color" content="#0E3B2D">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Brojanje">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}/">
<meta property="og:title" content="Brojanje igara">
<meta property="og:description" content="${DESC}">
<meta property="og:image" content="${SITE}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="bs_BA">
<meta name="twitter:card" content="summary_large_image">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>
<script>
window.__pwa = true;
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
}
</script>
${head.trim()}
</head>
<body>
${body.trim()}
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('index.html', html.length, 'bytes');
