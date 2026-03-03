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

        // 💬 Handle sending a private message
        socket.on("private_message", async ({ sender, receiver, content }) => {
            try {
                // Step 1: Find or create conversation
                let conversation = await Conversation.findOne({
                    participants: { $all: [sender, receiver] },
                });

                if (!conversation) {
                    conversation = await Conversation.create({ participants: [sender, receiver] });
                }

                // Step 2: Save message to DB
                const message = await Message.create({
                    sender,
                    receiver,
                    content,
                    conversationId: conversation._id,
                });

                // Step 3: Emit to receiver if online
                const receiverSocketId = users.get(receiver);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("new_message", message);
                }

                // Confirm to sender
                socket.emit("message_sent", message);

            } catch (err) {
                console.error("❌ Error sending message:", err);
                socket.emit("error", "Message failed");
            }
        });

        // ✅ Mark messages as read
        socket.on("mark_as_read", async ({ userId, conversationId }) => {
            try {
                await Message.updateMany(
                    { conversationId, receiver: userId, read: false },
                    { $set: { read: true } }
                );

                console.log(`✅ Messages in conversation ${conversationId} marked as read for user ${userId}`);

                // Notify the other participant
                const conversation = await Conversation.findById(conversationId);
                if (conversation) {
                    const otherUserId = conversation.participants.find(
                        (participantId) => participantId.toString() !== userId
                    );
                    const otherUserSocketId = users.get(otherUserId?.toString());
                    if (otherUserSocketId) {
                        io.to(otherUserSocketId).emit("messages_read", { conversationId, userId });
                    }
                }
            } catch (err) {
                console.error("❌ Error marking messages as read:", err);
                socket.emit("error", "Failed to mark messages as read");
            }
        });

        // 🔔 Send real-time notification
        socket.on('send_notification', ({ receiverId, notification }) => {
            const receiverSocketId = users.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('notification', notification);
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
