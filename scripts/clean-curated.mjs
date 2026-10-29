import { readdirSync, readFileSync, writeFileSync } from 'fs';

const DIR = '/Users/evgenykon/Projects/flat-earth/src/content/dark';

function latinRatio(s) {
  const letters = s.replace(/[^A-Za-z]/g, '');
  return letters.length / Math.max(s.length, 1);
}

const curated = readdirSync(DIR).filter(
  (f) => !/^(carpenter|dubay|rowbotham)-\d+\.md$/.test(f) && f.endsWith('.md')
);

for (const f of curated) {
  const content = readFileSync(DIR + '/' + f, 'utf8');
  const lines = content.split('\n');
  const argStart = lines.findIndex((l) => l.trim() === 'argument: |');
  if (argStart < 0) continue;
  const argEnd = lines.findIndex((l, i) => i > argStart && l.startsWith('category:'));

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

  const kept = [];
  let changed = false;
  for (const p of paras) {
    if (p.startsWith('—')) {
      kept.push(p);
      continue;
    }
    if (latinRatio(p) > 0.4) {
      changed = true;
      continue;
    }
    // unwrap («...») -> «...»
    const m = p.match(/^\(«(.*)»\)$/s);
    if (m) {
      kept.push('«' + m[1] + '»');
      changed = true;
    } else {
      kept.push(p);
    }
  }

  if (!changed) continue;

  let out = '';
  for (let i = 0; i < lines.length; i++) {
    if (i > argStart && i < argEnd) {
      if (i === argStart + 1) {
        for (const p of kept) {
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
  console.log('cleaned', f);
}
