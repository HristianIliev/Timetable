var colors = ["accent-pink-gradient", "accent-orange-gradient", "accent-green-gradient", "accent-cyan-gradient", "accent-blue-gradient", "accent-purple-gradient"]
var nextCourseColor = 0

function loadCourses() {
    let additionalInfo = "";

    let tabTitleElement = document.getElementsByClassName("nav-item")[2].getElementsByTagName("a")[0];
    tabTitleElement.textContent = "Визуализация на програма";

    var url = new URL(window.location.href);
    console.log(window.location.href);
    var location = url.searchParams.get("location");
    if(location) {
        additionalInfo = '?location=' + location;
        console.log("Search by location:" + location);
        tabTitleElement.textContent += " на " + location;
    }else{
        var cookie = getCookie("currentlyLoggedInUserSpeciality");
        if (!cookie || cookie === '') {
            cookie = "SI";
        }
        additionalInfo = '?speciality=' + cookie;
        console.log("Search by speciality:" + cookie);
        tabTitleElement.textContent += " на " + cookie;
    }

    

    return fetch('./api/get-courses.php' + additionalInfo)
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

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
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
        newSpot.textContent = course.title;
        block.appendChild(newSpot)
    }
}

function isValidHttpUrl(string) {

    try {
        let url = new URL(string);
    } catch (_) {
    return false;  
    }

    return true;
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