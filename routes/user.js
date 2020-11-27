const router = require('express').Router();

const User = require('../models/user.model');
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/signup',(req,res,next)=>{
       User.find({email:req.body.email})
         .exec()
         .then(user =>{
             if(user.length >= 1){
                    return res.status(409).json({
                        message: 'Mail already exists'
                    })
             }
             else{
                bcrypt.hash(req.body.password,10,(err,hash)=>{
                    if(err){
                        return res.status(500).json({
                            error: err
                        })
                    }
                    else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email:req.body.email,
                            role:req.body.role,
                            password:hash,
                            });
                            user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message:'User created'
                                });
                            })
                            .catch(err =>{
                                res.status(500).json({
                                    error:err
                                });
                            });
                    }
               })
             }
         })
})

router.post("/login", (req, res, next) => {
    User.find({ email: req.body.email })
      .exec()
      .then(user => {
        if (user.length < 1) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: "Auth failed"
            });
          }
          if (result) {
            const token = jwt.sign(
              {
                email: user[0].email,
                role: user[0].role,
                userId: user[0]._id
              },
              process.env.JWT_KEY,
              {
                  expiresIn: "1h"
              }
            );
            return res.status(200).json({
              message: "Auth successful",
              role: user[0].role,
              token: token
            });
          }
          res.status(401).json({
            message: "Auth failed"
          });
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  });


module.exports = router;