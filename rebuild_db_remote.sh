npx wrangler d1 execute production --remote --file=./drop_all.sql
npx wrangler d1 execute production --remote --file=./schema.sql
npx wrangler d1 execute production --remote --file=./seed.sql