'use strict'; 

const mysql = require('mysql');
const express = require('express');
const Q = require('q');
const bodyParser = require('body-parser')

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


const mysqlHost = process.env.MYSQL_HOST || 'localhost';
const mysqlPort = process.env.MYSQL_PORT || '3306';
const mysqlUser = process.env.MYSQL_USER || 'root';
const mysqlPass = process.env.MYSQL_PASS || 'admin';
const mysqlDB   = process.env.MYSQL_DB   || 'node_db';

const connectionOptions = {
host: mysqlHost,
port: mysqlPort,
user: mysqlUser,
password: mysqlPass,
database: mysqlDB
};

console.log('MySQL Connection config:');
console.log(connectionOptions);

const connection = mysql.createConnection(connectionOptions);

connection.connect();

initializeDatabase(connection).then(() => {
   app.get('/', async (req,res) => {
      try {
         res.sendFile('views/login-get.html', {root: __dirname })
      } catch(err) {
         console.error(err);
      }
   });

   
   app.get('/users', async function(req,res){
      try {
         console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
         console.log(req.query.uname)
         console.log(req.query.psw)
         const login = `SELECT * FROM users WHERE name='${req.query.uname}' AND password='${req.query.psw}'`;
         const logged_user = await Q.npost(connection, 'query', [login]);
         console.log(logged_user[0]);

         if(logged_user[0][0] != null && logged_user[0][0].name != null) {
            const queryStr = 'SELECT * FROM users';
            const users = await Q.npost(connection, 'query', [queryStr]);
            let responseStr = 'Name      |      Surname      |      Email <br>';
            
            for(let i = 0; i < users[0].length; i++) {
               responseStr += users[0][i].name + '      |      ' + users[0][i].surname + '      |      ' + users[0][i].email + '<br>';
            }

            console.log(responseStr);
            
            res.status(200).send(responseStr);
         } else {
            res.redirect(`/?uname=${req.query.uname}&psw=${req.query.psw}`);
         }
      } catch(err) {
         console.error(err);
      }
   });

   app.get('/login-post', async (req,res) => {
      try {
         res.sendFile('views/login.html', {root: __dirname })
      } catch(err) {
         console.error(err);
      }
   });
   
   app.post('/users', async function(req,res){
      try {
         const login = `SELECT * FROM users WHERE name='${req.body.uname}' AND password='${req.body.psw}'`;
         const logged_user = await Q.npost(connection, 'query', [login]);
         console.log(logged_user[0]);

         if(logged_user[0][0] != null && logged_user[0][0].name != null) {
            const queryStr = 'SELECT * FROM users';
            const users = await Q.npost(connection, 'query', [queryStr]);
            let responseStr = 'Name      |      Surname      |      Email <br>';
            
            for(let i = 0; i < users[0].length; i++) {
               responseStr += users[0][i].name + '      |      ' + users[0][i].surname + '      |      ' + users[0][i].email + '<br>';
            }

            console.log(responseStr);
            
            res.status(200).send(responseStr);
         } else {
            res.redirect('/login-post');
         }
      } catch(err) {
         console.error(err);
      }
   });
   
   
   app.listen(port, function(){
       console.log('Sample mySQL app listening on port ' + port);
   });
}).catch((err) => {
   console.log('000000000000000000000000');
   console.log(err);
});


async function initializeDatabase(connection) {
   console.log('1');
   const droptable = "DROP TABLE IF EXISTS users";
   await connection.query(droptable);
   console.log('0');
   const createTable = "CREATE TABLE users (name VARCHAR(255), surname VARCHAR(255), password VARCHAR(255), email VARCHAR(255))";
   await connection.query(createTable);
   
   console.log('2');
   const insert1 = "INSERT INTO users VALUES ('John', 'Doe', '123456', 'johndoe@email.com')";
   await connection.query(insert1);
   
   console.log('3');
   const insert2 = "INSERT INTO users VALUES ('Patrick', 'Williams', '567890', 'patrick@email.com')";
   await connection.query(insert2);
   
   console.log('4');
   const insert3 = "INSERT INTO users VALUES ('admin', 'admin', 'Sup3Rs3CuR3p4SSW0rD', 'admin@email.com')";
   await connection.query(insert3);
}