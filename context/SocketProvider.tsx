"use client";
import {
  FC,
  useContext,
  createContext,
  ReactNode,
  useCallback,
  useState,
  useEffect,
} from "react";
import { io, Socket } from "socket.io-client";

interface ISocketContext {
  sendMessage: (message: string) => void;
  messages: string[];
}
interface SocketProviderProps {
  children: ReactNode;
}

const SocketContext = createContext<ISocketContext | null>(null);
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<string[]>([]);

  const sendMessage = useCallback(
    (msg: string) => {
      console.log("Sending message: ", msg);
      socket?.emit("event:message", msg);
    },
    [socket]
  );

  const onMessageRecorded = useCallback(
    (msg: string) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    },
    [setMessages]
  );

  useEffect(() => {
    const _socket = io("http://localhost:8000");
    _socket.on("connection", () => {
      console.log("Connected to server");
    });
    _socket.on("message", onMessageRecorded);
    setSocket(_socket);
    return () => {
      _socket.off("message", onMessageRecorded);
      _socket.disconnect();
      setSocket(undefined);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
};
