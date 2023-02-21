exports.up = knex => knex.schema.createTable('average_ratings', table => {
    table.increments('id')

    table.integer('rating').notNullable()

    table.integer('album_id').references('id').inTable('albums').onDelete('CASCADE')

    table.timestamp('updated_at').default(knex.fn.now())
})


exports.down = knex => knex.schema.dropTable('average_ratings')