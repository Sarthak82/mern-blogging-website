import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";
import CommentField from "./comment-field.component";
import NoDataMessage from "./nodata.component";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./comment-card.component";

export const fetchComments = async ({ skip = 0, blog_id, setParentCommentCountFun, comment_array = [] }) => {
    let res;
    try {
        const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/get-blog-comments', { skip, blog_id });
        let comments = data.comments;

        if (Array.isArray(comments)) {
            comments.forEach(comment => {
                comment.childrenLevel = 0;
            });

            setParentCommentCountFun(prevVal => prevVal + comments.length);

            res = { results: [...comment_array, ...comments] };
        } else {
            console.error("Comments data is not an array");
            res = { results: comment_array };
        }
    } catch (err) {
        console.error(err);
        res = { results: comment_array };
    }
    return res;
};

const CommentContainer = () => {
    let {
        blog, 
        blog: { _id, title, comments: { results: commentsArr = [] }, activity: { total_parent_comments } }, 
        commentWrapper, 
        setCommentWrapper, 
        totalParentCommentsLoaded, 
        setTotalParentCommentsLoaded, 
        setBlog 
    } = useContext(BlogContext);

    const loadMoreComment = async () => {
        let newCommentsArray = await fetchComments({ skip: totalParentCommentsLoaded, blog_id: _id, setParentCommentCountFun: setTotalParentCommentsLoaded, comment_array: commentsArr });
        setBlog(prevBlog => ({
            ...prevBlog, 
            comments: newCommentsArray
        }));
    };

    return (
        <div className={`fixed right-0 ${commentWrapper ? "top-0" : "top-[100%]"} duration-700 max-sm:w-full w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden`}>
            <div className="relative">
                <h1 className="text-xl font-medium">Comments</h1>
                <p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">{title}</p>

                <button
                    onClick={() => setCommentWrapper(prevVal => !prevVal)}
                    className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey">
                    <i className="fi fi-br-cross text-2xl mt-1"></i>
                </button>
            </div>

            <hr className="border-grey my-8 w-[120%] -ml-10" />

            <CommentField action="comment" />
            {
                commentsArr.length ? 
                commentsArr.map((comment, i) => (
                    <AnimationWrapper key={i}>
                        <CommentCard index={i} leftVal={comment.childrenLevel * 4} commentData={comment} />
                    </AnimationWrapper>
                )) : 
                <NoDataMessage message="No Comments" />
            }

            {
                total_parent_comments > totalParentCommentsLoaded &&
                <button className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2" onClick={loadMoreComment}>
                    Load More
                </button>
            }
        </div>
    );
};

export default CommentContainer;
