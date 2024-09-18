import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import admin from 'firebase-admin'
import serviceAccountKey from "./mern-stack-blogging-webs-de980-firebase-adminsdk-cy3e5-a3271e2117.json" assert {type: "json"}
import { getAuth } from 'firebase-admin/auth'
import aws from 'aws-sdk'
import Blog from './Schema/Blog.js'

// Schema here
import User from './Schema/User.js'


let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password




const app = express()
let PORT=3000

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
});

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors({
    origin: 'http://localhost:5173', // Update with your frontend URL
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type,Authorization'
}));

mongoose.connect(process.env.DB_LOCATION,{
    autoIndex : true
})

// setting up s3 bucket
const s3 = new aws.S3({
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const genrateUploadURL= async ()=>{

    const date = new Date()
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;
    
    return await s3.getSignedUrlPromise('putObject',{
        Bucket: 'blogging-website-app2212',
        Key: imageName,
        Expires: 1000,
        ContentType: 'image/jpeg'
    })



}

const verifyJWT = (req,res,next)=>{

    const authHeader =  req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if(token===null){
        return res.status(401).json({error: "Invalid access token"})
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user)=>{
        if(err){
            return res.status(403).json({error: "Access token is invalid"})
        }

        req.user = user.id
        next()

    })

}

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

app.get('/get-upload-url', (req,res)=>{
    genrateUploadURL().then(url=> res.status(200).json({uploadURL : url})).catch(error =>{
        console.log(error.message)
        return res.status(500).json({error : err.message})
    })
})


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

app.post('/google-auth', async(req,res)=>{
    let {access_token} = req.body

    getAuth()
    .verifyIdToken(access_token).then(async(decodedUser)=>{
        let {email,name,picture} = decodedUser
        picture = picture.replace('s96-c', 's384-c')

        let user = await user.findOne({"personal_info.email": email}).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth").then((u)=>{
            return u || null
        }).catch(error=>{
            return res.status(500).json({error: error.message})
        })

        if(user){
            if(!user.google_auth){
                return res.status(403).json({error: "Email was signed up without google. Please login in with password to access the account"})
            }
        }else{
                let username = await genrateUsername(email)
                user= new User({
                    personal_info:{fullname: name, email,profile_img: picture, username},
                    google_auth: true
                })
                
                await user.save().then((u)=>{
                    user=u
                }).catch((err)=>{
                    return res.status(500).json({error: err.message})
                })

        }

        return res.status(200).json(formatDatatoSend(user))
    }).catch((err)=>{
        return res.status(500).json({error: "Failed to Autheticate you with google. Try again with another method"})
    })
})

app.post('/latest-blogs', async(req,res)=>{
    
    let { page } = req.body
    let maxLimit=5
    
    Blog.find({draft:  false})
    .populate("author", "personal_info.username personal_info.fullname personal_info.profile_img -_id")
    .sort({"publishedAt":-1})
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page-1)*maxLimit)
    .limit(maxLimit)
    .then(blogs=>{
        return res.status(200).json({blogs})
    })
    .catch(err=>{
        return res.status(500).json({error: err.message})
    })
})

app.post("/all-latest-blogs-count",(req,res)=>{
    Blog.countDocuments({draft: false}).then(count=>{
        return res.status(200).json({totalDocs: count})
    }).catch(err=>{
        return res.status(500).json({error: err.message})
    })
})

app.get("/trending-blogs", (req,res)=>{
    Blog.find({draft: false})
    .populate("author" , "personal_info.username personal_info.fullname personal_info.profile_img -_id")
    .sort({ "activity.total_reads":-1, "activity.total_likes":-1, "publishedAt":-1} )
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then(blogs=>{
        return res.status(200).json({blogs})
    })
    .catch(err=>{
        return res.status(500).json({error: err.message})
    }) 
})

app.post('/search-blogs', (req,res)=>{
    let { tag , query, page,author,limit,eliminate_blog} = req.body

    let findQuery;

    if(tag){
        findQuery = { tags: tag, draft: false, blog_id:{$ne:eliminate_blog}}
    }else if(query){
        findQuery={draft:false, title: new RegExp(query, 'i')}
    }else if(author){
        findQuery={author, draft:false}
    }
    
    let maxLimit = limit ? limit : 2

    Blog.find(findQuery)
    .populate("author", "personal_info.username personal_info.fullname personal_info.profile_img -_id")
    .sort({"publishedAt":-1})
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page-1)*maxLimit)
    .limit(maxLimit)
    .then(blogs=>{
        return res.status(200).json({blogs})
    })
    .catch(err=>{
        return res.status(500).json({error: err.message})
    })
})

