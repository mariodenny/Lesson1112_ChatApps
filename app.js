import mongoose from "mongoose"
import './db.js'
import express from 'express'
import {createServer} from 'http'
import {Server} from 'socket.io'
import {engine} from 'express-handlebars'
import session from "express-session"
import MongoStore from 'connect-mongo'
import { injectUser } from "./middlewares/authMiddleware.js"

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)
const port = 3001

app.use(session({
  secret: 'randomStringOfSecret123@123009',
  resave:false,
  saveUninitialized:false,
  store: MongoStore.create({
    mongoUrl:'mongodb://localhost:27017/mongodb-mervin'
  }),
  cookie:{
    maxAge : 1000 * 60 * 60 *24 
  }
}))

import AuthRoutes from './routes/AuthRoutes.js'


app.engine('handlebars', engine({
    helpers:{
        isActive:(a,b)=> a ===b,
        isOwn:(senderId) => senderId?.toString() === 'CURRENT_USER_ID'
    }
}))

app.set('view engine', 'handlebars')
app.set('views', './views')

app.use(express.urlencoded({
    extended:true
}))
app.use(express.json())

app.use("/auth", AuthRoutes)

app.get("/", (req,res)=>{
    res.render("index")
})

httpServer.listen(port, ()=>{
    console.log("Server running on http://localhost:"+port)
})