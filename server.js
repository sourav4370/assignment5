/********************************************************************************* 
 * * WEB700 – Assignment 05 * I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
 * * of this assignment has been copied manually or electronically from any other source 
 * * (including 3rd party web sites) or distributed to other students. * 
 * * Name: Md Sourav Joarder Student ID: 134363225 Date: 26-07-2023 * 
 * ********************************************************************************/
const express = require("express");
const exphbs = require('express-handlebars');
const path = require("path");
const collegeData = require("./modules/collegeData");
const bodyParser = require("body-parser");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware to set the activeRoute variable
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = '/' + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, '') : route.replace(/\/(.*)/, ''));
  next();
});

// Handlebars setup with custom helpers
const hbs = exphbs.create({
  helpers: {
    navLink: function (url, options) {
      return `<li${url == app.locals.activeRoute ? ' class="nav-item active"' : ' class="nav-item"'}><a class="nav-link" href="${url}">${options.fn(this)}</a></li>`;
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3) throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    },
  },
});
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

// Set the views directory
app.set("views", path.join(__dirname, "views"));

// Middleware to parse incoming requests with urlencoded payloads
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname)));

// Routes
app.get("/", (req, res) => {
  res.render("home"); // Renders the "home.hbs" template using the default layout "main"
});

app.get("/about", (req, res) => {
  res.render("about"); // Renders the "about.hbs" view using the default layout "main"
});

app.get("/htmlDemo", (req, res) => {
  res.render("htmlDemo"); // Renders the "htmlDemo.hbs" view using the default layout "main"
});

app.get("/students/add", (req, res) => {
  res.render("addStudent"); // Renders the "addStudent.hbs" view using the default layout "main"
});

app.get("/students", (req, res) => {
  collegeData
    .getAllStudents()
    .then((students) => {
      res.render("students", { students }); // Renders the "students.hbs" view and passes the students data
    })
    .catch((err) => {
      res.render("students", { message: "No results found." }); // Renders the "students.hbs" view with a message if there are no students
    });
});

app.get("/courses", (req, res) => {
  collegeData
    .getCourses()
    .then((courses) => {
      res.render("courses", { courses });
    })
    .catch((err) => {
      res.render("courses", { message: "No courses found." });
    });
});

app.get("/course/:id", (req, res) => {
  const courseId = parseInt(req.params.id);
  collegeData
    .getCourseById(courseId)
    .then((course) => {
      res.render("course", { course });
    })
    .catch((err) => {
      res.status(404).send("Course not found");
    });
});

app.get("/student/:studentNum", (req, res) => {
  const studentNum = parseInt(req.params.studentNum);
  collegeData
    .getStudentByNum(studentNum)
    .then((student) => {
      res.render("student", { student });
    })
    .catch((err) => {
      res.status(404).send("Student not found");
    });
});

// Parse request body
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/student/update", (req, res) => {
  const studentData = req.body;
  if (!studentData.studentNum) {
    return res.status(400).send("Invalid student number.");
  }

  collegeData
    .updateStudent(studentData)
    .then(() => {
      res.redirect("/students");
    })
    .catch((err) => {
      console.error("Error updating student:", err);
      res.status(500).send("Error updating student");
    });
});

// Start the server
collegeData
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("Server listening on port: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.error("Error initializing data:", err);
  });
