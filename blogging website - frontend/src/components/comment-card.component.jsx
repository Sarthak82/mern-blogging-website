import { useContext, useState } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import CommentField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";

const CommentCard = ({ index, leftVal = 0, commentData }) => {
  let {
    commented_by: {
      personal_info: { profile_img = "", fullname = "Anonymous", username = "unknown" } = {},
    } = {},
    commentedAt,
    comment,
    _id,
    children = [],
  } = commentData || {}; 

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let { blog: { comments: { results: commentsArr }, setBlog } } = useContext(BlogContext);

  // State for controlling reply for this specific comment
  const [isReplying, setReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const handleReplyClick = () => {
    if (!access_token) {
      return toast.error("Login to leave a reply");
    }
    // Toggle the reply box only for this comment
    setReplying((preVal) => !preVal);
  };

  const hideReplies = () => {
    setShowReplies(false);
  };

  const showRepliesToggle = () => {
    setShowReplies(!showReplies);
  };

  return (
    <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div className="my-5 p-6 rounded-md border">
        <div className="flex gap-3 items-center mb-8">
          <img src={profile_img} className="w-6 h-6 rounded-full" alt="User profile" />
          <p className="line-clamp-1">{fullname} @{username}</p>
          <p className="min-w-fit">{getDay(commentedAt)}</p>
        </div>
        <p className="font-gelasio text-xl ml-3">{comment}</p>

        <div className="flex gap-5 items-center mt-5">
          {children.length > 0 && showReplies ? (
            <button
              className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex-center gap-2"
              onClick={hideReplies}
            >
              <i className="fi fi-rs-comments-dots"></i>Hide replies
            </button>
          ) : (
            ""
          )}
          {children.length > 0 && !showReplies ? (
            <button className="underline" onClick={showRepliesToggle}>
              Show replies
            </button>
          ) : (
            ""
          )}
          <button className="underline" onClick={handleReplyClick}>
            Reply
          </button>
        </div>

        {/* Only show the reply field for this specific comment */}
        {isReplying && (
          <div className="mt-8">
            <CommentField
              action="reply"
              index={index}
              replyingTo={_id}
              setReplying={setReplying}
            />
          </div>
        )}

        {/* Render replies recursively if any exist */}
        {showReplies &&
          children.length > 0 &&
          children.map((childComment, childIndex) => (
            <CommentCard
              key={childComment._id}
              index={index + 1}
              leftVal={leftVal + 1}
              commentData={childComment}
            />
          ))}
      </div>
    </div>
  );
};

export default CommentCard;
