const express = require('express');
const cors = require('cors');
const kx = require('knex');

const postgres = kx({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'test',
        database: 'blogdb'
    }
});

const  app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json('db');
});

app.post('/signin', (req, res) => {
    postgres.transaction(trx => {
        trx('users')
        .where({
            email: req.body.email
        })
        .select('*')
        .then(users => {
            const isValid = users[0].password_hash === req.body.password
            if(isValid) {
                return trx.insert({
                    email: users[0].email,
                    entry: new Date()
                })
                .into('login')
                .then(() => {
                    res.status(200).json(users[0])
                })
                .catch(err => Promise.reject(err))
            } else {
                res.status(400).json('wrong credentials');
            }
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to signin'));
});

app.post('/register', (req, res) => {
    postgres.transaction(trx => {
        trx.insert({
            name: req.body.name,
            email: req.body.email,
            password_hash: req.body.password,
            joined: new Date()
        })
        .into('users')
        .returning('*')
        .then(user => {
            return trx.insert({
                email: user[0].email,
                entry: new Date()
            })
            .into('login')
            .then(() => {
                res.status(200).json(user[0]);
            })
            .catch(err => res.status(400).json('unable to login'));
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .catch(err => res.status(400).json('unable to register'));
});

app.post('/publish', (req, res) => {
    postgres('blogs')
        .returning('*')
        .insert({
            title: req.body.title,
            body: req.body.blog,
            author: req.body.author,
            created: new Date(),
            user_id: req.body.userid
        })
        .then(data => res.status(200).json({success: true}))
        .catch(err => Promise.reject(err));
});

app.get('/blog/:id', (req, res) => {
    const {id} = req.params;
    postgres('blogs')
        .where({user_id: id})
        .then(data => res.json(data))
        .catch(err => Promise.reject(err));
});

app.get('/profile/:id', (req, res) => {
    const {id} = req.params;
    postgres.select('*')
        .from('users')
        .where({id})
        .then(data => {
            if(data[0].id) {
                return res.status(200).json(data[0])
            } else {
                return res.status(400).json('no such user');
            }
        })
        .catch(err => Promise.reject(err));
});

app.listen(3001, () => {
    console.log('server is running');
});