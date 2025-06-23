cd .\server\
npm init -y
npm install express pg pg-hstore sequelize cors dotenv
npm install -D nodemon

## package.json
изменить вот это 
"scripts": {
    "dev": "nodemon index.js"
},

