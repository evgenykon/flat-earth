import { readdirSync, readFileSync, writeFileSync } from 'fs';

const DARK = '/Users/evgenykon/Projects/flat-earth/src/content/dark';
const LIGHT = '/Users/evgenykon/Projects/flat-earth/src/content/light';

function parseFile(content) {
  const lines = content.split('\n');
  const fm = {};
  let argument = '';
  let inArg = false;
  for (const line of lines) {
    if (line.startsWith('argument: |')) {
      inArg = true;
      continue;
    }
    if (inArg) {
      if (line.startsWith('  ')) {
        argument += line.slice(2) + '\n';
        continue;
      }
      inArg = false;
    }
    const mm = line.match(/^([A-Za-z]+): (.*)$/);
    if (mm) fm[mm[1]] = mm[2];
  }
  const m = content.match(/^---\n[\s\S]*?\n---\n/);
  const body = m ? content.slice(m[0].length).trim() : '';
  return { fm, argument: argument.replace(/\n+$/g, ''), body };
}

function str(v) {
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}

function truncate(s, n = 95) {
  s = s.trim();
  return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s;
}

const FILE_CATEGORY = {
  'nasa-fake.md': 'Космос',
  'no-gravity.md': 'Гравитация',
  'no-satellites.md': 'Космос',
  'rotation-slow.md': 'Вращение',
  'water-level.md': 'Вода',
};

let count = 0;
for (const f of readdirSync(DARK).filter((x) => x.endsWith('.md'))) {
  const parsed = parseFile(readFileSync(DARK + '/' + f, 'utf8'));
  const { fm, argument, body } = parsed;

  const title = str(fm.title);
  const claim = str(fm.claim) || '';
  const category = FILE_CATEGORY[f] || str(fm.category) || 'Прочее';

  const idx = title.indexOf(' — ');
  const sourceLabel = idx >= 0 ? title.slice(idx + 3) : title;

  const lightTitle = truncate(claim || sourceLabel);

  let out = '---\n';
  out += `title: ${JSON.stringify(lightTitle)}\n`;
  out += `claim: ${JSON.stringify(sourceLabel)}\n`;
  if (argument) {
    out += 'argument: |\n';
    for (const p of argument.split('\n')) {
      out += (p ? '  ' + p : '') + '\n';
    }
    out += '\n';
  }
  out += `category: ${JSON.stringify(category)}\n`;
  out += `order: ${1000 + count}\n`;
  out += '---\n\n';
  out += body + '\n';

  writeFileSync(`${LIGHT}/light-${f}`, out);
  count++;
}
console.log('generated', count, 'light entries');
