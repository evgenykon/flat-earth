import { readFileSync, writeFileSync } from 'fs';

const OUT = '/Users/evgenykon/Projects/flat-earth/src/content/dark';
const TMP = '/tmp/flatearth';

const read = (p) => readFileSync(p, 'utf8');

function normalizeBlock(text) {
  const lines = text.split('\n');
  const paras = [];
  let cur = [];
  for (let line of lines) {
    const t = line.trim();
    if (!t || /^\[.*\]$/.test(t) || /^[«»*•—–-]+$/.test(t) || /^\(?\d+\)?\.?$/.test(t)) {
      if (cur.length) {
        paras.push(cur.join(' '));
        cur = [];
      }
      continue;
    }
    cur.push(t);
  }
  if (cur.length) paras.push(cur.join(' '));
  return paras
    .map((p) => p.replace(/\s+/g, ' ').replace(/ \./g, '.').trim())
    .filter(Boolean);
}

function firstSentence(text, max = 150) {
  const s = text.replace(/\s+/g, ' ').trim();
  const m = s.match(/^[^.!?]*[.!?]/);
  const sent = (m ? m[0] : s).trim();
  return sent.length > max ? sent.slice(0, max).replace(/\s+\S*$/, '') + '…' : sent;
}

const COUNTERS = {
  water: [
    'Этот довод — вариация на тему «вода всегда ровная». Уровень воды — поверхность, перпендикулярная силе тяжести, а она на планете направлена к её центру. Поэтому «горизонталь» на Земле сферическая: вода выравнивается вдоль геоида, а не вдоль стола. На плоском диске океаны попросту стекли бы к центру.',
    'Ключевая ошибка старых опытов — атмосферная рефракция: тёплый воздух над холодной водой изгибает луч света вниз (поправка ~1/6 видимой кривизны), и именно она «прячет» прогиб. Современные лазерные эксперименты через большие водоёмы и GPS-нивелировка дают кривизну точно по расчёту, а корабль, уходящий в море, скрывается за горизонтом сначала корпусом, потом мачтами.',
  ],
  horizon: [
    '«Ровный горизонт» — следствие масштаба и оптики. Кривизна Земли — 8 см на километр: с высоты человеческого роста горизонт в ~4,7 км, и «проседание» — доли градуса, которые глаз не различает. Горизонт на уровне глаз — как раз следствие сферичности: вы смотрите вдоль касательной к сфере, а поверхность уходит вниз от неё.',
    'Любительские съёмки с шаров и дронов делаются широкоугольной оптикой, которая изгибает прямые линии и выпрямляет горизонт. Та же съёмка телеобъективом без дисторсии изгиб показывает; с орбиты — с МКС и спутников JAXA, ESA, Роскосмоса — кривизна видна всегда и зафиксирована тысячи раз.',
  ],
  'sun-distance': [
    'Расстояния до Солнца и Луны измерены независимыми методами. Лазерная локация ретрорефлекторов «Аполлонов» и «Луноходов» даёт 384 400 км до Луны; параллакс — смещение светила на фоне звёзд с разных точек Земли — подтверждает цифру без всяких предположений о форме Земли. Радарная локация Венеры и годичный параллакс дают ~150 млн км до Солнца.',
    'Угловые размеры Солнца и Луны совпадают, но это совпадение расстояний и диаметров: Солнце в ~400 раз больше и в ~400 раз дальше. Далёкая гора закрывает близкий холм — так же гигантское Солнце прячется за крошечной Луной. Ни один метод измерения не даёт «близких» светил.',
  ],
  'sun-motion': [
    'Видимое движение Солнца по кругу — следствие вращения Земли, а не его опровержение. Сутки — это оборот планеты вокруг оси; именно поэтому Солнце и звёзды восходят на востоке и заходят на западе. На плоской модели «прожектор» не объясняет, почему на одной половине диска полдень ровно в тот момент, когда на другой — полночь.',
    'Времена года — наклон оси (23,4°) и орбита: полушария поочерёдно наклонены к Солнцу, отсюда полярный день и полярная ночь на полюсах, которые на диске невозможны. «Полуночное солнце» в Арктике и Антарктике — прямое следствие наклона, и оно наблюдается ровно там, где предсказывает модель шара.',
  ],
  rotation: [
    'Если бы Земля не вращалась, не было бы суток: Солнце и звёзды стояли бы на месте. Вращение проверяется напрямую: маятник Фуко поворачивает плоскость качания, сила Кориолиса закручивает циклоны и течения в правильную сторону, экватор шире полюсов на ~21 км (Земля «раздута» вращением — измерено), а суточное вращение неба видно каждую ночь.',
    'Самолёты и снаряды «не слетают», потому что движутся вместе с Землёй: инерция сохраняет их скорость, как в движущемся поезде. Эффект Кориолиса на снарядах существует (восточные ядра летят чуть дальше — эффект Этвёша), но величина — сантиметры, и нужны сверхточные приборы, чтобы его заметить. Разница времени полёта объясняется ветрами на высоте эшелона, а не «догоняющей» планетой.',
  ],
  gravity: [
    'Гравитация — не «магия», а проверенная закономерность: сила пропорциональна массам и обратна квадрату расстояния. «Ускорение вверх» (принцип эквивалентности Эйнштейна) объясняет только падение, но не приливы (океаны тянутся к Луне), не орбиты (спутники движутся по кругу, а не падают) и не замедление времени на GPS, которое учитывается в навигации каждый день.',
    'Свободное падение в вакууме воспроизводится в лабораториях: перо и молот падают одинаково без всякой «среды» — значит, «выталкивание» не работает. Гравитационные волны зарегистрированы в 2015 году (LIGO/Virgo), свет отклоняется в поле Солнца, траектории зондов считаются по закону тяготения с точностью до секунд.',
  ],
  space: [
    'Космос проверяется независимо от NASA. МКС видна невооружённым глазом как яркая точка, идущая по расписанию (Spot the Station, Heavens-Above); радиолюбители принимают её сигналы и говорят с экипажем; астрономы-любители снимают солнечные панели станции в телескопы. Это не «голограмма» — это ежедневная практика тысяч людей.',
    'Ракеты не обязаны лететь «прямо вверх»: чтобы выйти на орбиту, нужна горизонтальная скорость ~28 000 км/ч, поэтому траектория изгибается. В вакууме двигатель работает на выхлопе собственного топлива (третий закон Ньютона) — воздух не нужен. Инцидент с водой в шлеме астронавта Луки Пармитано (2013) NASA предала гласности сама. Запуски, ступени и космический мусор видят миллионы людей в десятках стран.',
  ],
  navigation: [
    'Морская навигация давно учитывает сферичность: дальние маршруты прокладываются по дугам большого круга (Great Circle Sailing) на сферической тригонометрии — именно поэтому маршруты Москва—Нью-Йорк идут через Гренландию, а не «по прямой» на плоской карте. Плоская тригонометрия (plane sailing) — лишь упрощение для коротких переходов, и на больших расстояниях она даёт ошибку.',
    'GPS работает по всему миру с точностью до метров — на плоском диске координаты южного полушария не сходились бы. Компас указывает на магнитный полюс, а не на «центр диска»: в южном полушарии стрелка ведёт себя иначе, чем предсказывает модель с центральным Севером.',
  ],
  poles: [
    'Антарктида — не стена, а континент площадью ~14 млн км² с горами и вулканами, где работают десятки станций из ~30 стран и бывают десятки тысяч туристов в год. Антарктический договор 1959 года открыл её для науки — это документ, подписанный десятками государств.',
    'Южное небо не согласуется с «диском»: вокруг южного полюса мира вращаются свои созвездия (Южный Крест), а Полярная звезда из южного полушария не видна — на диске с центром в Северном полюсе это невозможно. Полёты между городами южного полушария (Сантьяго—Сидней, Йоханнесбург—Перт) идут по маршрутам, рассчитанным для шара, и сходятся с расписаниями.',
  ],
  eclipses: [
    'Затмения — самое наглядное подтверждение сферической геометрии. Тень Земли на Луне всегда круглая: единственное тело, которое всегда отбрасывает круглую тень, — сфера. Полоса полного солнечного затмения на Земле — всего 100–300 км: такое пятно оставляет далёкое и огромное Солнце, а не близкая «лампа», которая дала бы тень на полпланеты.',
    'Лунные затмения видны одновременно на всей ночной половине Земли — на плоской модели это невозможно. Фазы затмений рассчитываются на десятилетия вперёд и совпадают с наблюдениями до секунд.',
  ],
  tides: [
    'Приливы объясняются притяжением Луны и Солнца: гравитация ослабевает с расстоянием, поэтому океан на стороне, обращённой к Луне, «тянется» к ней сильнее, чем на противоположной, — отсюда два прилива в сутки. Модель «плоского диска с лампой» не даёт Луне никакого механизма влиять на воду.',
    'Приливные графики для каждого порта вычисляются на годы вперёд по этим законам и совпадают с наблюдениями. Высота приливов и их время зависят от положения Луны и Солнца — это проверяется каждый день на любом побережье.',
  ],
  stars: [
    'Звёзды — лучший «тест» на форму мира: параллакс и годичное движение показывают, что ближайшие звёзды в десятки тысяч раз дальше Солнца, а суточное вращение неба вокруг полюса мира — прямое следствие вращения Земли. В южном полушарии небо вращается вокруг южного полюса мира (своего, без Полярной звезды) — на диске с центральным Севером это невозможно.',
    'Созвездия, видимые из разных полушарий, согласуются с моделью шара: с экватора видна вся эклиптика, с полюса — только половина неба. Утверждение Роуботэма «все светила в пределах 6000 миль» опровергнуто параллаксом звёзд, измеренным ещё в XIX веке (Бессель, 1838).',
  ],
  'moon-phases': [
    'Фазы Луны требуют точной геометрии Солнце–Земля–Луна: половина Луны всегда освещена Солнцем, а с Земли мы видим её под разными углами — отсюда серп, четверть, полнолуние. На плоской модели с «лампой» над центром диска полнолуние было бы видно лишь малой части диска Земли, а не всем, у кого ночь.',
    'Новолуние — Луна между Землёй и Солнцем; полнолуние — Земля между ними. Эти положения подтверждаются затмениями и точно рассчитываются. Модель «ламп» не даёт ни одного из этих явлений.',
  ],
  scripture: [
    'Довод «из священных текстов» относится к области веры, а не наблюдения. Даже если считать текст буквальным, это не отменяет измерений: параллакс, лазерная локация Луны, навигация и спутники работают независимо от того, как истолкован тот или иной стих.',
    'Показательно, что в XIX веке одни и те же «писания» использовались для доказательства и шара, и плоскости — толкование зависело от того, что уже было принято заранее. Наука проверяет гипотезы опытом, а не цитатой.',
  ],
  fallback: [
    'Этот довод — часть классического набора плоскоземельщиков; его слабое место в том, что он объясняет одно явление, но ломает сотню других. Строгая проверка — не «кажется» и не «должно быть», а измерение: одно и то же явление должно совпадать с расчётом в каждом опыте.',
    'Модель шара объясняет вместе: горизонт, корабли за горизонтом, времена года, затмения, приливы, созвездия, спутники и GPS. Плоская модель для каждого из этих явлений вынуждена придумывать отдельное «объяснение» — и они противоречат друг другу.',
  ],
};

