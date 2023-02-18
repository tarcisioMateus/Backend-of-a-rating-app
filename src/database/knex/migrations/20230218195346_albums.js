exports.up = knex => knex.schema.createTable('albums', table => {
    table.increments('id')

    table.text('title').notNullable()
    table.text('singer').notNullable()
    table.text('genre').notNullable()
    table.text('record_lable').notNullable()
    table.integer('release_year').notNullable()
})


exports.down = knex => knex.schema.dropTable('albums')
