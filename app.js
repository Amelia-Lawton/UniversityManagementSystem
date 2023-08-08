const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/getStudents', (req, res) => {
    const searchTerm = req.query.search.toLowerCase();
    const studentsData = JSON.parse(fs.readFileSync('students.json', 'utf8')).students;

    const matchingStudents = studentsData.filter(
        s => s.name.toLowerCase().includes(searchTerm) || s.student_id.includes(searchTerm)
    );

    if (matchingStudents.length > 0) {
        res.json({ success: true, students: matchingStudents });
    } else {
        res.json({ success: false });
    }
});

app.post('/updateStudent', (req, res) => {
    const { student_id, grades, attendance } = req.body;

    const studentsData = JSON.parse(fs.readFileSync('students.json', 'utf8'));
    const studentIndex = studentsData.students.findIndex(student => student.student_id === student_id);

    if (studentIndex !== -1) {
        if (grades) {
            studentsData.students[studentIndex].grades.subjects = grades;
        }
        if (attendance) {
            studentsData.students[studentIndex].attendance.subjects = attendance;
        }

        fs.writeFile('./students.json', JSON.stringify(studentsData, null, 2), err => {
            if (err) {
                console.error('Error writing to file:', err);
                res.json({ success: false });
            } else {
                res.json({ success: true });
            }
        });
    } else {
        res.json({ success: false });
    }
});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});