app.post('/search-blogs-count', (req, res)=>{
    
    let { tag , author, query } = req.body

    let findQuery;

    if(tag){
        findQuery = { tags: tag, draft: false }
    }else if(query){
        findQuery={draft:false, title: new RegExp(query, 'i')}
    }else if(author){
        findQuery={author, draft:false}
    }


    Blog.countDocuments(findQuery).then(count=>{
        return res.status(200).json({totalDocs: count})
    }).catch(err=>{
        return res.status(500).json({error: err.message})
    })
})

app.post("/search-users", (req,res)=>{

    let { query }  = req.body
    User.find({"personal_info.username": new RegExp(query, 'i')})
    .limit(50)
    .select(" personal_info.fullname personal_info.username personal_info.profile_img -_id ")
    .then(users=>{
        return res.status(200).json({users})
    })
    .catch(err=>{
        return res.status(500).json({error: err.message})
    })

})

app.post("/get-profile",(req,res)=>{
    let {username} = req.body
    
    User.findOne({"personal_info.username":username})
    .select("-personal_info.password -google_auth -updatedAt -blogs")
    .then(user=>{
        return res.status(200).json(user)
    }).catch(err=>{
        return res.status(500).json({error: err.message})
    })
})

app.post('/create-blog', verifyJWT, (req,res)=>{
    
    let authorId = req.user

    let { title, des, banner, tags, content, draft, id} = req.body

    if(!title.length){
        return res.status(403).json({error: "Title is required"})
    }
    
    if(!draft){
        
            if(!des.length || des.length>200){
                return res.status(403).json({error: "Description is required"})
            }
        
            if(!banner.length){
                return res.status(403).json({error: "Banner is required"})
            }
        
            if(!content.blocks.length){
                return res.status(403).json({error: "Content is required"})
            }
        
            if(!tags.length || tags.length>10){
                return res.status(403).json({error: "Provide Max 10 tags for your vlog"})
            }
     
    }

 

    tags = tags.map(tag=> tag.toLowerCase())

    let blog_id = id || title.replace(/[^a-zA-Z0-9]/g,' ').replace(/\s+/g, '-').trim() + nanoid()
    
    if(id){

        Blog.findOneAndUpdate({blog_id},{title,des,banner,content,tags,draft: draft ? draft:false})
        .then(blog=>{
            return res.status(200).json({id: blog_id})
        }).catch(error=>{
            return res.status(500).json({error: "Failed to update total post number"})
        })

    }else{
            let blog = new Blog({
            title,
            des,
            banner,
            content,
            tags,
            author: authorId,
            blog_id,
            draft: Boolean(draft)
        })

        blog.save().then(blog=>{

            let incrementVal = draft ? 0 : 1
            User.findByIdAndUpdate({_id:authorId}, {$inc: {'account_info.total_posts': incrementVal}, $push:{"blogs":blog._id}}).then((user=>{
                return res.status(200).json({id: blog.blog_id})
            })).catch(error=>{
                return res.status(500).json({error: "failed to update total post Number"})
            })

            
            
        }).catch(error=>{
            return res.status(500).json({error: error.message})
        })
        
    }
})

app.post('/get-blog', (req,res)=>{

    let { blog_id , draft, mode} = req.body
    let incrementVal = mode!='edit' ? 1 : 0
    Blog.findOneAndUpdate({blog_id}, {$inc :{"activity.total_reads": incrementVal}})
    .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
    .select("title des banner content activity tags publishedAt blog_id")
    .then(blog=>{

        User.findOneAndUpdate({"personal_info.username":blog.author.personal_info.username},{$inc:{"account_info.total_reads":incrementVal}})
        .catch(err=>{
            return res.status(500).json({error: err.message})
        })

        if(blog.draft && !draft){
            return res.status(500).json({error: "You cant access draft blog"})
        }

        return res.status(200).json({blog})
    }).catch(error=>{
        return res.status(500).json({error: error.message})
    })
})


app.listen(PORT, () => {
    console.log('Server is running on port 3000')
})