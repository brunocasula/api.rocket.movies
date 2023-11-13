const { Router } = require("express");
const MovieNotesController = require("../controllers/movie.notes.controllers");

const movieNotesRoutes = Router();
const movieNotesController = new MovieNotesController();

/* middleware */

function myMiddleware(request, response, next) {
  console.log("movie.notes middleware");

  // const { isAdmin } = request.body;

  // if (!isAdmin) {
  //   return response.json({ message: "user unauthorized" })
  // }

  next();
}

movieNotesRoutes.post("/", myMiddleware, movieNotesController.create);
movieNotesRoutes.get("/", myMiddleware, movieNotesController.index);
movieNotesRoutes.get("/:id", myMiddleware, movieNotesController.show);
movieNotesRoutes.put("/:id", myMiddleware, movieNotesController.update);
movieNotesRoutes.delete("/:id", myMiddleware, movieNotesController.delete);

module.exports = movieNotesRoutes;