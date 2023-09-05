const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const app = express();






app.use(cors());

app.use(express.json());

app.use(morgan("tiny"));

const petRoutes = require("./routes/petRotues");
const categoryRoutes = require("./routes/categoryRoutes");
const adoptionRoutes = require("./routes/adoptionRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/api/pets", petRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/adoption", adoptionRoutes);
app.use("/api/users", userRoutes);

//DB_PASS=anwGqbbLdcNPBhoy

const mongodbUri = "mongodb+srv://adonisshaaban:anwGqbbLdcNPBhoy@cluster0.ziorhmy.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(mongodbUri, {
  useNewUrlParser: true,
});
``;

mongoose.connection.on("connected", () => {
  console.log("Connected to mongodb...");
});

mongoose.connection.on("error", (err) => {
  console.log("Error connecting to mongo", err);
});

app.listen(4001, () => {
  console.log("App is running on PORT 4001");
});
