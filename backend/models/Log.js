const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    qrCode: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['IN', 'OUT'], default: 'IN' }
});

module.exports = mongoose.model('Log', LogSchema);