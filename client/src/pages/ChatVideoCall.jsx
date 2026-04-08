import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { toast } from "react-toastify";

let socket;

function ChatVideoCall() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [user, setUser] = useState(null);
  const [isCalling, setIsCalling] = useState(false);

  // WebRTC & DOM Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const pcConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(storedUser);

    // Init Socket
    socket = io("http://localhost:5000");
    
    socket.emit("join-room", appointmentId);

    // Chat listener
    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // WebRTC logic
    socket.on("offer", async (offer) => {
      if (!peerConnection.current) createPeerConnection();
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("answer", { answer, roomId: appointmentId });
      toast.info("Incoming connection...");
    });

    socket.on("answer", async (answer) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      if (peerConnection.current && candidate) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
      socket.disconnect();
    };
  }, [appointmentId, navigate]);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      toast.success("Camera started");
      createPeerConnection();
      localStream.current.getTracks().forEach(track => {
        peerConnection.current.addTrack(track, localStream.current);
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not access camera/mic.");
    }
  };

  const createPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection(pcConfig);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { candidate: event.candidate, roomId: appointmentId });
      }
    };

    peerConnection.current.ontrack = (event) => {
      setIsCalling(true);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };
  };

  const callUser = async () => {
    if (!peerConnection.current) {
      toast.error("Start your video first!");
      return;
    }
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit("offer", { offer, roomId: appointmentId });
    toast.info("Calling...");
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    socket.emit("send-message", { 
      roomId: appointmentId, 
      message: inputMsg, 
      sender: user.name 
    });
    setInputMsg("");
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Consultation Room</h4>
        <button className="btn btn-outline-danger btn-sm" onClick={() => navigate(-1)}>Leave Room</button>
      </div>

      <div className="row">
        {/* Video Column */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm overflow-hidden border-0 bg-dark text-white rounded-3 position-relative" style={{ height: "500px" }}>
            
            <video 
              autoPlay 
              playsInline 
              ref={remoteVideoRef} 
              style={{ width: "100%", height: "100%", objectFit: "cover", display: isCalling ? "block" : "none" }}
            />
            
            {!isCalling && (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center px-4">
                <div className="fs-1 mb-3">📹</div>
                <h5 className="mb-3">Wait for the other person to join, or start your camera.</h5>
                <div>
                  <button className="btn btn-primary me-2" onClick={startVideo}>1. Start Video</button>
                  <button className="btn btn-success" onClick={callUser}>2. Connect Call</button>
                </div>
              </div>
            )}

            <video 
              autoPlay 
              playsInline 
              muted 
              ref={localVideoRef} 
              style={{ 
                position: "absolute", 
                bottom: "20px", 
                right: "20px", 
                width: "150px", 
                height: "100px", 
                objectFit: "cover", 
                borderRadius: "8px", 
                border: "2px solid rgba(255,255,255,0.5)",
                background: "#000"
              }}
            />

          </div>
        </div>

        {/* Chat Column */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100 chat-window">
            <div className="card-header bg-white border-bottom fw-bold py-3">
              Live Chat
            </div>
            <div className="chat-messages">
              {messages.length === 0 ? <p className="text-muted text-center small mt-4">Start the conversation</p> : null}
              {messages.map((msg, i) => {
                const isMe = msg.sender === user?.name;
                return (
                  <div key={i} className={`chat-message ${isMe ? 'chat-my-msg' : 'chat-other-msg'}`}>
                    {!isMe && <div className="fw-bold small mb-1" style={{fontSize:'0.75rem', opacity:0.7}}>{msg.sender}</div>}
                    <div>{msg.message}</div>
                  </div>
                );
              })}
            </div>
            <div className="p-3 border-top bg-light mt-auto">
              <form onSubmit={sendMessage} className="d-flex">
                <input 
                  type="text" 
                  className="form-control me-2 border-0 shadow-sm" 
                  placeholder="Type a message..." 
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                />
                <button type="submit" className="btn btn-primary px-3">→</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatVideoCall;
