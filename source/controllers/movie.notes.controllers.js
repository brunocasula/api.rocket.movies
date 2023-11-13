const sqliteConnection = require("../database/sqlite");
const knex = require("../database/knex");
const AppError = require("../utils/app.error");

class MovieNotesController {

  async create(request, response) {
    const { title, description, rating, user_id } = request.body;

    const database = await sqliteConnection();
    const checkExists = await database.get(`
    SELECT * 
    FROM movie_notes 
    WHERE user_id = (?)
    AND LOWER(title) = (?)`,
      [user_id, title]
    );

    if (checkExists) {
      throw new AppError("Esta nota de filme já está sem uso para este usuário!")
    }

    if ((rating <= 0) || (rating > 5)) {
      throw new AppError("A nota do do filme deve corresponder ao valor de 1 a 5!")
    }

    await database.run(`
      INSERT INTO movie_notes 
	      (title, description, rating, user_id)
      VALUES
	      ((?), (?), (?), (?))`,
      [title, description, rating, user_id]
    );

    return response.status(201).json();

  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("movie_notes").where({ id }).delete();

    return response.status(200).json();
  }

  async update(request, response) {
    const { id } = request.params;
    const { title, description, rating, user_id } = request.body;

    const database = await sqliteConnection();
    const movieNotes = await database.get(`
      SELECT * 
        FROM movie_notes 
      WHERE id = (?)`,
      [id]
    );

    if (!movieNotes) {
      throw new AppError(`Notas de filmes não encontrado!`);
    }

    movieNotes.title = title ?? movieNotes.title;
    movieNotes.description = description ?? movieNotes.description;
    movieNotes.rating = rating ?? rating.rating;
    movieNotes.user_id = user_id ?? rating.user_id;

    database.run(`
      UPDATE movie_notes
      SET
        title = :title,
        description = :description,
        rating = :rating,
        user_id = :user_id,
        updated_at = DATETIME(CURRENT_TIMESTAMP, 'localtime')
      WHERE 
        id = :id`,
      [movieNotes.title, movieNotes.description, movieNotes.rating, movieNotes.user_id, id]
    );

    return response.status(200).json();
  }

  async index(request, response) {
    const { id, title } = request.query;

    let notes;

    if (id) {
      notes = await knex("movie_notes")
        .where({ id });
    }
    else {
      notes = await knex("movie_notes")
        .whereLike("title", `%${title}%`)
        .orderBy("title");
    }

    const notesMap = notes.map(note => {

      return {
        ...note
      }

    })

    return response.json(notesMap);
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

module.exports = MovieNotesController;