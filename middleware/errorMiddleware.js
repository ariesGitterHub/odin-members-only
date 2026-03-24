module.exports = (err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;

  let title;
  let message;

  if (status === 403) {
    title = "403 - Forbidden";
    message = "You do not have permission to access this resource.";
  } else if (status === 404) {
    title = "404 - Not Found";
    message = "Sorry, we couldn't find the page you were looking for.";
  } else {
    title = "500 - Internal Server Error";
    message =
      process.env.NODE_ENV === "production"
        ? "Something went wrong."
        : err.message;
  }

  res.status(status).render("error-page", {
    title,
    error: message,
  });
};
