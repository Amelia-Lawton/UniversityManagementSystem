document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const studentDataDiv = document.getElementById('studentData');

    searchButton.addEventListener('click', function () {
        const searchTerm = searchInput.value;
        fetchStudentData(searchTerm);
    });

    function fetchStudentData(searchTerm) {
        fetch(`/getStudents?search=${searchTerm}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayMatchingStudents(data.students);
                } else {
                    studentDataDiv.innerHTML = 'No matching students found.';
                }
            })
            .catch(error => {
                console.error('Error fetching student data:', error);
                studentDataDiv.innerHTML = 'An error occurred.';
            });
    }

    function displayMatchingStudents(students) {
        studentDataDiv.innerHTML = '';

        students.forEach(student => {
            const averageAttendance = calculateAverage(student.attendance.subjects);
            const averageScore = calculateAverage(student.grades.subjects);

            const studentDiv = document.createElement('div');
            studentDiv.classList.add('student-div');

            studentDiv.innerHTML = `
                <div class="student-info">
                    <h2>${student.name}</h2>
                    <p>Student ID: ${student.student_id}</p>
                    <p>University: ${student.university}</p>
                    <p>Major: ${student.major}</p>
                </div>
                <div class="student-grades">
                    <h3>Grades:</h3>
                    <ul class="subject-list">${formatSubjectsList(student.grades.subjects)}</ul>
                    <p>Average Score: ${averageScore.toFixed(2)}</p>
                    <form class="update-form">
                        <label for="updatedGrades">Update Grades (subject1: score1, subject2: score2, subject3: score3, ...
                            ):</label>
                        <input type="text" id="updatedGrades" name="updatedGrades">
                        <button type="submit" class="update-button" data-id="${student.student_id}" data-type="grades">Update</button>
                    </form>
                </div>
                <div class="student-attendance">
                    <h3>Attendance:</h3>
                    <ul class="subject-list">${formatSubjectsList(student.attendance.subjects)}</ul>
                    <p>Average Attendance: ${averageAttendance.toFixed(2)}</p>
                    <form class="update-form">
                        <label for="updatedAttendance">Update Attendance (subject1: attendance1, subject2: attendance2, subject3: attendance3, ...
                            ):</label>
                        <input type="text" id="updatedAttendance" name="updatedAttendance">
                        <button type="submit" class="update-button" data-id="${student.student_id}" data-type="attendance">Update</button>
                    </form>
                </div>
            `;

            studentDataDiv.appendChild(studentDiv);
        });

        const updateForms = document.querySelectorAll('.update-form');
        updateForms.forEach(form => {
            form.addEventListener('submit', handleUpdateSubmit);
        });
    }

    function handleUpdateSubmit(event) {
        event.preventDefault();
        const studentId = event.target.querySelector('.update-button').getAttribute('data-id');
        const updateType = event.target.querySelector('.update-button').getAttribute('data-type');
        const updatedValues = event.target.querySelector(`#updated${updateType.charAt(0).toUpperCase() + updateType.slice(1)}`).value;
    
        const updatedArray = updatedValues.split(',').map(value => {
            const [name, score] = value.trim().split(':');
            return { name: name.trim(), score: parseFloat(score) };
        });
    
        fetch('/updateStudent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                student_id: studentId,
                [updateType]: updatedArray
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchStudentData(document.getElementById('searchInput').value);
            } else {
                alert('Update failed. Student not found.');
            }
        })
        .catch(error => {
            console.error('Error updating student data:', error);
            alert('An error occurred during update.');
        });
    }    

    function formatSubjectsList(subjects) {
        return subjects.map(subject => `<li>${subject.name}: ${subject.score}</li>`).join('');
    }

    function calculateAverage(subjects) {
        const total = subjects.reduce((sum, subject) => sum + subject.score, 0);
        return total / subjects.length;
    }
});

