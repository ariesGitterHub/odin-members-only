# Neighborhood Message App 
## ...for neighbors by neighbors
This project was for a course project that morphed into something practical for everyday use by my local neighborhood organization.

### Reminder!
See .ENV for more information.

Now using **npm run dev** rather than nodemon app to start server in development.

### Notes for production...
1. Schema + indexes (migration layer): scripts/apply-db.js
2. “Post-migration script” - Static seed data: db/seed.sql
3. “Post-migration script” - Dynamic seed tool: db/seed.js
4. Dev-only reset tool (but can be used as a prod reset too, as I learned): scripts/db-reset.js

IMPORTANT REMINDER: after deployment run this in shell on hosting service dashboard: npm run db:setup

REMEMBER FOR LATER: If I have db issues later on, look at package.json scripts and run those in shell on hosting service. 

