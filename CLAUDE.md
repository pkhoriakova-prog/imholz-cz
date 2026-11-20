# IM HOLZ CZ — новый сайт imholz.cz

Пользователь не разработчик: объяснять просто, делать самому, идти пошагово. Язык общения: русский. Язык сайта: чешский (потом EN и DE).

## План
1. Статический сайт (HTML/CSS/JS, без сборки) на чешском — **здесь**.
2. Перенос на WordPress + Oxygen (по образцу imholz.at; готовый HTML заливается через `html-to-page`, CSS-префикс `bb-`).
3. Остальные языки через WPML.

## Дизайн-система
Полностью повторяет imholz.at (репозиторий `pkhoriakova-prog/im-holz-nova-vscode`). Не изобретать новый стиль.
- BEM с префиксом `bb-`: `bb-block__head`, `bb-card--catalog`. Новые компоненты строятся на тех же токенах из `:root` в `css/styles.css`, новый CSS добавляется в раздел «IM HOLZ CZ» в конце файла.
- Шрифт Manrope, зелёный `#014335`, тёплый серый фон `--paper-warm`, линейки листа (`bb-sheet-rules`, `*__ground`), плоские квадратные карточки с hairline-рамкой, без теней и скруглений.
- Ссылки-действия только `bb-link-underline` (с буквенной анимацией, JS делит текст по буквам). Заголовок в карточке — `bb-heading--card`, текст — `bb-copy--card`.
- Секции: `bb-section` + `bb-block` (метка слева `bb-section-label`, заголовок от первой линейки `bb-block__head`). Серые секции — с `bb-section__ground`.
- Адаптив: точки 1150, 1080 (меню), 640. Проверять на 1440 и 600 px (headless Chrome не рендерит уже 500).
- Иконки: `images/icons/` (взяты из imholz.at), логотипы: `images/logos/logo-green.svg`, `logo-white.svg` (инлайн-SVG со старого imholz.cz).

## Терминология
Компания — поставщик **dřevěných materiálů / materiálů ze dřeva**, а не «dodavatel dřeva» (решение пользователя). Слово «dřevo» оставлять только там, где речь о самой древесине (původ dřeva, druhy dřeva).

## Вкладка браузера и SEO-шапка (как на imholz.at)
- Значок: `images/identity/site-icon.png` (зелёный круглый знак, тот же что на imholz.at), `<link rel="icon">` + `apple-touch-icon` в каждой странице.
- Подпись вкладки: главная `IM HOLZ | Mezinárodní dodavatel dřeva od roku 2009`; внутренние страницы `Тема: уточнение | IM HOLZ` (например `Řezivo: smrk, borovice, modřín | IM HOLZ`). Каждой странице свой `<title>`, `description`, `og:*`.
- Пока сайт — черновик, на **каждой** странице стоит `<meta name="robots" content="noindex, nofollow">`. Убрать при запуске, не раньше.

## Структура сайта (утверждена)
Схемы лежат у пользователя: IM_HOLZ_site_structure_poster_v3.pdf, IM_HOLZ_catalog_structure_A3.pdf.
- Главная, Каталог продукции, 6 страниц направлений (общий шаблон), Услуги, О компании, Для поставщиков, Новости, Контакты, Запрос предложения.
- Направления: 1 Строительство и деревянные конструкции, 2 Фасады, террасы и наружная отделка, 3 Внутренняя отделка и напольные покрытия, 4 Мебель и столярное производство, 5 Пиломатериалы, 6 Древесное топливо и отопление.
- Вкладки товарных групп у каждого направления свои. Пиломатериалы одной ссылкой ведут из направлений 1 и 4 в раздел 5.
- Только на странице направления 1: ненавязчивый блок про IM HOLZ Nova GmbH (https://imholz.at/), отдельную компанию группы.
- Файлы страниц (плоские): `index.html`, `katalog.html`, `katalog-stavba|fasady|interier|nabytek|rezivo|palivo.html`, `sluzby.html`, `o-spolecnosti.html`, `pro-dodavatele.html`, `novinky.html`, `kontakty.html`, `poptavka.html`, `pravni-informace.html`.

## Не выдумывать (ждём от пользователя)
Перечни пород и товаров предварительные. Не придумывать: сертификаты, ассортимент, цифры компании, телефон, адрес, юридические данные. В HTML такие места помечены `TODO` (сейчас: «XX+» в цифрах, преимущества «Proč IM HOLZ», телефон/адрес в футере, email `office@imholz-group.com` взят со старого сайта и не подтверждён). Подтверждено только: работает с 2009 года, EUTR, PEFC и FSC.
`images/certificates/czgbc.webp` — значок CZGBC (Česká rada pro šetrné budovy), не логотип IM HOLZ.

## Статус
Сделаны: основа CSS/JS и главная. Дальше: шаблон страницы направления → каталог → услуги → остальные страницы → проверка → WordPress.
GitHub: репозиторий ещё не создан (предложено `pkhoriakova-prog/imholz-cz`, private); `gh` не установлен, вход через браузер.

## Как пользоваться Windows-оболочкой
Bash heredoc с кириллицей/апострофами ломается — файлы писать инструментом Write. Python и node не установлены. Превью: Chrome headless `--screenshot --allow-file-access-from-files`.
