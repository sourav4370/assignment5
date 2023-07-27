const fs = require('fs');

class Data {
  constructor(students, courses) {
    this.students = students;
    this.courses = courses;
  }
}

let dataCollection = null;

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/students.json', 'utf8', (err, dataFromSomeFile) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }

      fs.readFile('./data/courses.json', 'utf8', (err, courseDataFromFile) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        const studentData = JSON.parse(dataFromSomeFile);
        const courseData = JSON.parse(courseDataFromFile);
        dataCollection = new Data(studentData, courseData);
        resolve();
      });
    });
  });
}

function getAllStudents() {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.students.length > 0) {
      resolve(dataCollection.students);
    } else {
      reject("No results returned");
    }
  });
}

function getTAs() {
  return new Promise((resolve, reject) => {
    const TAs = dataCollection.students.filter(student => student.TA);
    if (TAs.length > 0) {
      resolve(TAs);
    } else {
      reject("No results returned");
    }
  });
}

function getCourses() {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.courses.length > 0) {
      resolve(dataCollection.courses);
    } else {
      reject("No results returned");
    }
  });
}

function getStudentsByCourse(course) {
  return new Promise((resolve, reject) => {
    const students = dataCollection.students.filter(student => student.course === course);

    if (students.length === 0) {
      reject("No results returned");
    } else {
      resolve(students);
    }
  });
}

function getStudentByNum(num) {
  return new Promise((resolve, reject) => {
    const student = dataCollection.students.find(student => student.studentNum === num);

    if (!student) {
      reject("No results returned");
    } else {
      resolve(student);
    }
  });
}

function addStudent(studentData) {
  return new Promise((resolve, reject) => {
    if (studentData.TA === undefined) {
      studentData.TA = false;
    } else {
      studentData.TA = true;
    }

    studentData.studentNum = dataCollection.students.length + 261;

    dataCollection.students.push(studentData);
    resolve();
  });
}

function getCourseById(id) {
  return new Promise((resolve, reject) => {
    const course = dataCollection.courses.find((course) => course.courseId === id);

    if (!course) {
      reject("Query returned 0 results");
    } else {
      resolve(course);
    }
  });
}

function updateStudent(studentData) {
  return new Promise((resolve, reject) => {
    const studentIndex = dataCollection.students.findIndex((student) => student.studentNum === studentData.studentNum);

    if (studentIndex === -1) {
      reject("Student not found");
    } else {
      dataCollection.students[studentIndex] = studentData;
      resolve();
    }
  });
}

module.exports = function () {
  return {
    initialize,
    getAllStudents,
    getTAs,
    getCourses,
    getStudentsByCourse,
    getStudentByNum,
    addStudent,
    getCourseById,
    updateStudent
  };
};
