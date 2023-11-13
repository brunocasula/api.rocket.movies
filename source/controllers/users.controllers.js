const sqliteConnection = require("../database/sqlite");
const knex = require("../database/knex");
const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/app.error");
const { json } = require("express");
// const { params } = require("../routes");

class UsersController {

  async create(request, response) {
    const { name, email, password } = request.body;

    const database = await sqliteConnection();
    const checkUserExists = await database.get(`
      SELECT * 
      FROM users 
      WHERE LOWER(email) = LOWER(?)`,
      [email]
    );

    if (checkUserExists) {
      throw new AppError("Este e-mail já está sem uso!")
    }

    const hashedPassword = await hash(password, 8);

    await database.run(`
      INSERT INTO users 
      (name, email, password) 
      VALUES 
      (?, ?, ?)`,
      [name, email, hashedPassword]
    );

    return response.status(201).json();

  }

  async delete(request, response) {
    const { id } = request.params;
    console.log(id);

    await knex("users").where({ id }).delete();

    return response.status(200).json();
  }

  async update(request, response) {
    const { id } = request.params;
    const { name, email, password, old_password } = request.body;

    const database = await sqliteConnection();
    const user = await database.get(`
      SELECT * 
      FROM users
      WHERE id = (?)`,
      [id]
    );

    if (!user) {
      throw new AppError(`Usuário não encontrado!`);
    }

    const userWithUpdatedEmail = await database.get(`
      SELECT * 
      FROM users
      WHERE email = (?)`,
      [email]
    );

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      console.log(userWithUpdatedEmail.id, id)
      throw new AppError(`Este e-mail já está em uso!`);
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (password && !old_password) {
      throw new AppError(`Você precisa informar a senha antiga para definir a nova senha!`);
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);

      if (!checkOldPassword) {
        throw new AppError(`A senha antiga não confere!`)
      }

      console.log(password)
      user.password = await hash(password, 8);
    }

    database.run(`
      UPDATE users
      SET
	      name = :name,
        email = :email,
        password = :password,
        updated_at = DATETIME(CURRENT_TIMESTAMP, 'localtime')
      WHERE 
	      id = :id`,
      [user.name, user.email, user.password, id]
    );

    response.status(200).json();
  }

  async index(request, response) {
    const { id, name } = request.query;

    let users;

    if (id) {
      console.log('id')
      users = await knex("users")
        .where({ id });
    }
    else {
      console.log('name')
      users = await knex("users")
        .whereLike("name", `%${name}%`)
        .orderBy("name");
    }

    const usersMap = users.map(user => {

      return {
        ...user
      }

    })

    return response.json(usersMap);
  }

  async show(request, response) {
    const { id } = request.params

    const users = await knex("users").select(["id", "name", "email"]).where({ id }).first();
    const movieNotes = await knex("movie_notes").select(["id", "title", "description"]).where({ user_id: id });
    const movieTags = await knex("movie_tags").select(["id", "note_id", "name"]).where({ user_id: id }).orderBy("name");

    const notesMap = movieNotes.map(note => {
      const tagsFilter = movieTags.filter(tag => tag.note_id === note.id)

      return {
        ...note,
        movie_tags: tagsFilter
      }

    })

    users.movie_notes = notesMap;

    return response.json(users);
  }
}

module.exports = UsersController;