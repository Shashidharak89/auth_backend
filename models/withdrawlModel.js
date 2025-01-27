import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    }, // Reference to the user making the withdrawal
    userEmail: {
        type: String,
        required: true
    }, // Email of the user
    userName: {
        type: String,
        required: true
    }, // Name of the user
    amount: {
        type: Number,
        required: true
    }, // Amount being withdrawn
    method: {
        type: String,
        required: true
    }, // Withdrawal method
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    }, // Withdrawal status
    createdAt: {
        type: Date,
        default: Date.now
    }, // Timestamp of creation
});

const Tournament =mongoose.model('Withdrawal', withdrawalSchema);
export default Tournament;