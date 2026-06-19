import mongoose from "mongoose";
import bcrypt, { genSalt } from 'bcryptjs'

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["admin", "user"],
        default:'user'
    },
    isOnline:{
        type:Boolean,
        default:false
    },
    avatar:{
        type:String,
        default:''
    }
},{
    timestamps : true
}
)
// fungsi untuk hash password saat register
UserSchema.pre('save', async function(){
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
})
// fungsi compare plain text dengan password hash
UserSchema.methods.comparePassword = async function(candiDatePassword){
    return bcrypt.compare(candiDatePassword, this.password)
}

const User = mongoose.model('User', UserSchema)

export default User