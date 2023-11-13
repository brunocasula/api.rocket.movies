const sqliteConnection = require("../database/sqlite");
const knex = require("../database/knex");
const AppError = require("../utils/app.error");

class MovieTagsController {

  async create(request, response) {
    const { note_id, user_id, name } = request.body;

    const database = await sqliteConnection();
    const checkExists = await database.get(`
    SELECT * 
    FROM movie_tags 
    WHERE note_id = (?)
    AND user_id = (?)
    AND LOWER(name) = LOWER(?)`,
      [note_id, user_id, name]
    );

    if (checkExists) {
      throw new AppError("Esta etiqueta de filme já está sem uso para este usuário!")
    }

    await database.run(`
      INSERT INTO movie_tags
        (note_id, user_id, name)
      VALUES
	      ((?), (?), (?))`,
      [note_id, user_id, name]
    );

    return response.status(201).json();

  }

  async delete(request, response) {
    const { id } = request.params;
    console.log(id);

    await knex("movie_tags").where({ id }).delete();

    return response.status(200).json();
  }

  async update(request, response) {
    const { id } = request.params;
    const { note_id, user_id, name } = request.body;

    const database = await sqliteConnection();
    const movieTags = await database.get(`
      SELECT * 
        FROM movie_tags
      WHERE id = (?)`,
      [id]
    );

    if (!movieTags) {
      throw new AppError(`Etiqueta de filme não encontrado!`);
    }

    movieTags.note_id = note_id ?? movieTags.note_id;
    movieTags.user_id = user_id ?? movieTags.user_id;
    movieTags.name = name ?? movieTags.name;

    database.run(`
      UPDATE movie_tags
      SET
        note_id = :note_id,
        user_id = :user_id,
        name = :name
      WHERE 
        id = :id`,
      [movieTags.note_id, movieTags.user_id, movieTags.name, id]
    );

    return response.status(200).json();
  }

  async index(request, response) {
    const { id, title } = request.query;

    let tags;

    if (id) {
      tags = await knex("movie_tags")
        .where({ id });
    }
    else {
      tags = await knex("movie_tags")
        .whereLike("name", `%${title}%`)
        .orderBy("name");
    }

    const tagsMap = tags.map(tag => {

      return {
        ...tag
      }

    })

    return response.json(tagsMap);
  }

  async show(request, response) {
    const { id } = request.params
    console.log('show');

    const movieNotes = await knex("movie_notes").where({ id }).first();
    const movieTags = await knex("movie_tags").where({ note_id: id }).orderBy("name");

    return response.json({
      ...movieNotes,
      movieTags
    })
  }
}

module.exports = MovieTagsController;