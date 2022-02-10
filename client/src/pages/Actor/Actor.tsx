import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { CircularProgress, Button, Alert } from "@mui/material";
import { ActorData } from "../../types/global";
import Comment from "../../components/Comment/Comment";
import AddComment from "../../components/Comment/AddComment";
import styles from "./Actor.module.css";

const Actor = () => {
  const { id } = useParams();
  const [actor, setActor] = useState<ActorData>();
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbackAlert, setFeedbackAlert] = useState(<></>);
  const [showAddComment, setShowAddComment] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const user = useSelector((state: RootState) => state.user);
  const config = {
    headers: { Authorization: `Bearer ${user.token}` },
  };

  useEffect(() => {
    async function getActor() {
      try {
        const result = await axios.get(
          `http://localhost:5000/public/actor/${id}`
        );
        setActor(result.data.actor);
        setAuthor(result.data.user);
        setLoading(false);
      } catch (err) {
        setError("Error occured with getting data!");
      }
    }
    getActor();
  }, [id, refresh]);

  if (error) {
    return <div className="container">{error}</div>;
  }

  if (loading) {
    return (
      <div className="container">
        <CircularProgress />
      </div>
    );
  }

  let comments: any = [];
  if (actor) {
    comments = actor.comments?.map((comment) => {
      return (
        <Comment
          key={comment.id}
          author={comment.author}
          content={comment.content}
          createdAt={comment.createdAt}
        />
      );
    });
  }

  async function likeHandler() {
    if (!user.token || !user.userId) {
      setFeedbackAlert(
        <Alert variant="filled" severity="error" onClose={closeFeedbackHandler}>
          Sing in to be able to like!
        </Alert>
      );
      return;
    }
    try {
      const result = await axios.post(
        `http://localhost:5000/actor/like/${actor?.id}`,
        {},
        config
      );
      setActor((state) => {
        if (state) {
          return { ...state, likes: result.data.actor.likes };
        }
      });
    } catch (err) {
      setFeedbackAlert(
        <Alert variant="filled" severity="error" onClose={closeFeedbackHandler}>
          Liking action failed!
        </Alert>
      );
    }
  }

  function addCommentHandler() {
    if (!user.token || !user.userId) {
      setFeedbackAlert(
        <Alert variant="filled" severity="error" onClose={closeFeedbackHandler}>
          Sing in to be able to comment!
        </Alert>
      );
      return;
    }
    setShowAddComment((state) => {
      return !state;
    });
  }

  function closeFeedbackHandler() {
    setFeedbackAlert(<></>);
  }

  function pageRefresh() {
    setRefresh((state) => {
      return !state;
    });
  }

  return (
    <div className="container">
      <div className={styles.actor}>
        <div className={styles.imageContainer}>
          <img
            src={actor?.imageURL}
            alt={actor?.firstName + " " + actor?.lastName}
          />
        </div>
        <div className={styles.infoContainer}>
          <h4>Actor: {`${actor?.firstName} ${actor?.lastName}`}</h4>
          <h4>Movies: {actor?.movies}</h4>
          <h4>Author: {author}</h4>
          <h4>Likes: {actor?.likes}</h4>
          <Button
            variant="contained"
            color="secondary"
            className={styles.btn}
            onClick={likeHandler}
          >
            <i className="fas fa-thumbs-up"></i>
            <h4>Like</h4>
          </Button>
          <Button
            variant="contained"
            color="secondary"
            className={styles.btn}
            onClick={addCommentHandler}
          >
            <i className="fas fa-comment-alt"></i>
            <h4>Comment</h4>
          </Button>
        </div>
      </div>
      {feedbackAlert}
      {showAddComment ? (
        <AddComment id={actor?.id} refresh={pageRefresh} />
      ) : (
        ""
      )}
      <div className={styles.comments}>
        <h3>Comments</h3>
        {comments}
      </div>
    </div>
  );
};

export default Actor;
