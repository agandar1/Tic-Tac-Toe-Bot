function draw_line(canvas, coords, color) {
    /// Draw a line on the canvas
    /// used to draw the board and the winner line
    canvas.lineWidth = 10;
    canvas.beginPath();
    canvas.strokeStyle = color;
    canvas.moveTo(coords[0][0], coords[0][1]);
    canvas.lineTo(coords[1][0], coords[1][1]);
    canvas.stroke();
}

function draw_x(canvas, x, y) {
    /// Draw an X for player 1's pieces
    canvas.lineWidth = 20;
    x = 180 + (270 * x)
    y = 180 + (270 * y)
    canvas.beginPath();
    canvas.strokeStyle = "#7cafc2";
    canvas.moveTo(x - 80, y - 80);
    canvas.lineTo(x + 80, y + 80);
    canvas.stroke();
    canvas.moveTo(x + 80, y - 80);
    canvas.lineTo(x - 80, y + 80);
    canvas.stroke();
}

function draw_o(canvas, x, y) {
    /// Draw an O for player 2's pieces
    canvas.lineWidth = 20;
    x = 180 + (270 * x)
    y = 180 + (270 * y)
    canvas.beginPath();
    canvas.strokeStyle = "#f7ca88";
    canvas.arc(x, y, 80, 0, 2 * Math.PI);
    canvas.stroke()   
}

function draw_board(canvas, board, win) {
    /// Draw the tic tac toe board and any pieces on it 
    /// and a red line if someone won
    const verti = [[[315, 50], [315, 850]], [[585, 50], [585, 850]]]
    const horiz = verti.map(l => l.map(c => [c[1], c[0]]));

    verti.forEach(l => draw_line(canvas, l, "#585858"));
    horiz.forEach(l => draw_line(canvas, l, "#585858"));
    board.forEach((_, i) => board[i].forEach((_, j) => {
        board[i][j] == 1 ? draw_x(canvas, j, i) : board[i][j] == 10 ? draw_o(canvas, j, i) : null;
    }));
    
    // If someone won, draw the red line(s) 
    win.forEach(w => {
        if (w.type == 'row')
            draw_line(canvas, [[50, 180+(270*w.index)], [850, 180+(270*w.index)]], "#ab4642");
        if (w.type == 'col')
            draw_line(canvas, [[180+(270*w.index), 50], [180+(270*w.index), 850]], "#ab4642");
        if (w.type == 'diag1')
            draw_line(canvas, [[50, 50], [850, 850]], "#ab4642");
        if (w.type == 'diag2')
            draw_line(canvas, [[850, 50], [50, 850]], "#ab4642");
    });
}

function check_win(board) {
    /// Check if someone won
    const win = [30, 3];
    let winner = [];
    let spots = [];

    board.forEach((row, i) => {
        const rscore = row.reduce((x, y) => x+y);
        const cscore = board.map(r => r[i]).reduce((x, y) => x+y);
        winner = win.includes(rscore) ? [...winner, {'type': 'row', 'index': i}] : winner;
        winner = win.includes(cscore) ? [...winner, {'type': 'col', 'index': i}] : winner;
        row.forEach((spot) => spots.push(spot));
    });

    const diag1 = board[0][0] + board[1][1] + board[2][2];
    const diag2 = board[2][0] + board[1][1] + board[0][2];
    winner = win.includes(diag1) ? [...winner, {'type': 'diag1', 'index': 0}] : winner;
    winner = win.includes(diag2) ? [...winner, {'type': 'diag2', 'index': 2}] : winner;
    winner = spots.every(Boolean) ? [...winner, {'type': 'full', 'index': 0}] : winner;

    return winner;
}

function new_game(human_first) {
    /// create a new game state 
    return {
        'board': new Array(3).fill(0).map(() => new Array(3).fill(0)),
        'human': human_first ? 1 : 10,
        'turn': 1,
        'game_over': false,
        'win': []
    };
}

function make_move(state, spot) {
    /// update the state of the game
    // use JSON to make a copy of the state (we don't want reference)
    // some browsers still don't support structuredCopy
    const new_state = JSON.parse(JSON.stringify(state));
    new_state.board[spot[0]][spot[1]] = new_state.turn;
    new_state.win = check_win(new_state.board)
    return {
        'board': new_state.board,
        'human': new_state.human,
        'turn': new_state.turn == 1 ? 10 : 1,
        'game_over': new_state.win.length == 0 ? false : true,
        'win': new_state.win
    };
}

