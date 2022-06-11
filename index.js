function loadCourses() {
    document.getElementById('courses-body').innerHTML = null;

    return fetch('http://localhost/timetable/api/get-courses.php')
        .then(res => res.json())
        .then(courses => {
            courses.forEach(course => {
                renderCourse(course);
            });

            addExportButtonListener(courses);
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

function addExportButtonListener(courses) {
    var exportBtn = document.getElementById("export-timetable");
    exportBtn.addEventListener('click', () => {
        var file = new Blob([JSON.stringify(courses)], { type: "txt" });
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = "timetable";
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    });
}

function addImportButtonListener() {
    document.getElementById('file-input').addEventListener('change', (event) => {
        var file = event.target.files.item(0)
        var text = file.text();

        text.then(function(result) {
            var courses = JSON.parse(result);

            for (var i = 0; i < courses.length; i++) {
                saveCourse(courses[i]);
            }
        });
    });
}

function addCreateCourseButtonListener() {
    let formElement = document.getElementById('course-form').style.visibility = 'hidden';
    document.getElementById('create-course-title').addEventListener('click', (event) => {
        let formElement = document.getElementById('course-form');
        let buttonElement = document.getElementById('create-course-title');
        
        if (formElement.style.visibility == 'hidden') {
            buttonElement.innerHTML = 'Скрий форма за създаване на курс';
            formElement.style.visibility = 'visible';
        } else {
            formElement.style.visibility = 'hidden';
            buttonElement.innerHTML = 'Покажи форма за създаване на курс';
        }
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

    addImportButtonListener();

    addCreateCourseButtonListener();

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
