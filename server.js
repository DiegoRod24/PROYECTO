//importar paquetes
const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const path  = require('path');

//firebase admin setup
let serviceAccount = require("./ecom-website-26328-firebase-adminsdk-97lst-8058112187.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

//declarando el path
let staticPath= path.join(__dirname);

//inicializando express.js
const app = express ();

//middlewares
app.use(express.static(staticPath));
app.use(express.json());

//routes
//home 
app.get('/', (req, res)  =>{
        res.sendFile(path.join(staticPath, "index.html"));
})

//signup route
app.get('/signup', (req, res) => {
    res.sendFile(path.join(staticPath,"signup.html"));
})

app.post('/signup', (req,res) => {
    let { name, email, password, number, tac, notification } = req.body;

    //form validations
    if(name.length < 3){
        return res.json({'alert':'el nombre debe tener 3 letras como minimo'})
    } else if(!email.length){
        return res.json({'alert':'ingrese su correo'});
    } else if(password.length < 8){
        return res.json({'alert':'ingrese 8 caracteres como minimo'});
    } else if(!number.length){
        return res.json({'alert': 'Ingrese su numero de celular'});
    }/* else if(!Number(number.value) || number.value.length < 10){
        return res.json('Numero invalido, porfavor vuelve a intentarlo');
    }*/  else if(!tac){
        return res.json({'alert':'debes aceptar los terminos y condiciones'});
    }

    //almacenar usuario en db
    db.collection('users').doc(email).get()
    .then(user => {
        if(user.exists){
            return res.json({'alert':'email already exists'});
        }else{
            //cifrar la contraseña antes de almacenarla
            bcrypt.genSalt(10, (err, salt) =>{
                bcrypt.hash(password, salt, (err, hash) =>{
                    req.body.password =hash;
                    db.collection('users').doc(email).set(req.body)
                    .then(data => {
                        res.json({
                            name: req.body.name,
                            email: req.body.email,
                            seller: req.body.seller,

                        })
                    })
                })
            })
        }
    })
})
//404 route
app.get('/404', (req, res) => {
    res.sendFile(path.join(staticPath,"404.html"));
})

app.use((req,res) => {
    res.redirect('/404');
})

app.listen(3000, () => {
        console.log('listening on port 3000......');
})