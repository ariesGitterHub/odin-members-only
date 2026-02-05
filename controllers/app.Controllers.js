async function getHomePage(req, res, next) {
  try {
    res.render("index", {
      title: "Home",
      user: req.user,
      errors: [],
    });
  } catch (err) {
    next(err);
  }
}

// app.get("/", (req, res) => {
//   res.render("index", {
//     title: "Home",
//     user: req.user,
//     errors: [],
//   });
// });

module.exports = {
  getHomePage,
};
