import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";

const CommentField = ({action, index=undefined, replyingTo=undefined, setReplying})=>{

    let { blog,blog:{_id ,author:{_id:blog_author}, comments,comments:{results:commentsArr}, activity, activity:{total_comments, total_parent_comments} },setBlog,setTotalParentCommentsLoaded }=useContext(BlogContext)
    
    const {userAuth:{access_token, username, fullname, profile_img}} = useContext(UserContext)
   
    const [comment, setComment]= useState("")

    const handleComment = () => {
        if (!access_token) {
            return toast.error("Please login to comment");
        }
    
        if (!comment.length) {
            return toast.error("Please enter a comment");
        }
    
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/add-comment', {
            _id,
            blog_author,
            comment,
            replying_to: replyingTo
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        }).then(({ data }) => {
    
            setComment("");
            data.comment_by = { personal_info: { username, profile_img, fullname } };
    
            let newCommentArr;
    
            if (replyingTo) {
                
                const parentComment = commentsArr[index];
    
                if (parentComment.children) {
                    parentComment.children.push(data);  
                } else {
                    parentComment.children = [data];   
                }
    
                commentsArr[index].isReplyLoaded=true
                data.childrenLevel = parentComment.childrenLevel + 1;
                data.parentIndex = index;
    
                newCommentArr = [...commentsArr];  
                setReplying(false);

            } else {
                data.childrenLevel = 0;  // This is a top-level comment
                newCommentArr = [data, ...commentsArr];
            }
    
            let parentCommentIncrementVal = replyingTo ? 0 : 1;
    
            setBlog({
                ...blog,
                comments: { ...comments, results: newCommentArr },
                activity: {
                    ...activity,
                    total_comments: total_comments + 1,
                    total_parent_comments: total_parent_comments + parentCommentIncrementVal
                }
            });
    
            setTotalParentCommentsLoaded(preVal => preVal + parentCommentIncrementVal);
    
        }).catch(err => {
            console.log(err);
        });
    };
    

    return(
        
        <div>
            <Toaster/>
            <textarea value={comment} onChange={(e)=>{
                setComment(e.target.value)
            }}className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto" placeholder="Leave  a comment..."></textarea>
            <button className="btn-dark mt-5 px-10"
            onClick={handleComment}>{action}</button>
        </div>
    )
    
}

export default CommentField;