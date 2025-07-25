const express = require('express');
const path = require('path');
const session = require('express-session');
const fs = require('fs');


//creating the article directory
const articleDir= path.join(__dirname, 'articles');
if(!fs.existsSync(articleDir)) {
    fs.mkdirSync(articleDir);
}


const app = express();
const PORT= 3000;

//set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Middleware
app.use(express.static(path.join(__dirname, 'public'))); //serve static files
app.use(express.urlencoded({extended: true })); //parse form data


// Session middleware for admin authentication
app.use(session({
    secret: 'your-very-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } //true if using HTTPS
}));

// Routes
const guestRoutes = require('./routes/guest');
const adminRoutes = require('./routes/admin');

app.use('/', guestRoutes);
app.use('/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).render('guest/home', { 
        pageTitle: 'Page Not Found', 
        articles: [], 
        error: '404 - Page Not Found' 
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
