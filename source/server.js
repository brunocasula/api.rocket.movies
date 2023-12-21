require("express-async-errors");

const migrationsRun = require("./database/sqlite/migrations")
const AppError = require("./utils/app.error");
const express = require("express");
const routes = require("./routes/");
const updadConfig = require("./configs/upload");
const cors = require("cors");

const app = express();
const port = 3333;

migrationsRun();

app.use("/files", express.static(updadConfig.UPLOADS_FOLDER));
app.use(cors());
app.use(express.json());
app.use(routes);

app.use((error, request, response, next) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      status: "error",
      message: error.message
    })
  }

  console.error(error);

  return response.status(500).json({
    status: "error",
    message: "Internal server error"
  })
});

app.listen(port, () => console.log(`Server is running on port ${port}`));