function empty_spots(board) {
    spots = [];
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            if (board[i][j] == 0)
                spots.push([i, j]);
    return spots;
}

function win_or_block (board, ai) {
    // scores each player needs for 2 in a row
    const ai_win = ai * 2;
    const human_win = ai == 1 ? 20 : 2;
    // lists of possible winning moves
    let ai_2s = [];
    let human_2s = [];

    board.forEach((row, i) => {
        const col = board.map(r => r[i]);
        const rscore = row.reduce((x, y) => x+y);
        const cscore = col.reduce((x, y) => x+y);
        if (rscore == ai_win)
            ai_2s.push([i, row.indexOf(0)]);
        if (cscore == ai_win)
            ai_2s.push([col.indexOf(0), i]);
        if (rscore == human_win)
            human_2s.push([i, row.indexOf(0)]);
        if (cscore == human_win)
            human_2s.push([col.indexOf(0), i]);
    });

    diag1_coords = [[0, 0], [1, 1], [2, 2]];
    diag2_coords = [[2, 0], [1, 1], [0, 2]];
    const diag1 = board[0][0] + board[1][1] + board[2][2];
    const diag2 = board[2][0] + board[1][1] + board[0][2];
    console.log("diag1:", diag1);
    console.log("diag2:", diag2);
    if (diag1 == ai_win) 
        for (const x of diag1_coords) 
            if (board[x[0]][x[1]] == 0)
                ai_2s.push(x);
    if (diag2 == ai_win) 
        for (const x of diag2_coords) 
            if (board[x[0]][x[1]] == 0)
                ai_2s.push(x);
    if (diag1 == human_win) 
        for (const x of diag1_coords) 
            if (board[x[0]][x[1]] == 0)
                human_2s.push(x);
    if (diag2 == human_win) 
        for (const x of diag2_coords) 
            if (board[x[0]][x[1]] == 0)
                human_2s.push(x);
    
    return ai_2s.length > 0 ? ai_2s[0] : human_2s.length > 0 ? human_2s[0] : false;
}

function random_move(board) {
    /// choose a move at random, make sure it's open on the board
    do {
        x = Math.floor(Math.random() * 3);
        y = Math.floor(Math.random() * 3);
    } while (board[x][y] != 0);
    return [x, y];
}

function ai_move(state) {
    /// choose the best move for the ai
    return win_or_block(state.board, state.human == 1 ? 10 : 1)
        || random_move(state.board);
}

(() => {
    /// Get the needed DOM elements and start the game
    const canvas = document.getElementById("myCanvas");
    const playFirst = document.getElementById("playFirst");
    const playSecond = document.getElementById("playSecond");
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    let state = new_game(true);
    draw_board(context, state.board, state.win);

    playFirst.onclick = () => {
        // Start a new game with the player going first
        context.clearRect(0, 0, canvas.width, canvas.height);
        state = new_game(true);
        draw_board(context, state.board, state.win);
    }

    playSecond.onclick = () => {
        // Start a new game with the AI going first
        context.clearRect(0, 0, canvas.width, canvas.height);
        state = new_game(false);
        state = make_move(state, ai_move(state));
        draw_board(context, state.board, state.win);
    }

    canvas.onclick = (e) => {
        // get the mouse position
        x = e.clientX - rect.left
        y = e.clientY - rect.top
        // check that the click is in bounds
        if (x >= 50 && x <= 850 && y >= 50 && y <= 850) {
            // convert mouse position to array indexes
            c = x <= 310 ? 0 : x <= 580 ? 1 : 2;
            r = y <= 310 ? 0 : y <= 580 ? 1 : 2;
            // if the spot is empty and the game is ongoing, play there
            if (state.board[r][c] == 0 && !state.game_over){
                state = make_move(state, [r, c]);
                draw_board(context, state.board, state.win);
                // if the player didn't win, let the ai take a tun
                if (!state.game_over) {
                    state = make_move(state, ai_move(state));
                    draw_board(context, state.board, state.win);
                }
            }
        }
    };
})();
