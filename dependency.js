window.addEventListener('load', start());

var canvas;

var offset = 4;
var pixelsPerLetter = 14;
var tabHeight = 25;
var defaultBackgroundColor = "grey";
var defaultColor = "black";
var defaultFont = "20px Arial";

var coursesArray;
var coursesArrayBuffer;

// Topological sorting Start
function topologicalSortHelper(node, explored, s, group) {
   explored.add(node);
   // Marks this node as visited and goes on to the nodes
   // that are dependent on this node, the edge is node ----> n
   coursesArray[node].links.forEach(childNode => {
      if (!explored.has(childNode)) {
         topologicalSortHelper(childNode, explored, s);
      }
   });
   // All dependencies are resolved for this node, we can now add
   // This to the stack.
   s.push(node);
}

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
// Topological sorting End

function sortGroup(group) {
    let reverseStack = topologicalSort(group);
    while(reverseStack.length) {
        coursesArrayBuffer[coursesArrayBuffer.length] = coursesArray[reverseStack.pop()];
    }
}

function mark(markers, markedCourses, currentId, groupId) {
    if(markedCourses.has(currentId))
        return;
    markedCourses.add(currentId);
    markers[currentId] = groupId;
    for(let i = 0; i < coursesArray[currentId].links.length; i++) {
        mark(markers, markedCourses, coursesArray[currentId].links[i], groupId);
    }
    for(let i = 0; i < coursesArray[currentId].backLinks.length; i++) {
        mark(markers, markedCourses, coursesArray[currentId].backLinks[i], groupId);
    }
}

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

function findIdOfCourse(name) {
    for(let i = 0; i < coursesArray.length; i++) {
        if(coursesArray[i].name == name) {
            return coursesArray[i].id;
        }
    }
    return -1;
}

function createLinkFromString(dependenciesString, parentId) {
    let dependencies = dependenciesString.split(";");
    for(let i = 0; i < dependencies.length; i++) {
        let childId = findIdOfCourse(dependencies[i]);
        if(childId != -1) {
            coursesArray[parentId].links[coursesArray[parentId].links.length] = childId;
            coursesArray[childId].backLinks[coursesArray[childId].backLinks.length] = parentId;
        }
    }
}

function start() {
    coursesArray = new Array();
    fetch('http://localhost/timetable/api/get-courses.php')
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

function init() {
    splitGraphs();

    let canvasElement = document.getElementById('drawingCanvas');
    canvasElement.width = 700;
    canvasElement.height = coursesArray.length * (tabHeight + 5 * offset) + tabHeight * 2;

    canvas = canvasElement.getContext("2d");
    drawConnectedCourseTabs(); 
}

function findCoursePlaceFromId(id) {
    let place = 0;
    for(let i = 0; i < coursesArray.length; i++) {
        if(coursesArray[i].id == id) {
            return i
        }
    }
    return -1;
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
            let placeOfDependantCourse = findCoursePlaceFromId(coursesArray[i].links[j]);
            let yPosBeg = yBeginning + (i - 1) * (tabHeight + offset * 5) + tabHeight * 1.5;
            let yPosEnd = yBeginning + (placeOfDependantCourse - 1) * (tabHeight + offset * 5) + tabHeight * 1.4;
            let xPos;
            if(leftLink) {
                xPos = xBeginning + offset;
            } else {
                xPos = xBeginning - offset + tabWidth;
            }
            drawLink(xPos, yPosBeg, yPosEnd, leftLink, bgColor);
            leftLink = !leftLink;
        }
        drawCourceTab(xBeginning, yBeginning + i * (tabHeight + offset * 5), coursesArray[i].name, tabWidth, bgColor);
    }
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

function drawLink(xPos, yPosBeg, yPosEnd, isLeft, color) {
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
    canvas.stroke()
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
    let maxVal = 0x444444;
    let randomNumber = Math.random() * maxVal; 
    randomNumber = Math.floor(randomNumber) + 0xAAAAAB;
    randomNumber = randomNumber.toString(16);
    let randColor = randomNumber.padStart(6, 0);   
    return `#${randColor.toUpperCase()}`
}