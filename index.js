function loadCourses() {
    document.getElementById('courses-body').innerHTML = null;

    var cookie = getCookie("currentlyLoggedInUserSpeciality");
    if (!cookie || cookie === '') {
        cookie = "SI";
    }

    return fetch('./api/get-courses.php?speciality=' + cookie)
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

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function saveCourse(course) {
    return fetch('./api/save-course.php', {
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
    fetch(`./api/delete-course.php?id=${id}`)
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
        teacher: formElements[1].value,
        location: formElements[2].value,
        description: formElements[3].value,
        day: formElements[4].value,
        startTime: formElements[5].value,
        endTime: formElements[6].value,
        dependencies: formElements[7].value,
        specialty: formElements[8].value
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
            buttonElement.innerHTML = '?????????? ?????????? ???? ?????????????????? ???? ????????';
            formElement.style.visibility = 'visible';
        } else {
            formElement.style.visibility = 'hidden';
            buttonElement.innerHTML = '???????????? ?????????? ???? ?????????????????? ???? ????????';
        }
    });
}

function renderCourse(course) {
    const courseId = course.id;
    const section = document.createElement('section');
    section.setAttribute('id', courseId);
    section.classList.add('course');
    let locationLink;
    if(isValidHttpUrl(course.location)) {
        locationLink = `<a href="${course.location}">${course.location}</a>`;
    }
    else {
        locationLink = `<a href="./display.html?location=${course.location}">${course.location}</a>`;
    }
    section.innerHTML = `
    <ul class="grid">
        <li class="gridListItem">
            <div class="gridBox">
                <h3 class="course-title">${course.title}</h3>
                <ul class="disc-style-type">
                    <li>???? ${course.startTime} ??. ???? ${course.endTime} ??.</li>
                    <li>??????: ${course.day}</li>
                    <li>??????????????: ${locationLink}</li>
                    <li>????????????????????????: ${course.teacher}</li>
                    <li>????????????????: ${course.description}</li>
                    <li>??????????????????????: ${course.specialty}</li>
                    <li>????????????????????????: ${course.dependencies}</li>
                </ul>
                <button id="delete-btn-${courseId}" class="delete-btn">????????????</button>
            </div>
        </li>
    </ul>
    `;

    const courses = document.getElementById('courses-body');
    courses.appendChild(section);

    addDeleteBtnListener(courseId);
}

function isValidHttpUrl(string) {

    try {
        let url = new URL(string);
    } catch (_) {
        return false;  
    }

    return true;
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