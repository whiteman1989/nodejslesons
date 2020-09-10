module.exports = function(req, res, next) {
    res.locals.isAuth = req.session.isAuthentificated;

    next();
}