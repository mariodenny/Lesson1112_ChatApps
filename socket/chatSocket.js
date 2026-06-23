import Message from '../models/MessageModel.js'
import User from '../models/UserModel.js'

const onlineUsers = {}

export const initSocket= (io)=>{
    io.on('connection', async(socket)=>{
        const sessionUser = socket.request.session?.user
        if(!sessionUser) {
            return socket.disconnect()
        }
        console.log("User "+sessionUser.username+ " connected!")

        onlineUsers[socket.id]={
            userId : sessionUser._id,
            username : sessionUser.username
        }

        await User.findByIdAndUpdate(sessionUser._id, {
            isOnline : true
        })

        io.emit('online-users', Object.values(onlineUsers))

        socket.on('join-room', async(room)=>{
            socket.join(room)
            console.log("User "+sessionUser.username+ " Join group chat")
            const messages = (await Message.find({room}).populate('sender', 'username')).toSorted({createdAt:1})
                .limit(50)
            socket.emit('room-history', messages)
            const systemMsg = {
                type : 'system',
                content: `${sessionUser.username} join to room`,
                room,
                createdAt:new Date()
            }
            socket.to(room).emit('new-message', systemMsg)
        })

        socket.on('send-message', async({room, content}) =>{
            const message = new Message({
                sender: sessionUser._id,
                room,
                content
            })

            await message.save()
            await message.populate('sender', 'username')
        })

        io.to(room).emit('new-message', {
            _id:message._id,
            sender:message.sender,
            content:message.content,
            room:message.room,
            createdAt:message.createdAt
        })
    })
}