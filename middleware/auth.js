module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      req.flash("error_msg", "Log in for å se Artikkelen");
      res.redirect("/login");
    }
  },
  ensureGuest: function (req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect("/dashboard");
    } else {
      return next();
    }
  },
  isEditor: function (req, res, next) {
    if (req.isAuthenticated() && req.user.role === "admin") {
      return next();
    } else if (req.isAuthenticated()) {
      req.flash("error_msg", "Du har ikke tilgang.");
      res.redirect("/");
    } else {
      req.flash("error_msg", "Please log in to view that resource.");
      res.redirect("/login");
    }
  },
};
