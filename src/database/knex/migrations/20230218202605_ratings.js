exports.up = knex => knex.schema.createTable('ratings', table => {
    table.increments('id')

    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE')
    table.integer('album_id').references('id').inTable('albums').onDelete('CASCADE')

    table.integer('stars').notNullable()
    table.text('review').notNullable()

    table.timestamp('created_at').default(knex.fn.now())
    table.timestamp('updated_at').default(knex.fn.now())
})


exports.down = knex => knex.schema.dropTable('ratings')