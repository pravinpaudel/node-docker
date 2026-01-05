const protect = (req, res, next) => {
    const { user } = req.session;
    if(!user) {
        return res.status(401).json({
            status: 'fail',
            message: 'Unauthorized. Please log in.'
        });
    }
    req.user = user; // Attach user info to request object
    next();
}

module.exports = { protect };
