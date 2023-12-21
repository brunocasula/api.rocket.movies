const { Router } = require("express");

const usersRoutes = require("./users.routes");
const movieNotesRoutes = require("./movie.notes.routes");
const movieTagsRoutes = require("./movie.tags.routes");
const sessionRoutes = require("./sessions.routes");

const routes = Router();

routes.use("/users", usersRoutes);
routes.use("/movie.notes", movieNotesRoutes);
routes.use("/movie.tags", movieTagsRoutes);
routes.use("/sessions", sessionRoutes)

module.exports = routes;