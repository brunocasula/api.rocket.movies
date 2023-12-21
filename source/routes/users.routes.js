const { Router } = require("express");
const UsersController = require("../controllers/users.controller");
const UserAvatarController = require("../controllers/userAvatar.controller");
/* middleware */
const ensureAuthenticated = require("../middleware/ensureAuthenticated");
const multer = require("multer");
const uploadConfig = require("../configs/upload");

const usersRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const usersController = new UsersController();
const userAvatarController = new UserAvatarController();

function myMiddleware(request, response, next) {
  console.log("users middleware");

  // const { isAdmin } = request.body;

  // if (!isAdmin) {
  //   return response.json({ message: "user unauthorized" })
  // }

  next();
}

usersRoutes.post("/", myMiddleware, usersController.create);
// usersRoutes.get("/", ensureAuthenticated, usersController.index);
usersRoutes.get("/", ensureAuthenticated, usersController.show);
usersRoutes.put("/", ensureAuthenticated, usersController.update);
usersRoutes.delete("/", ensureAuthenticated, usersController.delete);
usersRoutes.patch("/avatar", ensureAuthenticated, upload.single("avatar"), userAvatarController.update);

module.exports = usersRoutes;