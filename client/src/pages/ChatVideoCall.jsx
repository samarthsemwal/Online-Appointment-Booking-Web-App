import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import PrescriptionModal from "../components/PrescriptionModal";

let socket;

function ChatVideoCall() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  // WebRTC DOM & Connection Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const chatBottomRef = useRef(null);

  const pcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ]
  };

  // Scroll chat to bottom
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      toast.error("Authentication required to access consultation room.");
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // 1. Fetch Appointment Details & Verify Participant
    fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.appointment) {
          setAppointmentDetails(data.appointment);
        }
      })
      .catch(() => {});

    // 2. Fetch Persisted Chat History from MongoDB
    fetch(`http://localhost:5000/api/chat/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.messages) {
          setMessages(data.messages);
        }
      })
      .catch((err) => console.log("Chat history fetch:", err));

    // 3. Initialize Socket.IO connection
    socket = io("http://localhost:5000");

    const roomId = `room_${appointmentId}`;
    socket.emit("join-room", roomId);

    // Socket: Receive new real-time message
    socket.on("receive-message", (msgData) => {
      setMessages((prev) => [...prev, msgData]);
    });

    // Socket: Another user joined room
    socket.on("user-connected", () => {
      toast.info("A participant has connected to the room.");
    });

    // Socket: WebRTC Offer
    socket.on("offer", async (offer) => {
      try {
        if (!peerConnection.current) createPeerConnection();
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("answer", { answer, roomId });
        toast.info("Connecting video stream...");
      } catch (err) {
        console.error("Offer handling error:", err);
      }
    });

    // Socket: WebRTC Answer
    socket.on("answer", async (answer) => {
      try {
        if (peerConnection.current) {
          await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.error("Answer handling error:", err);
      }
    });

    // Socket: ICE Candidate
    socket.on("ice-candidate", async (candidate) => {
      try {
        if (peerConnection.current && candidate) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("ICE Candidate error:", err);
      }
    });

    // Socket: Call Ended
    socket.on("call-ended", () => {
      toast.info("Consultation call has ended.");
      setIsCalling(false);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    });

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, [appointmentId, navigate]);

  const createPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection(pcConfig);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          roomId: `room_${appointmentId}`
        });
      }
    };

    peerConnection.current.ontrack = (event) => {
      setIsCalling(true);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      createPeerConnection();
      localStream.current.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStream.current);
      });
      toast.success("Camera & microphone initialized.");
    } catch (err) {
      console.error(err);
      toast.error("Could not access camera or microphone.");
    }
  };

  const callUser = async () => {
    if (!localStream.current) {
      await startCamera();
    }
    if (!peerConnection.current) {
      createPeerConnection();
    }
    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit("offer", {
        offer,
        roomId: `room_${appointmentId}`
      });
      toast.info("Calling participant...");
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate call offer.");
    }
  };

  const toggleAudio = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const handleEndCall = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach((t) => t.stop());
    }
    socket.emit("end-call", { roomId: `room_${appointmentId}` });
    setIsCalling(false);
    toast.info("Call ended.");
  };

  // Send Message with MongoDB Persistence
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !user) return;

    socket.emit("send-message", {
      roomId: `room_${appointmentId}`,
      appointmentId,
      message: inputMsg.trim(),
      sender: user.name,
      senderId: user._id,
      senderRole: user.role
    });

    setInputMsg("");
  };

  return (
    <div className="container-fluid px-lg-5 my-4">
      {/* Header Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 p-3 bg-white rounded-3 shadow-sm border">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            ← Leave Room
          </button>
          <div>
            <h5 className="fw-bold mb-0">
              Consultation Room #{appointmentId.slice(-6)}
            </h5>
            <span className="small text-muted">
              {appointmentDetails ? `${appointmentDetails.date} • ${appointmentDetails.timeSlot}` : "Live Encrypted Telehealth Session"}
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
          <span className="badge bg-success bg-opacity-10 text-success p-2">
            ● WebRTC Encrypted & Persisted Chat
          </span>

          <button
            className="btn btn-outline-primary btn-sm px-3 fw-bold"
            onClick={() => setShowPrescriptionModal(true)}
          >
            📄 {user?.role === "doctor" ? "Write Prescription" : "View Prescription"}
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* ============================================================ */}
        {/* LEFT COLUMN: HD WEBRTC VIDEO FEED                           */}
        {/* ============================================================ */}
        <div className="col-lg-8">
          <div className="consultation-video-container">
            {/* Remote Video */}
            <video
              autoPlay
              playsInline
              ref={remoteVideoRef}
              className="main-video-feed"
              style={{ display: isCalling ? "block" : "none" }}
            />

            {/* Waiting Placeholder */}
            {!isCalling && (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center px-4 text-white">
                <div className="fs-1 mb-2">📹</div>
                <h4 className="fw-bold mb-2">WebRTC Video Consultation Room</h4>
                <p className="text-white-50 small mb-4" style={{ maxWidth: "480px" }}>
                  Start your local camera, then connect the peer-to-peer HD video stream with your consultant.
                </p>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary px-4 py-2 fw-semibold" onClick={startCamera}>
                    1. Initialize Camera
                  </button>
                  <button className="btn btn-success px-4 py-2 fw-semibold" onClick={callUser}>
                    2. Connect Video Call
                  </button>
                </div>
              </div>
            )}

            {/* Local PiP Video */}
            <video
              autoPlay
              playsInline
              muted
              ref={localVideoRef}
              className="local-pip-video"
            />

            {/* In-Call Floating Control Bar */}
            <div className="video-control-bar">
              <button
                type="button"
                className={`ctrl-btn ${isAudioMuted ? "muted" : "active"}`}
                onClick={toggleAudio}
                title={isAudioMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isAudioMuted ? "🔇" : "🎤"}
              </button>

              <button
                type="button"
                className={`ctrl-btn ${isVideoOff ? "muted" : "active"}`}
                onClick={toggleVideo}
                title={isVideoOff ? "Turn On Camera" : "Turn Off Camera"}
              >
                {isVideoOff ? "🚫" : "📷"}
              </button>

              <button
                type="button"
                className="ctrl-btn danger"
                onClick={handleEndCall}
                title="End Consultation"
              >
                📞
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: PERSISTED CHAT WINDOW                         */}
        {/* ============================================================ */}
        <div className="col-lg-4">
          <div className="chat-container">
            <div className="chat-header">
              <div className="fw-bold text-dark d-flex align-items-center gap-2">
                <span>💬 Consultation Chat</span>
                <span className="badge bg-primary bg-opacity-10 text-primary small">Persisted</span>
              </div>
              <span className="small text-muted">{messages.length} messages</span>
            </div>

            {/* Chat Body */}
            <div className="chat-body">
              {messages.length === 0 ? (
                <div className="text-center text-muted small my-auto">
                  <p className="mb-1">No prior messages in this room.</p>
                  <p className="mb-0">Messages sent here are persisted into MongoDB.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMine = msg.sender === user?.name || msg.senderId === user?._id;
                  return (
                    <div
                      key={msg._id || index}
                      className={`chat-bubble ${isMine ? "mine" : "other"}`}
                    >
                      {!isMine && (
                        <div className="chat-sender-name">
                          {msg.sender} ({msg.senderRole || "user"})
                        </div>
                      )}
                      <div>{msg.message}</div>
                      <div className="chat-timestamp">
                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-top bg-light">
              <form onSubmit={handleSendMessage} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type a clinical note or message..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                />
                <button type="submit" className="btn btn-primary-custom px-3">
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Prescription Modal Drawer */}
      {showPrescriptionModal && (
        <PrescriptionModal
          appointmentId={appointmentId}
          isDoctor={user?.role === "doctor"}
          onClose={() => setShowPrescriptionModal(false)}
        />
      )}
    </div>
  );
}

export default ChatVideoCall;
