import io from 'socket.io-client';
const socket = io('/ui', { autoConnect: false });
export default socket;
