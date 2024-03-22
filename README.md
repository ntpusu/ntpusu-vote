# 國立臺北大學三峽校區學生會投票網站

## 簡介

使用基於 [vue3](https://vuejs.org/) 的 [nuxt](https://nuxt.com/) 框架製作的全端網站\
使用 [tailwindcss](https://tailwindcss.com/) 框架進行樣式設計\
使用 [postgreSQL](https://www.postgresql.org/) 資料庫\
使用 [prisma](https://www.prisma.io/) 作為 ORM\
透過 [vercel](https://vercel.com/) 進行部署上線\
供學生會進行投票使用

## 網址

https://ntpusu-vote.vercel.app/

## 開發

使用 npm 或 bun 進行安裝，推薦使用 bun

### 安裝(需先填寫資料庫相關環境變數)

```bash
npm install
```

```bash
bun install
```

### 開發

```bash
npm run dev
```

```bash
bun dev
```

### 編譯(需先填寫資料庫相關環境變數)

```bash
npm run build
```

```bash
bun run build
```

### 環境變數

將 .env.example 檔案複製一份並命名為 .env，並將裡面的環境變數設定好即可

### 資料庫

使用 [prisma](https://www.prisma.io/) 作為 ORM，schema 位於 prisma/schema.prisma\
開好資料庫後將相關環境變數設定好，就能執行以下指令

#### 資料庫同步

```bash
npm run dbpush
```

```bash
bun dbpush
```

#### 資料庫預覽

```bash
npm run db
```

```bash
bun db
```

### Dev Container

有 VSCode 開發容器設定檔，可以在容器內進行開發\
若有變更容器設定檔，且不需要追蹤變更，可以輸入以下指令

```bash
git update-index --skip-worktree .devcontainer/devcontainer.json
```
#### 權限相關問題

若執行上述 npm 或 bun 指令時，出現權限不足的問題，可以使用 sudo 進行執行

#### 例子
```bash
sudo npm install
```

```bash
sudo bun install
```
