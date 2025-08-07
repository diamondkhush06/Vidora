import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import styles from "../style/videoComponent.module.css";
import server from '../environment';

const server_url = server;
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

let connections = {};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoref = useRef();
  const videoRef = useRef([]);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [screenAvailable, setScreenAvailable] = useState(false);

  const [videos, setVideos] = useState([]);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState('');
  const [showModal, setModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [newMessages, setNewMessages] = useState(0);

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    if (screen) {
      startScreenShare();
    }
  }, [screen]);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });

      setVideoAvailable(!!videoPermission);
      setAudioAvailable(!!audioPermission);

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      }

      if (videoPermission || audioPermission) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        window.localStream = userMediaStream;
        if (localVideoref.current) {
          localVideoref.current.srcObject = userMediaStream;
        }
      }
    } catch (error) {
      console.log('Permission error:', error);
    }
  };

  const startScreenShare = () => {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      .then(stream => {
        window.localStream = stream;
        localVideoref.current.srcObject = stream;
        broadcastStream();
        stream.getTracks().forEach(track => {
          track.onended = () => {
            setScreen(false);
            getUserMedia();
          };
        });
      })
      .catch(e => console.log("Screen share error:", e));
  };

  const getUserMedia = () => {
    navigator.mediaDevices.getUserMedia({ video, audio })
      .then(stream => {
        window.localStream = stream;
        localVideoref.current.srcObject = stream;
        broadcastStream();
      })
      .catch(err => console.log("getUserMedia error", err));
  };

  const broadcastStream = () => {
    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addStream(window.localStream);
      connections[id].createOffer().then(description => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit('signal', id, JSON.stringify({ sdp: connections[id].localDescription }));
          });
      });
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on('connect', () => {
      socketIdRef.current = socketRef.current.id;
      socketRef.current.emit('join-call', window.location.href);

      socketRef.current.on('chat-message', addMessage);

      socketRef.current.on('user-left', (id) => {
        setVideos(prev => prev.filter(video => video.socketId !== id));
      });

      socketRef.current.on('user-joined', (id, clients) => {
        clients.forEach(socketListId => {
          if (connections[socketListId]) return;

          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate) {
              socketRef.current.emit('signal', socketListId, JSON.stringify({ ice: event.candidate }));
            }
          };

          connections[socketListId].onaddstream = (event) => {
            setVideos(prev => {
              const exists = prev.find(v => v.socketId === socketListId);
              const updated = exists
                ? prev.map(v => v.socketId === socketListId ? { ...v, stream: event.stream } : v)
                : [...prev, { socketId: socketListId, stream: event.stream }];
              videoRef.current = updated;
              return updated;
            });
          };

          if (window.localStream) {
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            connections[id2].createOffer().then(description => {
              connections[id2].setLocalDescription(description).then(() => {
                socketRef.current.emit('signal', id2, JSON.stringify({ sdp: connections[id2].localDescription }));
              });
            });
          }
        }
      });
    });
  };

  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);
    if (fromId !== socketIdRef.current) {
      if (!connections[fromId]) return;

      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === 'offer') {
            connections[fromId].createAnswer().then(description => {
              connections[fromId].setLocalDescription(description).then(() => {
                socketRef.current.emit('signal', fromId, JSON.stringify({ sdp: connections[fromId].localDescription }));
              });
            });
          }
        });
      }

      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
      }
    }
  };

  const handleVideo = () => {
    setVideo(prev => {
      const newVal = !prev;
      navigator.mediaDevices.getUserMedia({ video: newVal, audio })
        .then(stream => {
          window.localStream = stream;
          localVideoref.current.srcObject = stream;
          broadcastStream();
        });
      return newVal;
    });
  };

  const handleAudio = () => {
    setAudio(prev => {
      const newVal = !prev;
      navigator.mediaDevices.getUserMedia({ video, audio: newVal })
        .then(stream => {
          window.localStream = stream;
          localVideoref.current.srcObject = stream;
          broadcastStream();
        });
      return newVal;
    });
  };

  const handleScreen = () => {
    setScreen(!screen);
  };

  const handleEndCall = () => {
    if (localVideoref.current?.srcObject) {
      localVideoref.current.srcObject.getTracks().forEach(track => track.stop());
    }
    window.location.href = "/";
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages(prev => [...prev, { sender, data }]);
    if (socketIdSender !== socketIdRef.current && !showModal) {
      setNewMessages(prev => prev + 1);
    }
  };

  const sendMessage = () => {
    socketRef.current.emit('chat-message', message, username);
    setMessage("");
  };

  const connect = () => {
    setAskForUsername(false);
    getUserMedia();
    connectToSocketServer();
  };

  return (
    <div>
      {askForUsername ? (
        <div className={styles.lobbyContainerUpdated}>
          <div className={styles.lobbyLeft}>
            <h2 className={styles.lobbyHeading}>Enter into Lobby</h2>
            <TextField
              label="Join with name as"
              value={username}
              onChange={e => setUsername(e.target.value)}
              variant="outlined"
              fullWidth
              className={styles.lobbyTextField}
              InputLabelProps={{ style: { color: '#ffffff' } }}
              InputProps={{
                style: { color: '#ffffff', backgroundColor: '#1e1e1e' }
              }}
            />
          </div>
          <div className={styles.lobbyRight}>
            <video className={styles.lobbyVideoPreview} ref={localVideoref} autoPlay muted></video>
            <Button variant="contained" onClick={connect} className={styles.lobbyJoinButton}>Join Now</Button>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModal && (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>
                <div className={styles.chattingDisplay}>
                  {messages.length
                    ? messages.map((item, i) => (
                      <div key={i} style={{ marginBottom: "20px" }}>
                        <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                        <p>{item.data}</p>
                      </div>
                    ))
                    : <p>No Messages Yet</p>
                  }
                </div>
                <div className={styles.chattingArea}>
                  <TextField
                    fullWidth
                    value={message}
                    onChange={handleMessage}
                    label="Enter Your Chat"
                    variant="outlined"
                    InputLabelProps={{ style: { color: '#ffffff' } }}
                    InputProps={{
                      style: { color: '#ffffff', backgroundColor: '#1e1e1e' }
                    }}
                  />
                  <Button variant='contained' onClick={sendMessage}>Send</Button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            {screenAvailable && (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
              </IconButton>
            )}
            <Badge badgeContent={newMessages} max={999} color='error'>
              <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

          <div className={styles.conferenceView}>
            {videos.map(video => (
              <video
                key={video.socketId}
                data-socket={video.socketId}
                ref={ref => { if (ref && video.stream) ref.srcObject = video.stream; }}
                autoPlay
                className={styles.peerVideo}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
