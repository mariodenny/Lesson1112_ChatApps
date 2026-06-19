import mongoose from "mongoose"

mongoose.connect(
    'mongodb://localhost:27017/mongodb-mervin'
)

const db = mongoose.connection

db.on('connected', ()=>{
    console.log('Database connected!')
})

db.on('error', (err)=>{
    console.log('MongoDB connection error ' + err)
})

export default mongoose