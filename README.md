# Discord Spotify Fix

## Установка

1. Клонируем репозиторий:

```bash
git clone https://github.com/Diramix/Discord-Spotify-Fix
cd Discord-Spotify-Fix
```

2. Устанавливаем зависимости:

```bash
npm install
```

3. Устанавливаем необходимые системные библиотеки, если у вас нет браузера на сервере (Debian/Ubuntu):

```bash
sudo apt update
sudo apt install -y libnspr4 libnss3 gconf-service libatk1.0-0 libc6 libcairo2 libcups2 \
libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 \
libgtk-3-0 libpango-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
fonts-liberation libappindicator1 lsb-release xdg-utils wget
```

> Важные библиотеки для корректного запуска Chromium: `libnspr4` и `libnss3`.

## Использование

>[!WARNING]
>Перед использованием вставте токен своего Discord аккаунта в переменную TOKEN в файле `scripts/login.js`.

### 1. Headless режим (только терминал)

```bash
npm run start
```

* Браузер работает в фоне
* Логи страницы и инжекта выводятся в терминал
* Браузер остаётся живым

### 2. Headful режим (с окном браузера)

```bash
npm run test
```

* Открывается видимое окно Chromium
* Можно наблюдать работу страницы и инжекта в реальном времени
* Логи страницы также выводятся в терминал

### Scripts in use
* https://greasyfork.org/en/scripts/535376-discord-prevent-idle 💘
