# Плоская Земля: доводы и контр-доводы

Статический сайт на [Astro](https://astro.build) + Tailwind CSS (кастомная песочная палитра, без дефолтной темы). Публикуется на GitHub Pages через GitHub Actions.

## Разделы

- **Светлая сторона** (`/light/`) — доводы плоскоземельщиков; при раскрытии пункта сразу видны научные контр-аргументы.
- **Тёмная сторона** (`/dark/`) — аргументы против научных доводов; контр-аргументы скрыты, пока не нажать кнопку **«Я хочу контр-аргументы»** вверху страницы.

## Как добавить довод

Просто создайте Markdown-файл в одной из папок:

- `src/content/light/` — довод + контр-аргументы (светлая сторона)
- `src/content/dark/` — атака на науку + контр-аргументы (тёмная сторона)

Frontmatter:

```md
---
title: "Заголовок довода"
claim: "Краткая формулировка довода (опционально)"
argument: "Длинный убедительный текст довода от лица сторонника (опционально, для тёмной стороны)"
category: "Тема, например Физика (опционально)"
order: 1
---

Текст контр-аргументов в Markdown: списки, **жирный**, [ссылки](https://example.com), цитаты.
```

Поле `argument` (многострочное) — развёрнутый текст довода; на тёмной стороне он виден по умолчанию, а контр-аргументы из тела файла скрыты, пока не включён переключатель **«Я хочу контр-аргументы»**. На светлой стороне достаточно `title` и контр-аргументов в теле файла.

Файл сразу попадает на страницу после `git push`.

## Источники тёмной стороны

Раздел заполнен доводами из трёх книг (цитаты дословные, с указанием источника):

- Сэмюэл Роуботэм, «Zetetic Astronomy: Earth Not a Globe» (1865) — [Project Gutenberg](https://www.gutenberg.org/ebooks/69892)
- Уильям Карпентер, «One Hundred Proofs That the Earth Is Not a Globe» (1885) — [Project Gutenberg](https://www.gutenberg.org/ebooks/55387)
- Эрик Дюбэ, «200 Proofs Earth is Not a Spinning Ball» (2014) — [archive.org](https://archive.org/details/200ProofsEarthIsNotASpinningBall_201710)

Файлы вида `carpenter-NNN.md`, `dubay-NNN.md`, `rowbotham-NNN.md` генерируются скриптом `scripts/generate-dark.mjs` (парсит тексты книг, раскладывает по темам, подставляет тематические контр-аргументы), а затем переводятся на русский скриптом `scripts/translate-dark.mjs` (через публичный endpoint Google Translate). Для перегенерации: положите исходники в `/tmp/flatearth/`, выполните `node scripts/generate-dark.mjs` и затем `node scripts/translate-dark.mjs`. Доводы №111 у Дюбэ в исходнике archive.org отсутствуют. Вручную отредактированные файлы (например, с авторскими текстами) скрипты не трогают.

## Локальная разработка

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # сборка в dist/
```

## Деплой

Пуш в ветку `main` запускает `.github/workflows/deploy.yml` — сборка и публикация на GitHub Pages. В настройках репозитория включите **Settings → Pages → Source: GitHub Actions**.

Сайт будет доступен по адресу `https://evgenykon.github.io/flat-earth/`.
