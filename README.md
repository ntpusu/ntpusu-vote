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

使用 [bun](https://bun.sh/) 進行安裝、開發、編譯等操作

### 安裝

```bash
bun install
```

### 開發

```bash
bun dev
```

### 編譯

```bash
bun run build
```

### 環境變數

將 .env.example 檔案複製一份並命名為 .env，並將裡面的環境變數設定好即可

### 資料庫

使用 [prisma](https://www.prisma.io/) 作為 ORM，schema 位於 prisma/schema.prisma\
開好資料庫後將相關環境變數設定好，就能執行以下指令

#### 資料庫 Schema 同步

```bash
bun dbpush
```

#### 資料庫預覽

```bash
bun db
```

### Dev Container

有 VSCode 開發容器設定檔，可以在容器內進行開發\
若有變更容器設定檔，且不需要追蹤變更，可以輸入以下指令

```bash
git update-index --skip-worktree .devcontainer/devcontainer.json
```

設定後 checkout 或部分 git 操作會出現錯誤\
可以輸入以下指令解除設定，操作完畢後再設定回去

```bash
git update-index --no-skip-worktree .devcontainer/devcontainer.json
```

#### 權限相關問題

若執行 bun 相關指令時，出現權限不足的問題，可以使用 sudo 進行執行

#### 例子

```bash
sudo bun install
```
