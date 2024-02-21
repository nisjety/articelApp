const express = require('express')
const passport = require('passport')
const router = express.Router()

//Auth with google page
//Get /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

//Google callback
//GET /auth/google/callback
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/dashboard')
  }
  )

  // logout
// /auth/logout
router.get('/logout', (req, res, next) => { 
  req.logout(function(err) {
    if (err) {
      console.error(err);
      return next(err); // 
    }
    res.redirect('/');
  });
});



module.exports = router;
