import User from "../models/UserModel.js";

export const registerPage = (req,res) =>{
    if(req.session.user){
        return res.redirect('/auth/chat')
    }
    res.render('auth/register',{
        title : 'Register',
        error: req.session.error || null,
        success : req.session.success || null
    })
}

export const loginPage = (req,res) =>{
    if(req.session.user){
        return res.redirect('/auth/chat')
    }
    const error = req.session.error || null
    const success = req.session.success || null
    delete req.session.error
    delete req.session.success

    res.render('auth/login', {
        title : 'Login',
        error,
        success
    })
}

export const loginUser = async(req,res) =>{
    const {email, password} = req.body
    const user = await User.findOne({ email })
    if(!user){
        req.session.error = 'Email not found!'
        return res.redirect('/auth/login')
    }

    // compare password
    const isMatch = await user.comparePassword(password)
    if(!isMatch){
        req.session.error = 'Wrong password!'
        return res.redirect('/auth/login')
    }

    // save session user!
    req.session.user = {
        _id:user._id,
        username:user.username,
        email:user.email,
        role:user.role,
        avatar:user.avatar,
        isActive:user.isActive
    }

    return res.redirect('/auth/chat')
}

export const registerUser = async(req,res) =>{
    const {username, email, password} = req.body
    // cek username pernah terdaftar
    const existingUser = await User.findOne({
        $or:[{email}, {username}]
    })
    if(existingUser){
        req.session.error = 'Email or Username already Exists!'
    }

    const newUser = new User({
        username,
        email,
        password,
        role:'user'
    })

    await newUser.save()
    req.session.success = "New user has been registered!"
    res.redirect('/auth/login')
}

export const chatPage = (req,res)=>{
    res.render('chat/chat')
}

export const logoutUser = (req,res) =>{
    req.session.destroy((err)=>{
        if(err) console.error('Logout Error' + err)
        res.redirect('/auth/login')
    })
}