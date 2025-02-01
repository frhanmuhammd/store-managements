export function redirectIfAuthenticated(req, res, next) {
  if (req.session.authenticated) {
    return res.redirect("/home"); // Redirect ke dashboard jika sudah login
  }
  next(); // Lanjutkan jika belum login
}

export function isAuthenticated(req, res, next) {
  if (req.session.authenticated) {
    return next(); // Lanjutkan jika sudah login
  }
  res.redirect("/"); // Redirect ke halaman login jika belum login
}
