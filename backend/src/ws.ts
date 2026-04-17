import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { isAuthEnabled, isAuthenticated } from "./auth";

export const setupWebSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
    maxHttpBufferSize: 10e6,
  });

  io.use((socket, next) => {
    if (!isAuthEnabled()) {
      return next();
    }
    if (isAuthenticated(socket.request)) {
      return next();
    }
    return next(new Error("Unauthorized"));
  });

  io.on("connection", (socket) => {
    socket.emit("init-room");

    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);

      const clients = Array.from(
        io.sockets.adapter.rooms.get(roomId) || [],
      );

      if (clients.length <= 1) {
        socket.emit("first-in-room");
      } else {
        socket.broadcast.to(roomId).emit("new-user", socket.id);
      }

      io.in(roomId).emit(
        "room-user-change",
        clients,
      );
    });

    socket.on(
      "server-broadcast",
      (roomId: string, encryptedData: ArrayBuffer, iv: Uint8Array) => {
        socket.broadcast.to(roomId).emit("client-broadcast", encryptedData, iv);
      },
    );

    socket.on(
      "server-volatile-broadcast",
      (roomId: string, encryptedData: ArrayBuffer, iv: Uint8Array) => {
        socket.volatile.broadcast
          .to(roomId)
          .emit("client-broadcast", encryptedData, iv);
      },
    );

    socket.on("user-follow", (payload: any) => {
      const roomId = payload.userToFollow
        ? `follow@${payload.userToFollow.socketId}`
        : null;

      if (roomId) {
        socket.join(roomId);
        io.in(roomId).emit("user-follow-room-change", Array.from(
          io.sockets.adapter.rooms.get(roomId) || [],
        ));
      }
    });

    socket.on("disconnecting", () => {
      for (const roomId of socket.rooms) {
        if (roomId === socket.id) {
          continue;
        }

        const clients = Array.from(
          io.sockets.adapter.rooms.get(roomId) || [],
        ).filter((id) => id !== socket.id);

        if (clients.length > 0) {
          io.in(roomId).emit("room-user-change", clients);
        }
      }
    });
  });

  return io;
};
