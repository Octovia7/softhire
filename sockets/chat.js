const Message = require('../models/Message.model.js');
const Conversation = require('../models/Coversation.model.js');

const users = new Map(); // Map<userId, socketId>

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log("✅ New client connected");

        // 🟢 Register user
        socket.on("register", (userId) => {
            users.set(userId, socket.id);
            console.log(`📌 User ${userId} registered on socket ${socket.id}`);
        });

        // 💬 Handle sending a message
        socket.on("private_message", async ({ senderId, receiverId, content }) => {
            try {
                // Step 1: Find or create conversation
                let conversation = await Conversation.findOne({
                    participants: { $all: [senderId, receiverId] },
                });

                if (!conversation) {
                    conversation = await Conversation.create({ participants: [senderId, receiverId] });
                }

                // Step 2: Save message to DB
                const message = await Message.create({
                    sender: senderId,
                    receiver: receiverId,
                    content,
                    conversationId: conversation._id,
                });

                // Step 3: Emit to receiver if online
                const receiverSocketId = users.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("new_message", message);
                }

                // Optionally, emit to sender to confirm delivery
                socket.emit("message_sent", message);

            } catch (err) {
                console.error("❌ Error sending message:", err);
                socket.emit("error", "Message failed");
            }
        });

        // 🔴 Handle disconnect
        socket.on("disconnect", () => {
            for (const [userId, sockId] of users.entries()) {
                if (sockId === socket.id) {
                    users.delete(userId);
                    console.log(`🛑 User ${userId} disconnected`);
                }
            }
        });
    });
};
