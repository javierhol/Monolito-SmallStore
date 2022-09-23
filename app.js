
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3');
app.use(express.static('public'));
const db = new sqlite3.Database('./db/users.db');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'smallstore42@gmail.com',
        pass: 'wbsdqapcjqzmfgyy'
    }
});

const sessions = require('express-session');
const timeExp = 1000 * 60 * 60 * 24;
app.use(sessions({
  secret: 'rg34277262gvgcvdvhj',
  saveUninitialized: true,
  cookie: { maxAge: timeExp},
  resave: false
}))
let turnos = 0;
const port = 3000
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
  res.render('principal');
})
app.post('/registro', (req, res) => {
let name = req.body.name;
let email = req.body.email;
let password = req.body.password;
let pin = req.body.pin;
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const hash = bcrypt.hashSync(password, salt);
db.run(`INSERT INTO admin(name,email,password,pin) VALUES(?, ?, ?,?)`, 
  [name,email,hash,pin],
  function(error){
      if (!error){
        console.log("Insert OK");
      }else{
        console.log("Insert error:", error.code);
        if (error.code == 'SQLITE_CONSTRAINT') {
          return res.send('El usuario ya existe')
          
        }
        return res.send('Ocurrio  un error desconocido')
      }
  }
  
)
res.render('registrook', {name: name, email: email,password: hash});
})
app.get('/login', (req, res) => {
  res.render('login');
  })
  app.get('/index', (req, res) => {
    res.render('index');
    })
app.post('/logicalogin', (req, res) => {
let email = req.body.email;
let password = req.body.password;
db.get("SELECT password FROM admin WHERE email=$email" , {
  $email: email
}, (error, row) => {
  if (error) {
    return res.send('Ha ocurrido un error desconocido')
  }
  if(row){
    if (bcrypt.compareSync(password, row.password)){
      session = req.session;
      session.userid = email;
      console.log(888888);
        //consultar db para cambiar imagen de fondo
       return  res.render('adminTurnos',{turno: turnos}); 
        
    }
    return res.render("incorrecta");
  }
  
  return res.send("El usuario no existe");
  });
})
app.get('/update', (req, res) => {
  res.send(String(turnos));
  })


app.get('/adminTurn', (req, res) => {
  res.render('adminTurnos',{turno: turnos});
  })
app.get('/users', (req, res) => {
  res.render('user');
})
 app.post('/userTurno', (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  turnos++;
  console.log("turnos  ", turnos);
  transporter.sendMail({
    from: 'smallstore42@gmail.com',
    to: `${email}`,
    subject: 'Test Email Subject',
    html: `<h1>Hola! ${name}, tu turno es el ${turnos}</h1>`
  }).then((res) => {console.log(res);}).catch((err) => {console.log(err);})
  return res.render('turno',{turno: turnos});
})
app.get('/turnos', (req, res) => {
  res.render('turno');
}) 
app.listen(port, () => {
console.log(`Example app listening on port ${port}`)
})