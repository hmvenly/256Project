const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }
  res.redirect("/login");
};

const isStudent = (req, res, next) => {
  if (req.session.user && req.session.user.role === "student") {
    return next();
  }
  res.redirect("/login");
};

const isCompany = (req, res, next) => {
  if (req.session.user && req.session.user.role === "company") {
    return next();
  }
  res.redirect("/login");
};

module.exports = { isAdmin, isStudent, isCompany };