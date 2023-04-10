exports.up = knex => knex.schema.createTable('history', table => {
    table.increments('id')
    table.integer('user_id').references('id').inTable('users')

    table.text('type').notNullable()
    table.text('undo_id')

    table.timestamp('date_time').default(knex.fn.now())
})

exports.down = knex => knex.schema.dropTable('history')