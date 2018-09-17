const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const zcxvbn = require('zxcvbn')
const User = require("../models/User")

router.get('/',(req,res,next)=>{
  const password = 'perla123'
  const salt = bcrypt.genSaltSync(10)
  const hash = bcrypt.hashSync(password,salt)
  res.send(hash)
})

//Signup routes
router.get('/signup',(req,res,next)=>{
  res.render('auth/signup')
})

router.post('/signup',(req,res,next)=>{
  const {password,password2,username} = req.body

  console.log(zcxvbn(password))
  if(password !== password2) return res.render('auth/signup',{error:"Los passwords no coinciden",userinput:req.body})
  if(zcxvbn(password).score<=1) return res.render('auth/signup',zcxvbn(password).feedback)
  
  const salt=bcrypt.genSaltSync(10)
  const hash=bcrypt.hashSync(password,salt)
  
  //User.create(req.body) //lo que viene en req.boy y que coincida con el modelo User se crea
  User.create({username:username,password:hash})

  .then(user=>{
    res.send(user) //muestra en la pantalla el objeto creado
  }).catch(e=>{
    res.render('auth/signup',{error:e,userinput:req.body})
    next(e)
  })
  /*
  if(User.findOne(username))
  return res.render('auth/signup',{error:"El usuario ya existe"})*/
})

router.get('/login',(req,res,next)=>{
  res.render('auth/login')
})

router.post('/login',(req,res,next)=>{
  const {username,password}=req.body
  User.findOne({username:username})
  .then(user=>{
    if(!user) return res.render('auth/login',{error: 'Este user no existe'})
    if(bcrypt.compareSync(password,user.password)){ //recibe 2 parametros: el texto que manda el usuario y la contraseña que le pertenece en la bd
      req.session.currentUser = user
      res.render('auth/profile',user)
    }else{
      res.render('auth/login',{error:"Contraseña incorrecta"})
    }
  })
})

module.exports = router