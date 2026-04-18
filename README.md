# Neighborhood Message App 
## ...for neighbors ny neighbors
This project was for a course project that morphed into something practical for everyday use by my local neighborhood organization.

### Reminder!
Remember that I am using various scripts (see folder) and package.json scripts for usage. See .ENV for more information.

Now using **npm run dev** rather than nodemon app to start server.

### For production...in Railway
I hade to switch to a different package.json. Old file can be renamed and swapped back: currently named "revert back to for DEV - package.json" (clever, I know).

1. RUNS ON RENDER DEPLOY - Schema + indexes (migration layer): scripts/apply-db.js
2. “Post-migration bootstrap script” - Static seed data: db/seed.sql
3. “Post-migration bootstrap script” - Dynamic seed tool: db/seed.js
4. Dev-only reset tool: scripts/db-reset.js

Use a single safe command: npm run db:setup. 
That...
runs schema
runs indexes
runs seed.sql
runs seed.js
is safe on re-run
works identically in dev + prod

IMPORTANT: after deployment run this in Render Dashboard → your service → Shell: npm run db:setup