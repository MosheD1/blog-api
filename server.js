const express = require('express');
const cors = require('cors');

const  app = express();
app.use(cors());
app.use(express.json());

const db = {
    users: [
        {
            id: '1',
            name: 'gerald',
            email: 'gerald@gmail.com',
            password: '123',
            joined: new Date()
        }
    ]
};


app.get('/', (req, res) => {
    res.json(db);
});

app.post('/signin', (req, res) => {
    if(db.users.some(user => {
        return user.email == req.body.email && user.password == req.password;
    })) {
        var user = db.users.find(user => user.email === req.body.email);
        res.status(200).json(user);
    } else {
        res.status(400).send({ error: 'email or passward is wrong'});
    }
});

app.post('/register', (req, res) => {
    db.users.push({
        id: '1',
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        joined: new Date()
    });
    console.log(db.users[db.users.length - 1]);
    res.status(200).json(db.users[db.users.length - 1]);
});

app.post('/publish', (req, res) => {
    
});

app.get('/blog', (req, res) => {
    
});

app.get('/profile/:id', () => {

});

app.listen(3001, () => {
    console.log('server is running');
});