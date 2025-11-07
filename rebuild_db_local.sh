npx wrangler d1 execute production --local --file=./drop_all.sql
npx wrangler d1 execute production --local --file=./schema.sql
npx wrangler d1 execute production --local --file=./seed.sql