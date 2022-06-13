var colors = ["accent-pink-gradient", "accent-orange-gradient", "accent-green-gradient", "accent-cyan-gradient", "accent-blue-gradient", "accent-purple-gradient"]
var nextCourseColor = 0

function loadCourses() {
    return fetch('./api/get-courses.php')
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

let coursesColors = new Map();

function fillTimetable(course) {
    var color;
    if (coursesColors.has(course.title)) {
        color = coursesColors.get(course.title);
    } else {
        color = getColor();
        coursesColors.set(course.title, color);
    }

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

function getColor() {
    var color = colors[nextCourseColor];
    nextCourseColor = (nextCourseColor + 1) % 6;
    return color;
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