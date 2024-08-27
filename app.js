const http = require("http");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv").config();
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;
dbConnect();
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

const authRouter = require("./routes/userRoute");
const DepartementRouter= require("./routes/departementRoute")
const teacherRouter= require("./routes/teacherRoute")
const timetableRoute= require("./routes/timetableRoute")
const roomRoute = require("./routes/roomRoute")
const groupRoutes = require("./routes/groupe");
const matieresRoutes = require("./routes/matiere");
const emploiDateRoutes = require("./routes/emploiDate");
const statRoutes = require("./routes/statsController");
app.use("/api/statistics",statRoutes );

 app.use("/api/user", authRouter);
app.use("/api/departement",DepartementRouter );
app.use("/api/teacher",teacherRouter );
app.use("/api/timetable",timetableRoute );
app.use("/api/rooms",roomRoute );
app.use("/api/groups", groupRoutes);
app.use("/api/matiere", matieresRoutes);
app.use("/api/date-emplois", emploiDateRoutes);

 
app.use(notFound);
app.use(errorHandler);
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
