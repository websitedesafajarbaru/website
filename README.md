# Tutorial setup ini di laptop

1. Download nodejs dulu, download [disini](https://nodejs.org/en). Download git dulu [disini](https://git-scm.com/)

2. Clone repository nya.

```bash
git clone https://github.com/andika-123140096/website-desa
```

2. Jalanin perintah ini:

```bash
cd website-desa
npm install
```

3. Jalanin perintah ini untuk import schema databasenya.

```bash
npx wrangler d1 execute website-desa --local --file=./schema.sql
```

4. Jalanin perintah ini untuk running webnya

```bash
npm run dev
```

5. Coba akses http://localhost:5173

## Note: Test dulu semuanya sebelum commit kodenya.
