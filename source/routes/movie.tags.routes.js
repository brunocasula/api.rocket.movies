const { Router } = require('express');
const MovieTagsController = require('../controllers/movie.tags.controller');

const movieTagsRouter = Router();
const movieTagsController = new MovieTagsController();

/* middleware */
const ensureAuthenticated = require("../middleware/ensureAuthenticated");

function myMiddleware(request, response, next) {
  console.log("movie.notes middleware");

  next();
}

movieTagsRouter.use(ensureAuthenticated);

movieTagsRouter.post("/", myMiddleware, movieTagsController.create);
movieTagsRouter.get("/", myMiddleware, movieTagsController.index);
movieTagsRouter.get("/:id", myMiddleware, movieTagsController.show);
movieTagsRouter.put("/:id", myMiddleware, movieTagsController.update);
movieTagsRouter.delete("/:id", myMiddleware, movieTagsController.delete);

module.exports = movieTagsRouter;