const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Log = require('./models/Log');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Database Connection 
mongoose.connect('mongodb://localhost:27017/qr-attendance')
    .then(() => console.log("✅ Connected to MongoDB: qr-attendance"))
    .catch(err => console.error("❌ Connection error:", err));

// 2. Employee Schema
const employeeSchema = new mongoose.Schema({
    fullName: String,
    qrCode: String
});
const Employee = mongoose.model('Employee', employeeSchema);

// 3. Main Scan Route (Check-in / Check-out)
app.post('/api/scan', async (req, res) => {
    try {
        const { qrCode } = req.body;
        
        const employee = await Employee.findOne({ qrCode: qrCode });
        const displayName = employee ? employee.fullName : qrCode;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Pronalaženje poslednjeg skena koristeći novi naziv polja 'timestamp'
        const lastLog = await Log.findOne({ 
            qrCode: displayName, 
            timestamp: { $gte: today } 
        }).sort({ timestamp: -1 });

        // --- DEBOUNCE LOGIC (Anti-double scan) ---
        if (lastLog) {
            const lastTime = new Date(lastLog.timestamp).getTime();
            const nowTime = new Date().getTime();
            const diff = nowTime - lastTime;

            console.log(`Time since last scan: ${diff}ms`); 

            if (diff >= 0 && diff < 2000) {
                console.log("Dupli sken ignorisan (tiho).");
                return res.json({ 
                    success: false,
                    isDuplicate: true,
                    message:""
                });
            }
        }

        const type = (lastLog && lastLog.type === 'IN') ? 'OUT' : 'IN';

        const newLog = new Log({ 
            qrCode: displayName, 
            timestamp: new Date(), 
            type: type
        });
        
        await newLog.save();

        const statusMessage = employee 
            ? `${type === 'IN' ? 'Welcome' : 'Goodbye'}, ${employee.fullName}!` 
            : "Unknown code registered";

        res.json({ 
            success: true, 
            message: statusMessage,
            data: newLog 
        });
    } catch (error) {
        console.error("Scan error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 4. Get all logs for the table
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json([]);
    }
});

// 5. Get dashboard statistics
app.get('/api/stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalToday = await Log.countDocuments({ timestamp: { $gte: today } });

        const presentCount = await Log.aggregate([
            { $match: { timestamp: { $gte: today } } },
            { $sort: { timestamp: -1 } },
            { $group: { _id: "$qrCode", lastStatus: { $first: "$type" } } },
            { $match: { lastStatus: "IN" } }
        ]);

        res.json({
            totalScans: totalToday,
            presentEmployees: presentCount.length
        });
    } catch (error) {
        res.status(500).json({ totalScans: 0, presentEmployees: 0 });
    }
});

// 6. Register new employee
app.post('/api/employees', async (req, res) => {
    try {
        const { fullName, qrCode } = req.body;
        const newEmployee = new Employee({ fullName, qrCode });
        await newEmployee.save();
        res.json({ success: true, message: "Employee added successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error saving employee" });
    }
});

// 7. Delete all logs (Reset button)
app.delete('/api/logs', async (req, res) => {
    try {
        await Log.deleteMany({});
        res.json({ success: true, message: "All logs cleared!" });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.listen(5001, () => console.log("🚀 Server running on port 5001"));