const CATEGORY = {
  water: 'Вода',
  horizon: 'Горизонт',
  'sun-distance': 'Солнце и Луна',
  'sun-motion': 'Солнце и сезоны',
  rotation: 'Вращение',
  gravity: 'Гравитация',
  space: 'Космос',
  navigation: 'Навигация',
  poles: 'Полюса и Антарктида',
  eclipses: 'Затмения',
  tides: 'Приливы',
  stars: 'Звёзды',
  'moon-phases': 'Фазы Луны',
  scripture: 'Писание',
  fallback: 'Прочее',
};

const RULES = [
  ['tides', /tide|tidal/i],
  ['eclipses', /eclipse/i],
  ['moon-phases', /phases|full moon|new moon|moon's phases/i],
  ['gravity', /gravit/i],
  ['navigation', /navigation|sailing|chart|compass|meridian|latitude|longitude|trigonometry|plane sailing|great circle|sailor|mariner|ship captain|pilot/i],
  ['scripture', /scripture|bible|holy|divine|theological|god\b/i],
  ['horizon', /horizon|aeronaut|balloon|eye level|flat 360|level with the eye/i],
  ['water', /water|sea\b|ocean|canal|river|nile|bedford|lighthouse|standing water|flood/i],
  ['sun-distance', /distance of the sun|sun and stars|4,?000 miles|6,?000 miles|magnitude|true distance|far away|size of the sun|same size|equally-?sized|sun and moon|moon and sun/i],
  ['sun-motion', /sun moves|sun's path|sun’s path|day and night|seasons|summer|winter|midnight sun|sun rise|sun set|circle over the earth|declination|path of the sun|day-time|sunshine/i],
  ['stars', /star|polaris|constellation|fixed star|heavens/i],
  ['rotation', /rotat|spinning|axial|orbital|1000mph|1,?000 miles|miles an hour|cannon|airliner|aircraft|airplane|flying|pendulum|foucault|at rest|motion of the earth|earth moves|spins/i],
  ['space', /nasa|space agency|space agencies|rocket|iss\b|international space|satellite|cgi|green-?screen|astronaut|zero-?g\b|moon landing|hoax|conspiracy|hologram|space-walk|space walk|cosmos|outer-space/i],
  ['poles', /north|south|pole|antipodes|circumference|circumnavigat|iceberg|antarctic|round the world|around the world/i],
];

function classify(text) {
  for (const [key, re] of RULES) {
    if (re.test(text)) return key;
  }
  return 'fallback';
}

function fm(key, val) {
  return `${key}: ${JSON.stringify(val)}\n`;
}

function makeFile({ title, claim, category, order, argumentParas, bodyParas }) {
  let out = '---\n';
  out += fm('title', title);
  out += fm('claim', claim);
  out += 'argument: |\n';
  for (const p of argumentParas) {
    out += '  ' + p.replace(/\n/g, ' ') + '\n';
    out += '\n';
  }
  out += fm('category', category);
  out += fm('order', order);
  out += '---\n\n';
  for (const p of bodyParas) {
    out += p + '\n\n';
  }
  return out;
}

// ---------- Carpenter ----------
const carpenter = read(`${TMP}/carpenter.txt`);
const cLines = carpenter.replace(/\r/g, '').split('\n');

// index titles
const indexTitles = {};
for (let i = 60; i < 180; i++) {
  const m = cLines[i]?.match(/^\s*(\d{1,3})\s+(.+)$/);
  if (m) indexTitles[Number(m[1])] = m[2].trim();
}

// find start of proof 1 and end (before APPENDIX)
let cStart = cLines.findIndex((l) => /^\s*1\.\s/.test(l));
let cEnd = cLines.findIndex((l) => /APPENDIX TO THE/.test(l));
if (cStart < 0 || cEnd < 0) throw new Error('carpenter bounds not found');

// split by numbered proofs
const cBlocks = [];
let cur = null;
for (let i = cStart; i < cEnd; i++) {
  const m = cLines[i].match(/^\s*(\d{1,3})\.\s+(.*)$/);
  if (m) {
    if (cur) cBlocks.push(cur);
    cur = { num: Number(m[1]), text: [m[2]] };
  } else if (cur) {
    cur.text.push(cLines[i]);
  }
}
if (cur) cBlocks.push(cur);

let order = 100;
let count = 0;
for (const b of cBlocks) {
  const paras = normalizeBlock(b.text.join('\n'));
  if (!paras.length) continue;
  const full = paras.join(' ');
  const theme = classify(full);
  const title = `Карпентер · Довод № ${b.num}`;
  const claim = indexTitles[b.num] || firstSentence(full);
  const argParas = [`«${paras.join(' ')}»`, `— Уильям Карпентер, «One Hundred Proofs That the Earth Is Not a Globe» (1885), довод № ${b.num}`];
  const body = COUNTERS[theme];
  writeFileSync(`${OUT}/carpenter-${String(b.num).padStart(3, '0')}.md`, makeFile({ title, claim, category: CATEGORY[theme], order: order++, argumentParas: argParas, bodyParas: body }));
  count++;
}
console.log('carpenter:', count);

// ---------- Dubay ----------
const dubay = read(`${TMP}/dubay.txt`);
const dLines = dubay.replace(/\r/g, '').split('\n');
const dBlocks = [];
let dcur = null;
for (const line of dLines) {
  const m = line.match(/^\s*(\d{1,3})\)\s*(.*)$/);
  if (m) {
    if (dcur) dBlocks.push(dcur);
    dcur = { num: Number(m[1]), text: [m[2]] };
  } else if (dcur) {
    dcur.text.push(line);
  }
}
if (dcur) dBlocks.push(dcur);

order = 300;
count = 0;
for (const b of dBlocks) {
  const paras = normalizeBlock(b.text.join('\n'));
  if (!paras.length) continue;
  const full = paras.join(' ');
  const theme = classify(full);
  const title = `Дюбэ · Довод № ${b.num}`;
  const claim = firstSentence(full);
  const argParas = [`«${paras.join(' ')}»`, `— Эрик Дюбэ, «200 Proofs Earth is Not a Spinning Ball» (2014), довод № ${b.num}`];
  const body = COUNTERS[theme];
  writeFileSync(`${OUT}/dubay-${String(b.num).padStart(3, '0')}.md`, makeFile({ title, claim, category: CATEGORY[theme], order: order++, argumentParas: argParas, bodyParas: body }));
  count++;
}
console.log('dubay:', count);

// ---------- Rowbotham ----------
const row = read(`${TMP}/rowbotham.txt`);
const rLines = row.replace(/\r/g, '').split('\n');

// TOC section titles (roman)
const toc = {};
for (let i = 78; i < 126; i++) {
  const m = rLines[i]?.match(/^\s*SECTION\s+([IVX]+)\.\s*$/);
  if (m) {
    const title = rLines[i + 1]?.trim();
    if (title) toc[m[1]] = title;
  }
}
const romanToNum = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12, XIII: 13, XIV: 14 };

