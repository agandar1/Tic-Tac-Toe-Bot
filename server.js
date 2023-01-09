const express = require('express');
const session = require('express-session');
const path = require('path');
const PORT = 8080;
const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'static')));

app.use(session({secret: 'superSecret', resave: false, saveUninitialized: true}));

function new_game() {
    /// create a new game state 
    return {
        'board': new Array(9).fill(0),
        'mode': "easy",
        'human': 1,
        'ai': 10,
        'turn': 1,
        'win': [],
        'game_over': false
    };
}

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

app.get('/get_state', (req, res) => {
    let state;
    if (req.session.state)
        state = req.session.state;
    else
        state = new_game();
    res.json(state);
});

app.post('/update_state', (req, res) => {
    req.session.state = req.body;
    res.json("success");
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
