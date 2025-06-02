import { useState, useEffect,useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/chat.css";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CHAT_API_URL = `${import.meta.env.VITE_API_BASE_URL}/chat`;
const socket = io(import.meta.env.VITE_API_BASE_URL);


function Chat() {
    const [user, setUser] = useState(null);
    const [alumni, setAlumni] = useState(JSON.parse(localStorage.getItem("alumni")) || null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [searchParams] = useSearchParams();
    const receiverName = searchParams.get("name");
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatList, setChatList] = useState([]);
    const navigate = useNavigate();

    const hasAlertedRef = useRef(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else if (!alumni && !hasAlertedRef.current) {
                hasAlertedRef.current = true;
                alert("Please login to continue");
                navigate("/");
            }
        });
    
        if (alumni) {
            setUser({ displayName: alumni.name });
        }
    
        return () => unsubscribe();
    }, []);
    
    

    useEffect(() => {
        if (!user && !alumni) return;
        fetchChatList();
    }, [user, alumni]);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat);
        }
    }, [selectedChat]);

    useEffect(() => {
        if (receiverName) {
            setSelectedChat(receiverName);
            fetchMessages(receiverName);
        }
    }, [receiverName]);

    // ✅ Fetch chat list with last messages
    const fetchChatList = async () => {
        const username = user ? user.displayName : alumni?.name;
        if (!username) return;

        try {
            const res = await axios.get(`${CHAT_API_URL}/users/${username}`);
            const chatUsers = await Promise.all(
                res.data.map(async (chatUser) => {
                    try {
                        const lastMessageRes = await axios.get(`${CHAT_API_URL}/last-message/${username}/${chatUser}`);
                        return { name: chatUser, lastMessage: lastMessageRes.data };
                    } catch (error) {
                        console.error(`❌ Error fetching last message for ${chatUser}:`, error);
                        return { name: chatUser, lastMessage: null };
                    }
                })
            );

            setChatList(chatUsers);
        } catch (err) {
            console.error("❌ Error fetching chat users:", err);
        }
    };

    // ✅ Fetch messages between two users
    const fetchMessages = async (receiverName) => {
        const senderName = user ? user.displayName : alumni?.name;
        if (!receiverName || !senderName) return;

        try {
            const res = await axios.get(`${CHAT_API_URL}/${senderName}/${receiverName}`);
            setMessages(res.data);
        } catch (err) {
            console.error("❌ Error fetching messages:", err);
        }
    };

    // ✅ Send message & update UI instantly
    const sendMessage = async () => {
        if (!messageInput.trim() || !selectedChat) return;

        const senderName = user ? user.displayName : alumni?.name;
        if (!senderName) return alert("Login required to send messages");

        const newMessage = { sender: senderName, receiver: selectedChat, message: messageInput };

        setMessageInput("");
        setMessages([...messages, newMessage]);

        socket.emit("send_message", newMessage);

        try {
            await axios.post(`${CHAT_API_URL}/send`, newMessage);
            fetchChatList();
        } catch (err) {
            console.error("❌ Error sending message:", err);
        }
    };

    // ✅ Delete a specific message
    const deleteMessage = async (messageId) => {
        try {
            await axios.delete(`${CHAT_API_URL}/delete-message/${messageId}`);
            setMessages(messages.filter(msg => msg._id !== messageId)); // Remove from UI
        } catch (err) {
            console.error("❌ Error deleting message:", err);
        }
    };

    // ✅ Delete entire chat
    const deleteChat = async () => {
        if (!selectedChat) return;

        const senderName = user ? user.displayName : alumni?.name;
        if (!senderName) return alert("Login required");

        if (!window.confirm(`Are you sure you want to delete the chat with ${selectedChat}?`)) return;

        try {
            await axios.delete(`${CHAT_API_URL}/delete-chat/${senderName}/${selectedChat}`);
            setMessages([]); // Clear UI
            setChatList(chatList.filter(chat => chat.name !== selectedChat)); // Remove from list
            setSelectedChat(null);
        } catch (err) {
            console.error("❌ Error deleting chat:", err);
        }
    };

    // ✅ Real-time update when a message is received
    useEffect(() => {
        socket.on("receive_message", (message) => {
            if (message.receiver === (user ? user.displayName : alumni?.name) || message.sender === (user ? user.displayName : alumni?.name)) {
                setMessages(prevMessages => [...prevMessages, message]);
            }
        });

        return () => {
            socket.off("receive_message");
        };
    }, [user, alumni]);

    return (
        <div className="chat-container">
            {/* Sidebar */}
            <div className="chat-sidebar">
                <h2>Your Chats</h2>
                {chatList.length === 0 ? (
                    <p>No chats available</p>
                ) : (
                    <ul>
                        {chatList.map((chat, index) => (
                            <li
                                key={index}
                                className={`chat-user ${selectedChat === chat.name ? "active" : ""}`}
                                onClick={() => {
                                    setSelectedChat(chat.name);
                                    fetchMessages(chat.name);
                                }}
                            >
                                <div>
                                    <strong>{chat.name}</strong>
                                    <p className="last-message">{chat.lastMessage ? chat.lastMessage.message : "No messages yet"}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Chat Window */}
            <div className="chat-window">
                {selectedChat ? (
                    <>
                        <div className="chat-header">
                            <h2
                                className="chat-username"
                                onClick={() => navigate(`/profile?name=${selectedChat}`)}
                                style={{ cursor: "pointer", color: "#2a9d8f" }}
                                title="Click to view profile"
                            >
                                {selectedChat}
                            </h2>
                            <button className="delete-chat-btn" onClick={deleteChat}>Delete Chat</button>
                        </div>

                        <div className="messages">
                            {messages.map((msg, idx) => (
                                <div key={msg._id} className={msg.sender === (user ? user.displayName : alumni?.name) ? "sent" : "received"}>
                                    <strong>{msg.sender.split(" ")[0]}:</strong> {msg.message}

                                    {/* Show delete button only for sender */}
                                    {msg.sender === (user ? user.displayName : alumni?.name) && (
                                        <button className="delete-btn" onClick={() => deleteMessage(msg._id)}>
                                            <FaTrashAlt />
                                        </button>)}
                                </div>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button onClick={sendMessage}>Send</button>
                    </>
                ) : (
                    <p>Select a user to start chatting</p>
                )}
            </div>
        </div>
    );
}

export default Chat;
