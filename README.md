# Neighborhood Message App 
## ...for neighbors ny neighbors
This project was for a course project that morphed into something practical for everyday use by my local neighborhood organization.

### Reminder!
Remember that I am using various scripts (see folder) and package.json scripts for usage. See .ENV for more information.

Now using **npm run dev** rather than nodemon app to start server.

### For production...in Railway
I hade to switch to a different package.json. Old file can be renamed and swapped back: currently named "revert back to for DEV - package.json" (clever, I know).
Also note that all  require("dotenv").config();, are now if (process.env.NODE_ENV !== "production") {  require("dotenv").config(); }