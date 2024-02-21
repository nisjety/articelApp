const express = require('express');
const router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const Article = require('../models/Article');
// Anta at User-modellen er importert korrekt her for å oppdatere brukerrollen
const User = require('../models/User');

// Login page

// Combined route for displaying the login page along with public articles
router.get('/', async (req, res) => {
    try {
        const articles = await Article.find({ status: 'public' })
            .sort({ createdAt: 'desc' })
            .lean();

        res.render('login', { 
            layout: 'login', 
            articles: articles
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// Dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
    try {
        const articles = await Article.find({ authorId: req.user.id }).sort({ createdAt: -1 }).lean();
        res.render('dashboard', {
            name: req.user.firstName,
            articles,
            userIsAdmin: req.user.role === 'admin'
        });
    } catch (err) {
        console.error(err);
        res.render('error/500');
    }
});

// make Admin
router.get('/upgrade-to-admin', ensureAuth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { role: 'admin' });
        req.flash('success_msg', 'Du er nå en admin.');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Noe gikk galt.');
        res.redirect('/dashboard');
    }
});

// make user Bruker
router.get('/downgrade-to-user', ensureAuth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { role: 'user' });
        req.flash('success_msg', 'Du er nå en vanlig bruker.');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Noe gikk galt.');
        res.redirect('/dashboard');
    }
});
// Eksporter routeren
module.exports = router;
