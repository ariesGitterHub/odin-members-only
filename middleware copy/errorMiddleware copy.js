// Error handling middleware
module.exports = (err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;
  let title;
  let message;

  // Handle different error statuses
  if (status === 400) {
    title = "400 - Bad Request";
    message =
      err.message ||
      "Your request was malformed. Please check your input and try again.";
  } else if (status === 401) {
    title = "401 - Unauthorized";
    message = err.message || "You must be logged in to access this page.";
  } else if (
    status === 403 &&
    err.message &&
    err.message.includes("disabled")
  ) {
    title = "403 - Forbidden";
    message =
      err.message || "Your account is disabled. Please contact support."; // Custom error if user.is_active is false
  } else if (status === 403 && err.message && err.message.includes("CSRF")) {
    title = "403 - Forbidden";
    message = err.message || "CSRF token invalid or missing"; // Custom CSRF error message
  } else if (status === 403) {
    title = "403 - Forbidden";
    message =
      err.message || "You do not have permission to access this resource.";
  } else if (status === 404) {
    title = "404 - Not Found";
    message =
      err.message || "Sorry, we couldn't find the page you were looking for.";
  } else if (status === 500) {
    title = "500 - Internal Server Error";
    // In development, show the error stack for debugging, otherwise show a generic message.
    message =
      err.message ||
      (process.env.NODE_ENV === "production"
        ? "Something went wrong."
        : err.stack);
  } else if (status === 502) {
    title = "502 - Bad Gateway";
    message =
      err.message ||
      "The server encountered an issue while communicating with another service.";
  } else if (status === 503) {
    title = "503 - Service Unavailable";
    message =
      err.message ||
      "The server is temporarily unavailable. Please try again later.";
  } else if (status === 504) {
    title = "504 - Gateway Timeout";
    message =
      err.message ||
      "The request timed out while waiting for a response from an external server.";
  } else {
    title = `${status} - Unknown Error`;
    message = err.message || "An unknown error occurred.";
  }

  // Render the error page
  res.status(status).render("error-page", {
    title,
    error: message,
    status: status, // Pass status to the view
  });
};
