import { useRef, useState, useEffect } from "react";
import { auth, logout } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/forum.css";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/forum`;

function Forum() {
    const [threads, setThreads] = useState([]);
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedThread, setSelectedThread] = useState(null);
    const [showThreadModal, setShowThreadModal] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);
    const [sortOption, setSortOption] = useState("latest");

    // Thread Form
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [tags, setTags] = useState("");

    //full screen view
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const hamburgerRef = useRef(null);


    // Poll Form
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState([""]);

    // Reply Form
    const [replyMessage, setReplyMessage] = useState("");
    const navigate = useNavigate();



    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            const storedAlumni = JSON.parse(localStorage.getItem("alumni"));

            if (currentUser) {
                setUser(currentUser);
            } else if (storedAlumni) {
                setUser({ displayName: storedAlumni.name, isAlumni: true });  // Mimic structure
            } else {
                alert('Please login to continue');

                navigate("/");
            }
        });

        fetchThreads(sortOption); // ✅ Use current sort option on first load
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close the sidebar if click is outside both sidebar and hamburger
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target) &&
                hamburgerRef.current &&
                !hamburgerRef.current.contains(event.target)
            ) {
                setSidebarOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    const fetchThreads = async (sort = "latest") => {
        try {
            const res = await axios.get(`${API_URL}/threads?sort=${sort}`);
            setThreads(res.data);
        } catch (err) {
            console.error("Error fetching threads:", err);
        }
    };





    const fetchUserPosts = async () => {
        try {
            const storedAlumni = JSON.parse(localStorage.getItem("alumni"));
            const name = storedAlumni?.name || user?.displayName?.split(" ")[0];  // 🛠 FIXED

            if (!name) return alert("User not identified");

            const res = await axios.get(`${API_URL}/my-posts/${name}`);
            setThreads(res.data);
        } catch (err) {
            console.error("Error fetching user's posts:", err);
        }
    };




    const handleCreateThread = async () => {
        if (!title.trim() || !content.trim()) {
            alert("Title and content are required.");
            return;
        }

        const formData = new FormData();
        const storedAlumni = JSON.parse(localStorage.getItem("alumni"));
        const posterName = storedAlumni?.name || user.displayName;
        formData.append("name", posterName);
        formData.append("title", title);
        formData.append("content", content);
        formData.append("tags", tags);
        if (image) formData.append("image", image);

        try {
            await axios.post(`${API_URL}/create-thread`, formData, { headers: { "Content-Type": "multipart/form-data" } });

            // 🔧 ADD BOTH:
            fetchThreads();     // ✅ Updates the "All Threads" list
            fetchUserPosts();   // ✅ Updates the "My Posts" tab

            setShowThreadModal(false);
            resetForm();

        } catch (err) {
            console.error("Error creating thread:", err);
        }
    };

    const handleCreatePoll = async () => {
        if (!pollQuestion.trim()) {
            alert("Poll question is required.");
            return;
        }

        if (pollOptions.length < 2 || pollOptions.some(opt => opt.trim() === "")) {
            alert("At least two valid options are required.");
            return;
        }

        const storedAlumni = JSON.parse(localStorage.getItem("alumni"));
        const posterName = storedAlumni?.name || user.displayName;

        const pollData = {
            name: posterName,
            pollQuestion,
            pollOptions
        };


        try {
            await axios.post(`${API_URL}/create-poll`, pollData);

            // 🔧 ADD BOTH:
            fetchPolls();      // ✅ Updates the "View Polls" list
            fetchUserPosts();  // ✅ Updates the "My Posts" tab

            setShowPollModal(false);
            resetForm();

        } catch (err) {
            console.error("Error creating poll:", err);
        }
    };

    const handleReplyToThread = async (threadId) => {
        if (!replyMessage.trim()) {
            alert("Please enter a reply.");
            return;
        }

        const replyData = {
            name: user.displayName.split(" ")[0],
            message: replyMessage,
        };

        try {
            const res = await axios.post(`${API_URL}/${threadId}/reply`, replyData);
            const updatedThread = res.data;

            // ✅ Update global list
            setThreads(prevThreads =>
                prevThreads.map(thread =>
                    thread._id === updatedThread._id ? updatedThread : thread
                )
            );

            // ✅ Update selected thread modal (for instant reply view)
            if (selectedThread && selectedThread._id === updatedThread._id) {
                setSelectedThread(updatedThread);
            }

            setReplyMessage(""); // Clear reply box
        } catch (err) {
            console.error("Error replying to thread:", err);
        }
    };



    const resetForm = () => {
        setTitle("");
        setContent("");
        setImage(null);
        setTags("");
        setPollQuestion("");
        setPollOptions([""]);
    };

    const handleDeleteThread = async (threadId) => {
        try {
            await axios.delete(`${API_URL}/${threadId}?name=${user.displayName.split(" ")[0]}`);
            fetchThreads();
            setSelectedThread(null);
        } catch (err) {
            alert("❌ You can only delete your own thread.");
            console.error("Error deleting thread:", err);
        }
    };

    const fetchPolls = async () => {
        try {
            const res = await axios.get(`${API_URL}/polls`);  // This API call will fetch only polls
            setThreads(res.data);
        } catch (err) {
            console.error("Error fetching polls:", err);
        }
    };


    const handleDeleteReply = async (threadId, replyId) => {
        try {
            await axios.delete(`${API_URL}/${threadId}/reply/${replyId}/${user.displayName.split(" ")[0]}`);
            fetchThreads();
            if (selectedThread && selectedThread._id === threadId) {
                setSelectedThread({ ...selectedThread, replies: selectedThread.replies.filter(r => r._id !== replyId) });
            }
        } catch (err) {
            alert("❌ You can only delete your own reply.");
            console.error("Error deleting reply:", err);
        }
    };

    const handleVote = async (id, type) => {
        try {
            const alumniData = JSON.parse(localStorage.getItem("alumni"));
            const userId = user?.uid || alumniData?.email || user?.displayName?.split(" ")[0];

            if (!userId) {
                alert("❌ Unable to identify user for voting.");
                return;
            }

            const res = await axios.post(`${API_URL}/${id}/vote`, { userId, type });
            const updated = res.data;

            setThreads(prev => prev.map(t => t._id === updated._id ? updated : t));
            if (selectedThread && selectedThread._id === updated._id) {
                setSelectedThread(updated);
            }
        } catch (err) {
            alert("Vote failed: " + err?.response?.data?.message);
            console.error("Error voting:", err);
        }
    };



    const handleVotePoll = async (pollId, optionIndex) => {
        try {
            const alumniData = JSON.parse(localStorage.getItem("alumni"));
            const userId = user?.uid || alumniData?.email || user?.displayName?.split(" ")[0];
            if (!userId) {
                alert("❌ Unable to identify user for poll voting.");
                return;
            }
            const res = await axios.post(`${API_URL}/${pollId}/poll`, { userId, optionIndex });

            const updatedThread = res.data;

            // ✅ Update thread list
            setThreads(prevThreads => prevThreads.map(thread =>
                thread._id === updatedThread._id ? updatedThread : thread
            ));

            // ✅ Update selected thread in modal so it re-renders with vote changes
            if (selectedThread && selectedThread._id === updatedThread._id) {
                setSelectedThread(updatedThread);
            }

        } catch (err) {
            alert(err.response?.data?.message || "Error voting");
            console.error("Error voting:", err);
        }
    };

    let sortedThreads = [...threads].sort((a, b) => {
        if (sortOption === "latest") return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortOption === "upvotes") return (b.votes?.upvotes || 0) - (a.votes?.upvotes || 0);
        if (sortOption === "downvotes") return (b.votes?.downvotes || 0) - (a.votes?.downvotes || 0);
        return 0;
    });





    return (
        <div className="forum-container">


<div
  ref={sidebarRef}
  className={`forum-sidebar ${sidebarOpen ? "open" : ""}`}
>
                <ul>
                    <li><button onClick={() => navigate("/")}>🏠 Home</button></li>
                    <hr />
                    <li><button onClick={fetchThreads}>📢 All Threads</button></li>
                    <li><button onClick={fetchPolls}>📊 View Polls</button></li>
                    <hr />
                    <li><button onClick={fetchUserPosts}>👤 My Posts</button></li>
                    
                </ul>

            </div>
            <button
                ref={hamburgerRef}
                className="forum-hamburger"
                onClick={() => setSidebarOpen((prev) => !prev)}
            >
                ☰
            </button>


            {/* Main Content */}
            <div className="forum-content">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value.toLowerCase())} placeholder="Search..." />
                <div className="sort-controls">
                    <label htmlFor="sort">Sort By: </label>
                    <select
                        id="sort"
                        value={sortOption}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSortOption(value);
                            fetchThreads(value); // ✅ pass selected sort
                        }}
                    >

                        <option value="latest">📅 Latest</option>
                        <option value="upvotes">👍 Most Upvoted</option>
                        <option value="downvotes">👎 Most Downvoted</option>
                    </select>
                </div>

                {/* Right Side Buttons */}
                <div className="forum-buttons">
                    <button onClick={() => setShowThreadModal(true)}>📝 Create Thread</button>
                    <button onClick={() => setShowPollModal(true)}>📊 Create Poll</button>
                </div>

                {/* Thread Modal */}
                {showThreadModal && (
                    <div className="modal">
                        <h3>Create a Thread</h3>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content"></textarea>
                        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma-separated)" />
                        <button onClick={handleCreateThread}>✅ Create Thread</button>
                        <button onClick={() => setShowThreadModal(false)}>❌ Cancel</button>
                    </div>
                )}

                {/* Poll Modal */}
                {showPollModal && (
                    <div className="modal">
                        <h3>Create a Poll</h3>
                        <input type="text" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} placeholder="Poll Question" />
                        {pollOptions.map((option, index) => (
                            <input
                                key={index}
                                type="text"
                                value={option}
                                onChange={(e) => {
                                    const newOptions = [...pollOptions];
                                    newOptions[index] = e.target.value;
                                    setPollOptions(newOptions);
                                }}
                                placeholder={`Option ${index + 1}`}
                            />
                        ))}
                        <button onClick={() => setPollOptions([...pollOptions, ""])}>➕ Add Option</button>
                        <button onClick={handleCreatePoll}>✅ Create Poll</button>
                        <button onClick={() => setShowPollModal(false)}>❌ Cancel</button>
                    </div>
                )}

                {/* Display Threads and Polls */}
                {threads.filter(thread =>
                    thread.title?.toLowerCase().includes(search) ||
                    thread.poll?.question?.toLowerCase().includes(search) ||
                    (thread.tags && thread.tags.some(tag => tag.toLowerCase().includes(search)))
                ).map(thread => (
                    <div key={thread._id} className="thread-card">
                        <h3>{thread.title || "Poll"}</h3>
                        <p className="creator">
                            By:{" "}
                            <strong
                                onClick={() => navigate(`/chat?name=${thread.name}`)}
                                style={{ color: "#2a9d8f", cursor: "pointer" }}
                                title="Click to start chat"
                            >
                                {thread.name}
                            </strong>
                        </p>

                        {thread.poll && <p> {thread.poll.question}</p>}
                        {/* ✅ VOTE BUTTONS */}
                        <div className="vote-buttons">
                            <button onClick={() => handleVote(thread._id, "upvote")}>👍 {thread.votes?.upvotes || 0}</button>
                            <button onClick={() => handleVote(thread._id, "downvote")}>👎 {thread.votes?.downvotes || 0}</button>
                        </div>
                        {/* ✅ Show tags visually */}
                        {thread.tags && thread.tags.length > 0 && (
                            <div className="tag-list">
                                {thread.tags.map((tag, i) => (
                                    <span key={i} className="tag-item">#{tag}</span>
                                ))}
                            </div>
                        )}

                        <button onClick={() => { setSelectedThread(thread); setIsModalOpen(true); }}>View</button>
                    </div>
                ))}




            </div>
            {/* Display Thread Details */}
            {isModalOpen && selectedThread && (
                <div className="thread-detail-modal">
                    <button className="back-btn" onClick={() => setIsModalOpen(false)}>⬅ Back</button>

                    {/* 📊 If it's a poll */}
                    {selectedThread.poll?.question ? (
                        <>
                            <h2>📊 {selectedThread.poll.question}</h2>
                            <p className="creator">
                                By:{" "}
                                <strong
                                    onClick={() => navigate(`/chat?name=${selectedThread.name}`)}
                                    style={{ color: "#2a9d8f", cursor: "pointer" }}
                                    title="Click to start chat"
                                >
                                    {selectedThread.name}
                                </strong>
                            </p>

                            <div className="vote-buttons">
                                <button onClick={() => handleVote(selectedThread._id, "upvote")}>👍 {selectedThread.votes?.upvotes || 0}</button>
                                <button onClick={() => handleVote(selectedThread._id, "downvote")}>👎 {selectedThread.votes?.downvotes || 0}</button>
                            </div>
                            {selectedThread.poll.options.map((option, index) => (
                                <div key={index}>
                                    <button className="vote-btn" onClick={() => handleVotePoll(selectedThread._id, index)}>
                                        {option.option}
                                    </button>
                                    <span>Votes: {option.votes}</span>
                                </div>
                            ))}
                            {selectedThread.name === user.displayName.split(" ")[0] && (
                                <button className="delete-btn" onClick={() => handleDeleteThread(selectedThread._id)}>🗑 Delete Poll</button>
                            )}
                        </>
                    ) : (
                        <>
                            {/* 🧵 Thread UI */}
                            <h2>{selectedThread.title}</h2>
                            <p className="creator">
                                By:{" "}
                                <strong
                                    onClick={() => navigate(`/chat?name=${selectedThread.name}`)}
                                    style={{ color: "#2a9d8f", cursor: "pointer" }}
                                    title="Click to start chat"
                                >
                                    {selectedThread.name}
                                </strong>
                            </p>

                            <p>{selectedThread.content}</p>
                            {selectedThread.image && (
                                <img
                                    src={`http://localhost:5001${selectedThread.image}`}
                                    alt="Thread"
                                    style={{ width: "100%", borderRadius: "10px", marginTop: "10px" }}
                                />
                            )}
                            <div className="vote-buttons">
                                <button onClick={() => handleVote(selectedThread._id, "upvote")}>👍 {selectedThread.votes?.upvotes || 0}</button>
                                <button onClick={() => handleVote(selectedThread._id, "downvote")}>👎 {selectedThread.votes?.downvotes || 0}</button>
                            </div>
                            <div>
                                <h3>Replies</h3>
                                {selectedThread.replies.map((reply, index) => (
                                    <div key={index}>
                                        <p><b>{reply.name}:</b> {reply.message}</p>
                                        {reply.name === user.displayName.split(" ")[0] && (
                                            <button onClick={() => handleDeleteReply(selectedThread._id, reply._id)}>🗑 Delete Reply</button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <input
                                type="text"
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Add a reply..."
                            />
                            <button className="reply-btn" onClick={() => handleReplyToThread(selectedThread._id)}>Reply</button>

                            {selectedThread.name === user.displayName.split(" ")[0] && (
                                <button className="delete-btn" onClick={() => handleDeleteThread(selectedThread._id)}>🗑 Delete Thread</button>
                            )}
                        </>
                    )}
                </div>
            )}




        </div>
    );
}

export default Forum;
