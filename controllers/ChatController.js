import User from '../models/UserModel.js'
import Message from '../models/MessageModel.js'

export const chatPage = async(req,res) =>{
    const currentRoom = req.query.room || 'general'
    const users = await User.find().select('username isOnline')
    res.render('chat/chat',{
        title:`#${currentRoom} | ChatApps`,
        users,
        currentRoom
    })
}

export const dmPage = async(req,res) =>{

}