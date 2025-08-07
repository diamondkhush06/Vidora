import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    const handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    return (
        <>
            <div className="navBar blurredNavBar">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <VideoCameraFrontIcon fontSize="large" />
                    <h2 style={{ margin: 0 }}>Vidora</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <IconButton onClick={() => navigate("/history")}>
                        <RestoreIcon sx={{ color: "white" }} />
                    </IconButton>
                    <p style={{ color: "white", margin: 0 }}>History</p>

                    <Button
                        variant="outlined"
                        sx={{
                            color: 'black',
                            borderColor: 'white',
                            '&:hover': { backgroundColor: '#444' }
                        }}
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth");
                        }}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Providing Quality Video Call Just Like Quality Education</h2>

                        <div style={{ display: 'flex', gap: "10px", marginTop: "20px" }}>
                            <TextField
                                onChange={e => setMeetingCode(e.target.value)}
                                label="Meeting Code"
                                variant="outlined"
                                sx={{
                                    input: { color: 'white' },
                                    label: { color: '#ccc' },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#777' },
                                        '&:hover fieldset': { borderColor: '#aaa' },
                                        '&.Mui-focused fieldset': { borderColor: '#fff' }
                                    },
                                    backgroundColor: '#1e1e1e',
                                    borderRadius: '5px'
                                }}
                            />
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: "#1c89e2ff",
                                    color: "#000",
                                    '&:hover': { backgroundColor: "#00e6b0" }
                                }}
                                onClick={handleJoinVideoCall}
                            >
                                Join
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img srcSet='/logo3.png' alt="" style={{ maxWidth: "100%", borderRadius: "20px" }} />
                </div>
            </div>
        </>
    );
}

export default withAuth(HomeComponent);
