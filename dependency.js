window.addEventListener('load', () => {
    
    changeColorMode();
    createColors();
    document.getElementById("color-change-btn").addEventListener('click', changeColorMode);
    start();
});

// load ->
//       start ->
//              createLinkFromString ->
//                      findIdOfCourse
//              init ->
//                      splitGraphs ->
//                              mark
//                              sortGroup ->
//                                      topologicalSort ->
//                                              topologicalSortHelper
//                      drawConnectedCourseTabs ->
//                              findTabWidth
//                              generateRandomColor
//                              findCOursePlaceFromId
//                              drawLink
//                              drawCourseTab

var canvas;

var offset = 4;
var pixelsPerLetter = 14;
var tabHeight = 25;
var defaultBackgroundColor = "grey";
var defaultColor = "black";
var defaultFont = "20px Arial";

var coursesArray;
var coursesArrayBuffer;

/// Gathers the courses names and dependacies from the data base and initializes their visualisation 
function start() {

    coursesArray = new Array();
    var cookie = getCookie("currentlyLoggedInUserSpeciality");
    if (!cookie || cookie === '') {
        cookie = "SI";
    }
    let tabTitleElement = document.getElementsByClassName("nav-item")[3].getElementsByTagName("a")[0];
    tabTitleElement.textContent = "Визуализация на зависимости на " + cookie;

    fetch('./api/get-courses.php?speciality=' + cookie)
        .then(res => res.json())
        .then(courses => {
            // Courses names
            let iter = 0;
            courses.forEach(course => {
                coursesArray[iter] = new Object();
                coursesArray[iter].id = iter;
                coursesArray[iter].name = course.title;
                coursesArray[iter].links = new Array();
                coursesArray[iter].backLinks = new Array();
                iter++;
            });

            // Courses links
            iter = 0;
            courses.forEach(course => {

                createLinkFromString(course.dependencies, iter);
                iter++;
            });

            init();
        });
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

/// /Add links to coursesArray.links based on the dependancies string
function createLinkFromString(dependenciesString, parentId) {
    let dependencies = dependenciesString.split(";");
    for(let i = 0; i < dependencies.length; i++) {
        let dependancyName = dependencies[i].split(":")[0];
        let dependancyType = dependencies[i].split(":")[1];

        let childId = findIdOfCourse(dependancyName);
        if(childId != -1) {
            let newLink = new Object();
            newLink.id = childId;
            newLink.type = dependancyType;
            coursesArray[parentId].links[coursesArray[parentId].links.length] = newLink;
            coursesArray[childId].backLinks[coursesArray[childId].backLinks.length] = parentId;
        }
    }
}

/// Return id of a course based on name
function findIdOfCourse(name) {
    for(let i = 0; i < coursesArray.length; i++) {
        if(coursesArray[i].name == name) {
            return coursesArray[i].id;
        }
    }
    return -1;
}

/// Prepares the courses and the canvas elemnt and inisializes the drawing
function init() {
    splitGraphs();

    let canvasElement = document.getElementById('drawingCanvas');
    canvasElement.width = 700;
    canvasElement.height = coursesArray.length * (tabHeight + 5 * offset) + tabHeight * 2;

    canvas = canvasElement.getContext("2d");
    drawConnectedCourseTabs(); 
}

/// Splits the courses into groups of connected courses by dependancies
/// From one big graph to a forest of connected graphs
function splitGraphs() {
    let markers = new Array();
    let markedCourses = new Set();
    for(let i = 0; i < coursesArray.length; i++) {
        mark(markers, markedCourses, i, coursesArray[i].id);
    }


    let courseGroups = new Array();
    markedCourses = new Set();
    for(let i = 0; i < coursesArray.length; i++) {
        if(!markedCourses.has(i)) {
            markedCourses.add(i);
            courseGroups[courseGroups.length] = new Array();
            courseGroups[courseGroups.length - 1][0] = coursesArray[i].id;
            for(let j = i + 1; j < coursesArray.length; j++) {
                if(!markedCourses.has(j)) {
                    if(markers[i] == markers[j]) {
                        markedCourses.add(j);
                        courseGroups[courseGroups.length - 1][courseGroups[courseGroups.length - 1].length] = coursesArray[j].id;
                    }
                }
            }
        }
    }

    coursesArrayBuffer = new Array();
    for(let i = 0; i < courseGroups.length; i++) {
        sortGroup(courseGroups[i]);
    }
    coursesArray = coursesArrayBuffer;
}

/// Helper function that is used to track if a course has already been grouped
function mark(markers, markedCourses, currentId, groupId) {
    if(markedCourses.has(currentId))
        return;
    markedCourses.add(currentId);
    markers[currentId] = groupId;
    for(let i = 0; i < coursesArray[currentId].links.length; i++) {
        mark(markers, markedCourses, coursesArray[currentId].links[i].id, groupId);
    }
    for(let i = 0; i < coursesArray[currentId].backLinks.length; i++) {
        mark(markers, markedCourses, coursesArray[currentId].backLinks[i], groupId);
    }
}

/// Calls the topological sort functions that sort the connected graph
function sortGroup(group) {
    let reverseStack = topologicalSort(group);
    while(reverseStack.length) {
        coursesArrayBuffer[coursesArrayBuffer.length] = coursesArray[reverseStack.pop()];
    }
}

/// Topological sorting is used so that the dependancies are always from the upper to the lower course in the column
/// Topological sorting Start
function topologicalSort(group) {
    // Create a Stack to keep track of all elements in sorted order
    let s = [];
    let explored = new Set();
 
    // For every unvisited node in our graph, call the helper.
    group.forEach(node => {
       if (!explored.has(node)) {
          topologicalSortHelper(node, explored, s);
       }
    });
 
    return s;
 }

function topologicalSortHelper(node, explored, s, group) {
   explored.add(node);
   // Marks this node as visited and goes on to the nodes
   // that are dependent on this node, the edge is node ----> n
   coursesArray[node].links.forEach(childNode => {
      if (!explored.has(childNode.id)) {
         topologicalSortHelper(childNode.id, explored, s);
      }
   });
   // All dependencies are resolved for this node, we can now add
   // This to the stack.
   s.push(node);
}

/// Draws the tabs of the different courses in a vertical order and connects
/// them based on their dependances
/// sortedCourses - an array of strings containing the names of the topologically sorted courses
function drawConnectedCourseTabs() {
    let tabWidth = findTabWidth();
    let xBeginning = (700 - tabWidth) /2;
    let yBeginning = 50;
    let leftLink = true;
    for(let i = 0; i < coursesArray.length; i++) {
        let bgColor = generateRandomColor();
        for(let j = 0; j < coursesArray[i].links.length; j++) {
            let placeOfDependantCourse = findCoursePlaceFromId(coursesArray[i].links[j].id);
            let yPosBeg = yBeginning + (i - 1) * (tabHeight + offset * 5) + tabHeight * 1.5;
            let yPosEnd = yBeginning + (placeOfDependantCourse - 1) * (tabHeight + offset * 5) + tabHeight * 1.4;
            let xPos;
            if(leftLink) {
                xPos = xBeginning + offset;
            } else {
                xPos = xBeginning - offset + tabWidth;
            }
            if(coursesArray[i].links[j].type == "S") {
                drawLink(xPos, yPosBeg, yPosEnd, leftLink, bgColor, "strong");
            }else{
                drawLink(xPos, yPosBeg, yPosEnd, leftLink, bgColor);
            }
            leftLink = !leftLink;
        }
        drawCourceTab(xBeginning, yBeginning + i * (tabHeight + offset * 5), coursesArray[i].name, tabWidth, bgColor);
    }
}

/// Returns the width in pixels of the rectangle background of the widest name of course
function findTabWidth() {
    let width = 0;
    for(let i = 0; i < coursesArray.length; i++) {
        if((coursesArray[i].name.length * pixelsPerLetter + offset * 2) > width) {
            width = coursesArray[i].name.length * pixelsPerLetter + offset * 2;
        }
    }
    return width;
}

function generateRandomColor(){
    if(!randomizeColors) {
        if(currentColor == 7) {
            currentColor = 0;
        } else {
            currentColor++;
        }
        return colors[currentColor];
    }
    let maxVal = 0x444444;
    let randomNumber = Math.random() * maxVal; 
    randomNumber = Math.floor(randomNumber) + 0xAAAAAB;
    randomNumber = randomNumber.toString(16);
    let randColor = randomNumber.padStart(6, 0);   
    return `#${randColor.toUpperCase()}`
}

/// Returns the place of a course in the final column by its id
function findCoursePlaceFromId(id) {
    let place = 0;
    for(let i = 0; i < coursesArray.length; i++) {
        if(coursesArray[i].id == id) {
            return i
        }
    }
    return -1;
}

/// Draw an arc in canvas connecting two courses
function drawLink(xPos, yPosBeg, yPosEnd, isLeft, color, type) {
    if(yPosBeg > yPosEnd) {
        let s = yPosEnd;
        yPosEnd = yPosBeg;
        yPosBeg = s;
    }
    canvas.strokeStyle = color;
    canvas.lineWidth = 3;
    canvas.beginPath();
    canvas.moveTo(xPos, yPosBeg);

    let yUpControlCoef = 0.8;
    let yControl2 = yPosEnd * yUpControlCoef + yPosBeg * (1 - yUpControlCoef);
    let yControl1 = yPosEnd * (1 - yUpControlCoef) + yPosBeg * yUpControlCoef;


    let xControl;
    if(isLeft) {
        xControl = xPos - (yPosEnd - yPosBeg) / 2;
    } else {
        xControl = xPos + (yPosEnd - yPosBeg) / 2;
    }

    canvas.bezierCurveTo(xControl, yControl1, xControl, yControl2, xPos, yPosEnd);
    if(type == "strong") {
        canvas.setLineDash([]);
    }else{
        canvas.setLineDash([4, 2]);
        canvas.lineDashOffset = 4;
    }

    canvas.stroke()
}

/// Prints the name of the course in all caps and a rectangular background behind it
/// xPos and yPos - the coordinates of the upper left corner
/// name - the name of the course
/// width - the maximal width in pixels that the rectangle background is supposed to have
function drawCourceTab(xPos, yPos, name, width, bgColor) {
    // Background
    canvas.fillStyle = bgColor;
    canvas.fillRect(xPos, yPos - tabHeight, width, tabHeight);

    // Text
    canvas.fillStyle = defaultColor;
    canvas.font = defaultFont;
    canvas.fillText(name.toUpperCase() , xPos + offset, yPos - offset, width - offset);
}

var colors;
var currentColor;
function createColors() {
    colors = new Array();
    colors[0] = "#eea08e";
    colors[1] = "rgb(238, 142, 188)";
    colors[2] = "#dcee8e";
    colors[3] = "#8edcee";
    colors[4] = "rgb(142, 238, 192)";
    colors[5] = "rgb(238, 192, 142)";
    colors[6] = "#a08eee";
    colors[7] = "rgb(192, 142, 238)"
    currentColor = 7;
}

var randomizeColors = false;
function changeColorMode() {
    randomizeColors = (!randomizeColors);
    if(randomizeColors) {
        document.getElementById("color-change-btn").textContent = "Цветове на предметите: случайни цветове.";
    } else {
        document.getElementById("color-change-btn").textContent = "Цветове на предметите: последователни цветове.";
    }
    currentColor = 7;
    start();
}