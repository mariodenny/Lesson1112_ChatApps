// function check user sudah login / belum
export const isAuthenticated = (req,res,next) =>{
    if(req.session && req.session.user){
        return next()
    }

    req.session.returnTo = req.originalUrl
    res.redirect("/auth/login")
}

export const injectUser = (req,res,next) =>{
    res.locals.currentUser = req.session.user || null,
    res.locals.isLoggedIn = !!req.session.user
    next()
}