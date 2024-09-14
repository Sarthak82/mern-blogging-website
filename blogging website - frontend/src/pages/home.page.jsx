import { useEffect,useState } from "react"
import AnimationWrapper from "../common/page-animation"
import InPageNavigation from "../components/inpage-navigation.component"
import axios from "axios"
import Loader from "../components/loader.component"
import BlogPostcard from "../components/blog-post.component"

const HomePage = ()=>{


    let [blogs, setBlogs] = useState(null)

    const fetchLatestBlogs = ()=>{
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + '/latest-blogs')
        .then(({data})=>{
            setBlogs(data.blogs)
        
        })
        .catch(err=>console.log(err))
    }

    useEffect(()=>{
        fetchLatestBlogs()
    },[])

    return(
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">

                {/* Latest blogs */}
                <div className="w-full">
                    <InPageNavigation routes={["home","trending blogs"]} defaulthidden={["trending blogs"]}>

                        <>
                            {
                                blogs === null?<Loader/>:blogs.map((blog,i)=>{
                                    return(
                                        <AnimationWrapper transition={{duration: 1, delay:i*.1}} key={i}>
                                            <BlogPostcard content={blog} author={blog.author.personal_info}/>
                                        </AnimationWrapper>
                                    )
                                })
                            }
                        </>

                        <h1>Trending blog here </h1>

                    </InPageNavigation>
                </div>
                
                {/* Trending blogs */}
                <div></div>

            </section>
        </AnimationWrapper>
    )
}

export default HomePage