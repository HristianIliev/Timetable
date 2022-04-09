var colors = ["accent-pink-gradient", "accent-orange-gradient", "accent-green-gradient", "accent-cyan-gradient", "accent-blue-gradient", "accent-purple-gradient"]

function loadCourses() {
    return fetch('http://localhost/timetable/api/get-courses.php')
        .then(res => res.json())
        .then(courses => {
            courses.forEach(course => {
                fillTimetable(course);
            });
        })
        .catch(err => {
            console.error(err);
        });
}

function fillTimetable(course) {
    var color = getRandomColor();

    var arrayOfStartTimes = getStartTimes(course.startTime.split(":")[0], course.endTime.split(":")[0]);
    for (var i = 0; i < arrayOfStartTimes.length; i++) {
        var block = document.getElementById(arrayOfStartTimes[i] + "-" + convertDayOfTheWeek(course.day));
        var newSpot = document.createElement("div");
        newSpot.classList.add(color);
        newSpot.classList.add("center-text");
        newSpot.textContent += course.title;
        block.appendChild(newSpot)
    }
}

function getStartTimes(startTime, endTime) {
    var result = [];
    for (var i = parseInt(startTime, 10); i < parseInt(endTime, 10); i++) {
        result.push(i);
    }

    return result;
}

function getRandomColor() {
    return colors[(Math.floor(Math.random() * 6) + 1) - 1];
}

function convertDayOfTheWeek(day) {
    switch (day) {
        case 'Понеделник':
            return "monday";
        case 'Вторник':
            return "tuesday";
        case 'Сряда':
            return "wednesday";
        case 'Четвъртък':
            return "thursday";
        case 'Петък':
            return "friday";
    }
}

(function() {

    loadCourses();

})();