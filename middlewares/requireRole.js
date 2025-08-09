function requireRole(roles) {
    return (req, res, next) => {
        const user = req.user;
        if(!user) {
            return res.status(401).json({
                status: 'failure',
                message: 'Authentication required',
                data: null,
                error: 'Unauthorized'
            })
        }
        if(!roles.includes(user.role)) {
            return  res.status(403).json({
                status: 'failure',
                message: 'you are not authorised',
                data: null,
                error: 'unuthorised'

            })
        } 
        next();   
    }

}

module.exports = requireRole;