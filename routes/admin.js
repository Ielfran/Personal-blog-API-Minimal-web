const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const articleDir = path.join(__dirname, '..', 'article');

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password';


//Authentication Middleware
const isAuth = (req, res, next) => {
    if(req.session.isAuth) {
        return next();
    }
    res.redirect('/admin/login');
};

const getAllArticles = async () => {
    try{
        const files = await fs.readdir(articlesDir);
        const articles = [];
        for(const file of files) {
            if(path.extname(file) === '.json') {
                const content = await fs.readFile(path.join(articleDir, file), 'utf8');
                const article = JSON.parse(content);
                article.id = path.basename(file, '.json');
                articles.push(article);
            }
        }
        return articles.sort((a,b) => new Date(b.date) - new Date(a.date));
    }catch(error) {
        console.error("Error reading articles:", error);
        return [];
    }
};
//Login routes
router.get('/login', (req, res) => {
    res.render('admin/login', { pageTitle: 'Admin Login', error:null });
});

router.post('/login', (req, res) => {
    const {username, password} = req.body;
    if(username === ADMIN_USER && password === ADMIN_PASS){
        req.session.isAuth = true;
        res.redirect('/admin/dashboard');
    }else{
        res.render('admin/login', { pageTitle : 'Admin Login', error: 'Invalid credentials'});
    }
});

//logout routes
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            return res.redirect('/admin/dashboard');
        }
        res.redirect('/');
    });
});
//Dashboard
router.get('/dashboard', isAuth, async (req, res) => {
    const articles = await getAllArticles();
    res.render('admin/dashboard', {pageTitle :'Admin Dashboard', articles});
});


// Add Article Page (GET)
router.get('/add-article', isAuth, (req, res) => {
    res.render('admin/add-article', { pageTitle: 'Add New Article' });
});

// Add Article (POST)
router.post('/add-article', isAuth, async (req, res) => {
    const { title, content, date } = req.body;
    const newArticle = { title, content, date };
    const articleId = uuidv4();
    const filePath = path.join(articlesDir, `${articleId}.json`);

    await fs.writeFile(filePath, JSON.stringify(newArticle, null, 2));
    res.redirect('/admin/dashboard');
});

// Edit Article Page (GET)
router.get('/edit-article/:id', isAuth, async (req, res) => {
    const articleId = req.params.id;
    const articlePath = path.join(articlesDir, `${articleId}.json`);
    try {
        const content = await fs.readFile(articlePath, 'utf8');
        const article = JSON.parse(content);
        article.id = articleId;
        res.render('admin/edit-article', { pageTitle: 'Edit Article', article });
    } catch (error) {
        res.status(404).redirect('/admin/dashboard');
    }
});

// Edit Article (POST)
router.post('/edit-article/:id', isAuth, async (req, res) => {
    const articleId = req.params.id;
    const { title, content, date } = req.body;
    const updatedArticle = { title, content, date };
    const filePath = path.join(articlesDir, `${articleId}.json`);

    await fs.writeFile(filePath, JSON.stringify(updatedArticle, null, 2));
    res.redirect('/admin/dashboard');
});

// Delete Article (POST)
router.post('/delete-article/:id', isAuth, async (req, res) => {
    const articleId = req.params.id;
    const filePath = path.join(articlesDir, `${articleId}.json`);
    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.error("Error deleting article:", error);
    }
    res.redirect('/admin/dashboard');
});

module.exports = router;
