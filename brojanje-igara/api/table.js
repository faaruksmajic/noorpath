/*
 * Zajednički sto: domaćin objavi stanje igre pod kratkim kodom, ostali ga čitaju.
 * Podaci stoje u Redisu (Upstash / Vercel KV) i brišu se sami nakon tri dana bez izmjena.
 * Čita svako ko zna kod; mijenja samo onaj ko ima tajni ključ dobijen pri kreiranju.
 */
const crypto = require('crypto');

const STORE_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const STORE_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const TTL_SECONDS = 60 * 60 * 24 * 3;
const MAX_BYTES = 60000;
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

async function redis(command) {
  const r = await fetch(STORE_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + STORE_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  if (!r.ok) throw new Error('store ' + r.status);
  return (await r.json()).result;
}

function cleanCode(v) {
  const code = String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return code.length >= 4 && code.length <= 8 ? code : null;
}
function newCode() {
  const bytes = crypto.randomBytes(5);
  let out = '';
  for (let i = 0; i < 5; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}
function text(v, max) { return String(v == null ? '' : v).slice(0, max); }
function num(v) { const n = Number(v); return Number.isFinite(n) ? Math.round(n) : 0; }
function scoreMap(obj) {
  const out = {};
  if (obj && typeof obj === 'object') Object.keys(obj).slice(0, 40).forEach((k) => { out[text(k, 24)] = num(obj[k]); });
  return out;
}

/* Keep only the fields the scoreboard needs, with bounded sizes. */
function sanitize(game) {
  if (!game || typeof game !== 'object' || !Array.isArray(game.players) || !Array.isArray(game.rounds)) return null;
  const clean = {
    name: text(game.name, 40),
    theme: text(game.theme, 12),
    icon: num(game.icon),
    color: num(game.color),
    mode: game.mode === 'wins' ? 'wins' : 'points',
    win: game.win === 'low' ? 'low' : 'high',
    target: num(game.target) || '',
    dealer: game.dealer ? text(game.dealer, 24) : undefined,
    players: game.players.slice(0, 40).map((p) => ({ id: text(p && p.id, 24), name: text(p && p.name, 24) })),
    rounds: game.rounds.slice(-500).map((r) => ({ id: text(r && r.id, 24), dealer: r && r.dealer ? text(r.dealer, 24) : undefined, scores: scoreMap(r && r.scores) })),
    history: (Array.isArray(game.history) ? game.history : []).slice(-20).map((h) => ({
      id: text(h && h.id, 24), t: num(h && h.t), n: num(h && h.n), totals: scoreMap(h && h.totals),
      winners: (Array.isArray(h && h.winners) ? h.winners : []).slice(0, 40).map((w) => text(w, 24)),
      names: (() => { const o = {}; const src = (h && h.names) || {}; Object.keys(src).slice(0, 40).forEach((k) => { o[text(k, 24)] = text(src[k], 24); }); return o; })(),
    })),
  };
  return JSON.stringify(clean).length <= MAX_BYTES ? clean : null;
}

function sameKey(a, b) {
  const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || ''));
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!STORE_URL || !STORE_TOKEN) return res.status(503).json({ ok: false, error: 'not_configured' });
  try {
    if (req.method === 'GET') {
      const q = req.query || {};
      if (q.ping) return res.status(200).json({ ok: true });
      const code = cleanCode(q.code);
      if (!code) return res.status(400).json({ error: 'bad_code' });
      const raw = await redis(['GET', 'sto:' + code]);
      if (!raw) return res.status(404).json({ error: 'not_found' });
      const rec = JSON.parse(raw);
      return res.status(200).json({ game: rec.game, updated: rec.updated });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'method' });

    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
    if (!body || typeof body !== 'object') return res.status(400).json({ error: 'bad_body' });

    if (body.action === 'create') {
      const game = sanitize(body.game);
      if (!game) return res.status(400).json({ error: 'bad_game' });
      const key = crypto.randomBytes(18).toString('hex');
      for (let i = 0; i < 6; i++) {
        const code = newCode();
        const ok = await redis(['SET', 'sto:' + code, JSON.stringify({ key, game, updated: Date.now() }), 'EX', TTL_SECONDS, 'NX']);
        if (ok) return res.status(201).json({ code, key });
      }
      return res.status(503).json({ error: 'busy' });
    }

    const code = cleanCode(body.code);
    if (!code) return res.status(400).json({ error: 'bad_code' });
    const raw = await redis(['GET', 'sto:' + code]);
    if (!raw) return res.status(404).json({ error: 'not_found' });
    const rec = JSON.parse(raw);
    if (!sameKey(rec.key, body.key)) return res.status(403).json({ error: 'forbidden' });

    if (body.action === 'update') {
      const game = sanitize(body.game);
      if (!game) return res.status(400).json({ error: 'bad_game' });
      await redis(['SET', 'sto:' + code, JSON.stringify({ key: rec.key, game, updated: Date.now() }), 'EX', TTL_SECONDS]);
      return res.status(200).json({ ok: true });
    }
    if (body.action === 'delete') {
      await redis(['DEL', 'sto:' + code]);
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ error: 'bad_action' });
  } catch (e) {
    return res.status(500).json({ error: 'server' });
  }
};
