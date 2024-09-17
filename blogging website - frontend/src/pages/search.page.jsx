import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import BlogPostcard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
import { activeTabRef } from "../components/inpage-navigation.component";
import UserCard from "../components/usercard.component";

const SearchPage = () => {
  let { query } = useParams();
  let [blogs, setBlogs] = useState(null);
  let [users, setUsers]= useState(null);

  const SeacrhBlog= ({page=1, create_new_arr=false})=>{
    axios.post(import.meta.env.VITE_SERVER_DOMAIN+"/search-blogs",{query,page})
    .then(async({ data }) => {

        let formatedData = await filterPaginationData({
            state: blogs,
            data: data.blogs,
            page,
            countRoute: "/search-blogs-count",
            data_to_send: {query},
            create_new_arr
        }) 
        
        setBlogs(formatedData);
      })
      .catch((err) => console.log(err));
  }


  const resetState=()=>{
    setBlogs(null)
    setUsers(null)
  }
  
  const fetchUsers=()=>{
    axios.post(import.meta.env.VITE_SERVER_DOMAIN+"/search-users", {query})
    .then(({ data:{users} }) => {
        setUsers(users);
      })
      .catch((err) => console.log(err));
  }

  useEffect(()=>{
    activeTabRef.current.click()
    resetState();
    SeacrhBlog({page:1, create_new_arr:true})
    fetchUsers()

  },[query])


  const UserCardWrapper = ()=>{
        return(
            <>
                {
                    users == null ? <Loader/> :
                    users.length ?
                        users.map((user,i)=>{
                            return <AnimationWrapper key={i} transition={{duration:1, delay:i*0.008}}>
                                <UserCard user={user}/>
                            </AnimationWrapper>
                        })
                        :<NoDataMessage messsage="No User Found"/>
                }
            </>
        )
  }

  return (
    <section className="h-cover flex justufy-center gap-10">
      <div className="w-full">
        <InPageNavigation
          routes={[`Search Results from ${query}`, "Accounts Matched"]}
          defaulthidden={["Accounts Matched"]}
        >
            <>
              {blogs === null ? (
                <Loader />
              ) : blogs.results.length ? (
                blogs.results.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <BlogPostcard
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage messsage="No Blog Published" />
              )}
              <LoadMoreDataBtn state={blogs} fetchDataFun={SeacrhBlog}/>
            </>

            <UserCardWrapper/>


        </InPageNavigation>
      </div>

      <div className="min-w-[40%] lg:min-w-[300px] border-l border-grey pl-8 pt-3 max-mg:hidden">

              <h1 className="font-medium text-xl mb-8">User Related to Seach <i className="fi fi-rr-user"></i> </h1>

              <UserCardWrapper/>

      </div>
    </section>
  );
};

export default SearchPage;
