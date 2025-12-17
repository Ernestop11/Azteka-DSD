import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
  path: '/socket.io',
  transports: ['polling', 'websocket'],
  withCredentials: true,
  reconnection: true,
});

socket.on('connect', () => console.log('✅ Connected to Socket.IO server'));
socket.on('connect_error', (err) =>
  console.warn('⚠️ Socket.IO connection error:', err.message)
);

export default socket;
