const Conversation = require('../models/Coversation.model.js');
const mongoose = require('mongoose');
const Message = require('../models/Message.model.js');

exports.getRecentChats = async (req, res) => {
    try {
        const userId = req.user.id; // Assumes authentication middleware sets req.user

        // Find all conversations where the user is a participant
        const conversations = await Conversation.aggregate([
            { $match: { participants: new mongoose.Types.ObjectId(userId) } },
            { $unwind: '$participants' },
            { $match: { participants: { $ne: new mongoose.Types.ObjectId(userId) } } }, // Get the other participant
            {
                $lookup: {
                    from: 'profiles',
                    localField: 'participants',
                    foreignField: 'userId',
                    as: 'profile'
                }
            },
            { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'profileimages',
                    let: { userId: '$participants' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'profileImageDoc'
                }
            },
            { $unwind: { path: '$profileImageDoc', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: '$participants',
                    name: '$profile.name',
                    primaryRole: '$profile.primaryRole',
                    profileImage: '$profileImageDoc.imageUrl'
                }
            }
        ]);

        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error fetching recent chats:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getChatsWithUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { receiverId } = req.params;

        // Find the conversation between the two users
        const conversation = await Conversation.findOne({
            participants: { $all: [userId, receiverId] }
        });

        if (!conversation) {
            return res.status(404).json({ message: 'No conversation found.' });
        }

        // Get all messages between the two users in this conversation
        const messages = await Message.find({
            conversationId: conversation._id
        })
            .sort({ createdAt: 1 }) // oldest to newest
            .lean();

        res.status(200).json({
            conversationId: conversation._id,
            messages
        });
    } catch (error) {
        console.error('Error fetching chat:', error);
        res.status(500).json({ error: 'Server error' });
    }
};