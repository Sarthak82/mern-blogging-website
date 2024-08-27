import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import jwt from 'jsonwebtoken'

// Schema here
import User from './Schema/User.js'

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const app = express()
let PORT=3000


app.use(express.json())

mongoose.connect(process.env.DB_LOCATION,{
    autoIndex : true
})

const formatDatatoSend = (user)=>{

    const access_token = jwt.sign({id: user._id}, process.env.SECRET_KEY)
    return {
        access_token,
        profile_img : user.personal_info.profile_img,
        username : user.personal_info.username,
        fullname : user.personal_info.fullname,
    }
}

const genrateUsername = async(email)=>{
    let username = email.split('@')[0]

    let isUsernameNotUnique = await User.exists({
        'personal_info.username': username
    }).then((result)=> result)

    isUsernameNotUnique ? username += nanoid() : ''

    return username
}

app.post('/signup',(req,res)=>{
    
    let {fullname, email, password} = req.body

    // validating data
    if(fullname.length<3){
        return res.status(403).json( {error: "Fullname must be alleast 3 letters long"})
    }

    if(!email.length){
        return res.status(403).json( {error: "Email is required"})
    }
    
    if(!emailRegex.test(email)){
        return res.status(403).json( {error: "Invalid email"})
    }

    if(!passwordRegex.test(password)){
        return res.status(403).json( {error: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letter"})
    }

    bcrypt.hash(password,10, async(err, hashed_password)=>{

        let username = await genrateUsername(email)
        
        let user = new User({
            personal_info: {
                fullname,
                email,
                password: hashed_password,
                username
            },
        })

        user.save().then((data)=>{
            return res.status(200).json( formatDatatoSend(data))
        }).catch((err)=>{

            if(err.code === 11000){
                return res.status(500).json({error: "Email already exists"})
            }

            return res.status(400).json({error: err.message})
        })
    })

})

app.post('/signin', async(req,res)=>{
    let{email, password} = req.body

    User.findOne({"personal_info.email":email}).then((user)=>{
        if(!user){
            return res.status(404).json({error: "Email not found"})
        }
        console.log(user)

        bcrypt.compare(password, user.personal_info.password, (error,result)=>{

            if(error){
                return res.status(403).json({error: "Error occured while loging in please tryu again"})
            }
            
            if(!result){
                return res.status(403).json({error: "Incorrect password"})
            }else{
                return res.status(200).json(formatDatatoSend(user))
            }
        })

    }).catch((err)=>{
        return res.status(400).json({error: "email not found"})
    })

})

app.listen(PORT, () => {
    console.log('Server is running on port 3000')
})