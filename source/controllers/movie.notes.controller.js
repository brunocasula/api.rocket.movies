const sqliteConnection = require("../database/sqlite");
const knex = require("../database/knex");
const AppError = require("../utils/app.error");

class MovieNotesController {

  async create(request, response) {
    const user_id = request.user.id;
    const { title, description, rating, tags } = request.body;

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

    // await database.run(`
    //   INSERT INTO movie_notes 
    //     (title, description, rating, user_id)
    //   VALUES
    //     ((?), (?), (?), (?))`,
    //   [title, description, rating, user_id]
    // );

    const [notesInsert] = await knex("movie_notes").insert({
      title,
      description,
      rating,
      user_id
    });

    console.log(tags)

    if (tags.length > 0) {

      const tagsInsert = tags.map(name => {
        return {
          note_id: notesInsert,
          name,
          user_id
        }
      })

      await knex("movie_tags").insert(tagsInsert);
    }

    return response.status(201).json();

  }

  async delete(request, response) {
    const id = request.params;

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
    const user_id = request.user.id;

    const { id, title } = request.query;

    let notes;

    if (id) {
      notes = await knex("movie_notes")
        .select(["movie_notes.*", "users.name AS user_name"])
        .innerJoin("users", "movie_notes.user_id", "users.id")
        .where({ id });
    }
    else if (title) {
      notes = await knex("movie_notes")
        .select(["movie_notes.*", "users.name AS user_name"])
        .innerJoin("users", "movie_notes.user_id", "users.id")
        .where("movie_notes.user_id", user_id)
        .andWhereLike("title", `%${title}%`)
        .orderBy("title");
    }
    else {
      notes = await knex("movie_notes")
        .select(["movie_notes.*", "users.name AS user_name"])
        .innerJoin("users", "movie_notes.user_id", "users.id")
        // .innerJoin("movie_tags", "movie_notes.id", "movie_tags.note_id")
        //.where({ user_id })
        .where("movie_notes.user_id", user_id)
        .orderBy("title");
    }

    const userTags = await knex("movie_tags")
      .where({ user_id })

    const notesWithTags = notes.map(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id)

      return {
        ...note,
        tags: noteTags
      }

    })

    return response.json(notesWithTags);
  }

  async show(request, response) {
    const { id } = request.params
    console.log('show');

    const movieNotes = await knex("movie_notes")
      .select(["movie_notes.*", "users.name AS user_name"])
      .innerJoin("users", "movie_notes.user_id", "users.id")
      .where("movie_notes.id", id).first();

    const movieTags = await knex("movie_tags").where({ note_id: id }).orderBy("name");

    return response.json({
      ...movieNotes,
      tags: movieTags
    })
  }

}

module.exports = MovieNotesController;