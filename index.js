function loadCourses() {
    document.getElementById('courses-body').innerHTML = null;

    return fetch('http://localhost/timetable/api/get-courses.php')
        .then(res => res.json())
        .then(courses => {
            courses.forEach(course => {
                renderCourse(course);
            });
        })
        .catch(err => {
            console.error(err);
        });
}

function saveCourse(course) {
    return fetch('http://localhost/timetable/api/save-course.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(course)
        })
        .then(res => {
            return res.json();
        })
        .catch(err => {
            console.error(err);
        });
}

function deleteCourse(id) {
    fetch(`http://localhost/timetable/api/delete-course.php?id=${id}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
        })
        .catch(err => {
            console.error(err);
        });
}

function getFormValue(courseForm) {
    const formElements = Array.from(courseForm.querySelectorAll('textarea, input, select'));
    return {
        title: formElements[0].value,
        description: formElements[1].value,
        day: formElements[2].value,
        startTime: formElements[3].value,
        endTime: formElements[4].value,
        dependencies: formElements[5].value
    }
}

function addDeleteBtnListener(courseId) {
    const deleteBtn = document.getElementById(`delete-btn-${courseId}`);
    deleteBtn.addEventListener('click', () => {
        const coursesBody = document.getElementById('courses-body');
        const course = document.getElementById(courseId);
        coursesBody.removeChild(course);

        deleteCourse(courseId);
    });
}

function renderCourse(course) {
    const courseId = course.id;
    const section = document.createElement('section');
    section.setAttribute('id', courseId);
    section.classList.add('course');
    section.innerHTML = `
    <ul class="grid">
        <li class="gridListItem">
            <div class="gridBox">
                <h3 class="course-title">${course.title}</h3>
                <ul class="disc-style-type">
                    <li>От ${course.startTime} ч. до ${course.endTime} ч.</li>
                    <li>Ден: ${course.day}</li>
                    <li>Описание: ${course.description}</li>
                    <li>Предпоставки: ${course.dependencies}</li>
                </ul>
                <button id="delete-btn-${courseId}" class="delete-btn">Изтрий</button>
            </div>
        </li>
    </ul>
    `;

    const courses = document.getElementById('courses-body');
    courses.appendChild(section);

    addDeleteBtnListener(courseId);
}

(function() {

    loadCourses();

    const courseForm = document.getElementById('course-form');

    courseForm.addEventListener('submit', (event) => {
        if (!courseForm.checkValidity()) {
            renderInvalidMessage();
            return;
        }

        const course = getFormValue(courseForm);

        saveCourse(course)
            .then(() => loadCourses());

        event.preventDefault();
    });

})();