// body section markers
const secStarts = [];
for (let i = 0; i < rLines.length; i++) {
  const m = rLines[i].match(/^\s*SECTION\s+(\d{1,2})\.\s*$/);
  if (m) secStarts.push({ num: Number(m[1]), line: i });
}
secStarts.sort((a, b) => a.line - b.line);

// Section 1: from after 'ZETETIC ASTRONOMY.' to first SECTION marker (2)
const zLine = rLines.findIndex((l) => l.trim() === 'ZETETIC ASTRONOMY.');
const s1Start = zLine + 2;
const s1End = secStarts[0].line;
const splitAt = 305; // intro vs experiments (Bedford starts ~308)
const r1a = { num: 1, label: 'Введение: зететический метод', from: s1Start, to: splitAt };
const r1b = { num: 1, label: 'Эксперименты, доказывающие, что Земля — плоскость', from: splitAt, to: s1End };

order = 500;
count = 0;
const sections = [];
for (const s of secStarts) {
  const idx = secStarts.indexOf(s);
  const to = idx + 1 < secStarts.length ? secStarts[idx + 1].line : rLines.length;
  sections.push({ num: s.num, from: s.line + 2, to });
}
// insert split section 1 parts at beginning
sections.unshift({ num: 0, from: r1a.from, to: r1a.to, label: r1a.label });
sections.unshift({ num: 0, from: r1b.from, to: r1b.to, label: r1b.label });

for (const s of sections) {
  const paras = normalizeBlock(rLines.slice(s.from, s.to).join('\n'));
  if (!paras.length) continue;
  const full = paras.join(' ');
  const theme = classify(full);
  const numLabel = s.label || toc[Object.keys(toc).find((k) => romanToNum[k] === s.num)] || '';
  const title = s.label ? `Роуботэм · ${s.label}` : `Роуботэм · Раздел ${s.num}`;
  const claim = s.label || firstSentence(full, 120);
  const argParas = [...paras, `— Сэмюэл Роуботэм, «Zetetic Astronomy: Earth Not a Globe» (1865)${s.label ? '' : `, раздел ${s.num}`}`];
  const body = COUNTERS[theme];
  writeFileSync(`${OUT}/rowbotham-${String(order).padStart(3, '0')}.md`, makeFile({ title, claim, category: CATEGORY[theme], order: order++, argumentParas: argParas, bodyParas: body }));
  count++;
}
console.log('rowbotham:', count);
