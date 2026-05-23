import { io } from 'socket.io-client';
import { WS_URL, WS_EVENTS } from '../utils/constants';
import { TOKEN_KEY } from '../utils/constants';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) return this.socket;

    const token = localStorage.getItem(TOKEN_KEY);
    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on(WS_EVENTS.CONNECT, () => {
      this.emit('connected', true);
    });

    this.socket.on(WS_EVENTS.DISCONNECT, () => {
      this.emit('connected', false);
    });

    Object.values(WS_EVENTS).forEach((event) => {
      if (event !== WS_EVENTS.CONNECT && event !== WS_EVENTS.DISCONNECT) {
        this.socket.on(event, (data) => this.emit(event, data));
      }
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const set = this.listeners.get(event);
    if (set) set.delete(callback);
  }

  emit(event, data) {
    const set = this.listeners.get(event);
    if (set) set.forEach((cb) => cb(data));
  }

  send(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  joinInterview(interviewId) {
    this.send(WS_EVENTS.INTERVIEW_START, { interview_id: interviewId });
  }

  sendResponse(interviewId, response) {
    this.send(WS_EVENTS.INTERVIEW_RESPONSE, {
      interview_id: interviewId,
      ...response,
    });
  }

  endInterview(interviewId) {
    this.send(WS_EVENTS.INTERVIEW_END, { interview_id: interviewId });
  }
}

const websocketService = new WebSocketService();
export default websocketService;
