const { Router } = require("express");
const UsersController = require("../controllers/users.controllers");

const usersRoutes = Router();
const usersController = new UsersController();

/* middleware */

function myMiddleware(request, response, next) {
  console.log("users middleware");

  // const { isAdmin } = request.body;

  // if (!isAdmin) {
  //   return response.json({ message: "user unauthorized" })
  // }

  next();
}


usersRoutes.post("/", myMiddleware, usersController.create);
usersRoutes.get("/", myMiddleware, usersController.index);
usersRoutes.get("/:id", myMiddleware, usersController.show);
usersRoutes.put("/:id", myMiddleware, usersController.update);
usersRoutes.delete("/:id", myMiddleware, usersController.delete);

module.exports = usersRoutes;