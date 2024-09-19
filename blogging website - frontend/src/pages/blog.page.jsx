import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";
import { createContext } from "react";
import BlogPostcard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";
import CommentContainer from "../components/comments.component";

export const blogStructure = {
    title : '',
    des:'',
    content : [],
    tags:[],
    banner : '',
    author : {
        personal_info : {
           
        }
    },
    publishedAt : ''
}

export const BlogContext = createContext({})

const BlogPage =()=>{
    
    let {blog_id} = useParams()
    const [blog,setBlog]= useState(blogStructure)
    const [similarBlogs, setSimilarBlogs] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isLikedByUser, setIsLikedByUser] = useState(false)
    const [commentWrapper,setCommentWrapper] = useState(false)
    const [totalParentCommentsLoaded,setTotalParentCommentsLoaded] = useState(0)

    let {title,content,banner,author:{personal_info:{fullname,username:author_username,profile_img}}, publishedAt,tags} = blog


    const fetchBlog=()=>{
        axios.post(import.meta.env.VITE_SERVER_DOMAIN+'/get-blog',{blog_id})
        .then(({data:{blog}})=>{

            axios.post(import.meta.env.VITE_SERVER_DOMAIN+'/search-blogs',{tag:blog.tags[0], limit:6, eliminate_blog:blog_id})
            .then(({data})=>{
                setSimilarBlogs(data.blogs)
            })
            .catch(err=>console.log(err))

            setBlog(blog)
            setLoading(false)
        })
        .catch(err=>{
            console.log(err)
            setLoading(false)
        })
    }

    const resetStates=()=>{
        setBlog(blogStructure)
        setSimilarBlogs(null)
        setLoading(true)
        setIsLikedByUser(false)
        // setCommentWrapper(false)
        setTotalParentCommentsLoaded(0) 
    }


    useEffect(()=>{
        resetStates()
        fetchBlog()
    },[blog_id])

    return(
        <AnimationWrapper>

            {
                loading ? <Loader/>
                :
                <BlogContext.Provider value={{blog,setBlog, isLikedByUser, setIsLikedByUser,commentWrapper, setCommentWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded }}>
                    
                    <CommentContainer/>
                    <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">

                        <img src={banner} className="aspect-video"/>

                        <div className="mt-12">
                            <h2>{title}</h2>

                            <div className="flex max-sm:flex-col justify-between my-8">
                                <div className="flex gap-5 items-start">
                                    <img src={profile_img} className="w-12 h-12 rounded-full"/>

                                    <p className="capatalize">
                                        {fullname}
                                        <br/>
                                        @
                                        <Link to={`/user/${author_username}`}className="underline">{author_username}</Link>
                                    </p>
                                </div>

                                <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">Published on {getDay(publishedAt)}</p>
                            </div>

                        </div>

                        <BlogInteraction/>

                            <div className="my-12 font-gelasio blog-page-content">
                                
                                {
                                    content[0].blocks.map((block,i)=>{
                                        return <div key={i} className="my-4 md:my-8">
                                            <BlogContent block={block}/>
                                        </div>
                                    })
                                }

                            </div>

                        <BlogInteraction/>

                        {
                            similarBlogs != null && similarBlogs.length ?
                            <>
                                <h1 className="text-2l mt-14 mb-10 font-medium">Similar Blogs</h1>

                                {
                                    similarBlogs.map((blog,i)=>{
                                        let {author:{personal_info}} = blog

                                        return <AnimationWrapper key={i} transition={{duration:1,delay:i*0.08}}>
                                            <BlogPostcard content={blog} author={personal_info}/>
                                        </AnimationWrapper>
                                    })
                                }
                            </>
                            :""
                        }

                    </div>
                </BlogContext.Provider>
            }

        </AnimationWrapper>
    )
} 


export default BlogPage;