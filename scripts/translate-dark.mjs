import { readdirSync, readFileSync, writeFileSync } from 'fs';

const DIR = '/Users/evgenykon/Projects/flat-earth/src/content/dark';
const filter = process.argv[2] || 'all';
const CONCURRENCY = 6;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function latinRatio(s) {
  const letters = s.replace(/[^A-Za-z]/g, '');
  return letters.length / Math.max(s.length, 1);
}

function chunkText(text) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let cur = '';
  for (const s of sentences) {
    if ((cur + ' ' + s).length > 450) {
      if (cur) chunks.push(cur.trim());
      cur = s;
    } else {
      cur = cur ? cur + ' ' + s : s;
    }
  }
  if (cur) chunks.push(cur.trim());
  return chunks;
}

async function translateText(text) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const url =
        'https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=en&tl=ru&dt=t&q=' +
        encodeURIComponent(text);
      const r = await fetch(url);
      if (!r.ok) throw new Error('http ' + r.status);
      const data = await r.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const res = data[0].map((seg) => (seg && seg[0] ? seg[0] : '')).join('');
        if (res) return res;
      }
    } catch {}
    await sleep(1500);
  }
  return null;
}

async function processFile(f) {
  const content = readFileSync(DIR + '/' + f, 'utf8');
  const lines = content.split('\n');
  const argStart = lines.findIndex((l) => l.trim() === 'argument: |');
  const argEnd = lines.findIndex((l, i) => i > argStart && l.startsWith('category:'));
  if (argStart < 0 || argEnd < 0) return null;

  const paras = [];
  let cur = [];
  for (let i = argStart + 1; i < argEnd; i++) {
    if (lines[i].startsWith('  ')) cur.push(lines[i].trim());
    else if (cur.length) {
      paras.push(cur.join(' '));
      cur = [];
    }
  }
  if (cur.length) paras.push(cur.join(' '));

  const needsTranslation = paras.some((p) => !p.startsWith('—') && latinRatio(p) > 0.4);
  if (!needsTranslation) return 'done';

  const translated = [];
  for (const p of paras) {
    if (p.startsWith('—')) {
      translated.push(p);
      continue;
    }
    if (latinRatio(p) <= 0.4) {
      translated.push(p);
      continue;
    }
    const quoted = p.startsWith('«');
    const text = quoted ? p.slice(1, -1) : p;
    const ru = await translateText(text);
    if (!ru) return null;
    translated.push(quoted ? `«${ru}»` : ru);
  }

  let newClaim = null;
  const claimLine = lines.findIndex((l) => l.startsWith('claim: '));
  if (claimLine >= 0) {
    const m = lines[claimLine].match(/^claim: "(.*)"$/);
    if (m && latinRatio(m[1]) > 0.4) {
      const ru = await translateText(m[1]);
      if (ru) newClaim = `claim: ${JSON.stringify(ru)}`;
    }
  }

  let out = '';
  for (let i = 0; i < lines.length; i++) {
    if (i === claimLine && newClaim) {
      out += newClaim + '\n';
    } else if (i > argStart && i < argEnd) {
      if (i === argStart + 1) {
        for (const p of translated) {
          out += '  ' + p + '\n';
          out += '\n';
        }
      }
    } else {
      out += lines[i] + '\n';
    }
  }
  out = out.replace(/\n{3,}/g, '\n\n');
  writeFileSync(DIR + '/' + f, out);
  return 'translated';
}

const files = readdirSync(DIR).filter((f) => {
  if (!/^(carpenter|dubay|rowbotham)-\d+\.md$/.test(f)) return false;
  if (filter === 'all') return true;
  return f.startsWith(filter + '-');
});

let idx = 0;
let done = 0;
let translated = 0;
let failed = 0;
async function worker() {
  while (idx < files.length) {
    const f = files[idx++];
    const res = await processFile(f);
    if (res === 'translated') {
      translated++;
      console.log('T', f);
    } else if (res === 'done') {
      done++;
    } else {
      failed++;
      console.log('F', f);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log('summary translated:', translated, 'already:', done, 'failed:', failed);
