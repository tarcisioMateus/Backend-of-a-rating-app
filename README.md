### Backend of a rating app

I tried to created the backend of a review app like Metacritic, where users can create and account and share their thoughts, and the ADMIN will have some tools to easily control trolls, having a history of his own actions being able to undo it late if needed.

anyone can create his own account and later Login, a basic user will be able to search for albums, read its reviews, give it a review also if want to.

to create an admin account it's required to pass the "admin_key" when SingUp:
and it's here where the funny begings, the ADMIN has a ton of tools to play with!

- can create and delete a new album.
- can analyse all activity from previous days.
- can delete ratings below a threshold or since a date.
- can delete a user with all his activity.
- have access to the history of all admins.
- if later find that made a mistake can undo what was done easily using the history.

to start the project you must run this command in the terminal:

- npm install
- npx knex migrate:latest
- npm run dev

to know what routes are available go to the src/routes, starting with the account to create a new users, then the admin to create albums, and ratings to create some ratings, when you have enough users, albums and ratings you can play with the control and later with the history.

I hope you have as much joy testing it as I have coding !!

## Tech Stack
**Server:** Node, Express, Knex, SQLite3

## Links
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/tarcisiomateus)