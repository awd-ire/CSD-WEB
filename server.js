const mysql = require('mysql2');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const app = express();

// Allow CORS
app.use(cors());

// Serve static files
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'dilip',
    password: '3615',
    database: 'csd_dept_web',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

// Fetch list of notes
app.get('/notes', (req, res) => {
    const sql = 'SELECT notes_id, subject_name FROM notes';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error retrieving notes:', err);
            return res.status(500).send('Error retrieving notes');
        }
        res.json(results);
    });
});

// File download route
app.get('/file/:id', (req, res) => {
    const fileId = req.params.id;
    const sql = 'SELECT subject_name, notes_url FROM notes WHERE notes_id = ?';

    db.query(sql, [fileId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Error retrieving file');
        }

        if (result.length === 0) {
            console.log('File not found for ID:', fileId);
            return res.status(404).send('File not found');
        }

        const filePath = result[0].notes_url;
        const fileName = result[0].subject_name;

        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error('File does not exist:', filePath);
                return res.status(404).send('File not found');
            }

            res.download(filePath, fileName, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                }
            });
        });
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
