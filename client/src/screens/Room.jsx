import { useEffect, useState, useCallback } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream,setRemoteStream] = useState();

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      // console.log("incomming call",from,offer);
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const handleCallAccepted = useCallback(({from,ans}) =>{
    // console.log("accepted call",from,ans);
    peer.setLocalDescription(ans);
    console.log("call accepted")
    for(const track of myStream.getTracks()){
        peer.peer.addTrack(track,myStream);
    }
  },[])

  useEffect(()=>{
    peer.peer.addEventListener("track",async (ev)=>{
      const remoteStream = ev.streams
      setRemoteStream(remoteStream);
    })
  })


  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
    };
  }, [socket, handleUserJoined, handleIncommingCall]);

  return (
    <div>
      <h1>This is RoomPage page</h1>
      <h1>{remoteSocketId ? "You are connected" : "No One In Room"}</h1>
      {remoteSocketId && <button onClick={() => handleCallUser()}>call</button>}
      {myStream && (
        <div>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            height="500px"
            width="300px"
            url={myStream}
          />
        </div>
      )}
      {myStream && (
        <div>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            muted
            height="500px"
            width="300px"
            url={remoteStream}
          />
        </div>
      )}
    </div>
  );
};

export default RoomPage;
