const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const router = express.Router();
const articlesDir = path.join(__dirname, '..', 'articles');

const getAllArticles = async () => {
    try {
        const files = await fs.readdir(articlesDir);
        const articles = [];
        for (const file of files) {
            if (path.extname(file) === '.json') {
                const content = await fs.readFile(path.join(articlesDir, file), 'utf8');
                const article = JSON.parse(content);
                article.id = path.basename(file, '.json');
                articles.push(article);
            }
        }
        // Sort articles by date
        return articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        console.error("Error reading articles:", error);
        return []; //Return empty array on error
    }
};

// Home Page: List all articles
router.get('/', async (req, res) => {
    const articles = await getAllArticles();
    res.render('guest/home', { pageTitle: 'My Personal Blog', articles, error: null });
});

// Article Page: Display a single article
router.get('/article/:id', async (req, res) => {
    const articleId = req.params.id;
    const articlePath = path.join(articlesDir, `${articleId}.json`);

    try {
        const content = await fs.readFile(articlePath, 'utf8');
        const article = JSON.parse(content);
        res.render('guest/article', { pageTitle: article.title, article });
    } catch (error) {
        res.status(404).redirect('/');
    }
});

module.exports = router;
