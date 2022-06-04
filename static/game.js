//// Tic Tac Toe Program
//// With AI to play against

/// all indexes for ways to win
const _triplets_ = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // vertical
    [0, 4, 8], [2, 4, 6]            // diagonal
];

/// other useful indexes
const _corners_ = [0, 2, 6, 8];
const _edges_ = [1, 3, 5, 7];
const _outer_ = [[0, 1, 2], [0, 3, 6], [2, 5, 8], [6, 7, 8]];
const _diags_ = [[0, 4, 8], [2, 4, 6]];

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

function draw_board(canvas, state, buttons) {
    /// Draw the tic tac toe board and any pieces on it 
    /// and a red line if someone won
    const grid_color = "#585858";
    const win_color = "#ab4642";
    const verti = [[[315, 50], [315, 850]], [[585, 50], [585, 850]]]
    const horiz = verti.map(l => l.map(c => [c[1], c[0]]));

    // draw grid
    verti.forEach(l => draw_line(canvas, l, grid_color));
    horiz.forEach(l => draw_line(canvas, l, grid_color));
    // draw x's and o's
    state.board.forEach((_, i) => {
        state.board[i] == 1 ?
            draw_x(canvas, i%3, Math.floor(i/3)) : state.board[i] == 10 ?
            draw_o(canvas, i%3, Math.floor(i/3)) : null;
    });
    
    // If someone won, draw the red line(s) 
    state.win.forEach(w => {
        if (w.type == 'row')
            draw_line(canvas, [[50, 180+(270*w.index)], [850, 180+(270*w.index)]], win_color);
        if (w.type == 'col')
            draw_line(canvas, [[180+(270*w.index), 50], [180+(270*w.index), 850]], win_color);
        if (w.type == 'diag1')
            draw_line(canvas, [[50, 50], [850, 850]], win_color);
        if (w.type == 'diag2')
            draw_line(canvas, [[850, 50], [50, 850]], win_color);
    });

    // Invert the colors of the chosen options
    buttons.forEach(b =>{
        b.classList.remove('btn-white-chosen');
        if (b.id == state.mode)
            b.classList.add('btn-white-chosen');
    })
}

function sum_triplet(board, triplet) {
    /// sum up the values of a triplet
    return triplet.map((x) => board[x]).reduce((x, y) => x+y);
}

function check_win(board) {
    /// add up all the triplets
    const sums = _triplets_.map((t) => sum_triplet(board, t));
    let winners = [];

    // check if any of the horizontal or vertical ones are winners
    for (let i = 0; i < 3; i++) {
        winners = [30, 3].includes(sums[i]) ? [...winners, {'type': 'row', 'index': i}] : winners;
        winners = [30, 3].includes(sums[i+3]) ? [...winners, {'type': 'col', 'index': i}] : winners;
    }
    // check both diagonals
    winners = [30, 3].includes(sums[6]) ? [...winners, {'type': 'diag1', 'index': 0}] : winners;
    winners = [30, 3].includes(sums[7]) ? [...winners, {'type': 'diag2', 'index': 2}] : winners;
    // check if the board is full
    winners = board.every(Boolean) ? [...winners, {'type': 'full', 'index': 0}] : winners;

    return winners;
}

function new_game(human_first, mode) {
    /// create a new game state 
    return {
        'board': new Array(9).fill(0),
        'mode': mode,
        'human': human_first ? 1 : 10,
        'ai': human_first ? 10 : 1,
        'turn': 1,
        'win': [],
        'game_over': false
    };
}

function apply_move(state, spot) {
    /// update the state of the game
    const new_board = state.board.slice();
    new_board[spot] = state.turn;
    const win = check_win(new_board);
    return {
        'board': new_board,
        'mode': state.mode,
        'human': state.human,
        'ai': state.ai,
        'turn': state.turn == 1 ? 10 : 1,
        'win': win,
        'game_over': win.length == 0 ? false : true
    };
}

function find_triplet(board, target_sum, triplets = _triplets_) {
    /// find a triplet that adds up to target_sum
    return triplets.find((t) => sum_triplet(board, t) == target_sum);
}

function find_empty(board, indexes) {
    /// check a list of indexes and return an empty spot
    const empty = indexes.find((i) => board[i] == 0);
    return empty != null ? empty : -1;
}

function win_or_block(state) {
    /// if ai has 2 in a row, win.
    /// otherwise if human has 2 in a row, block
    const ai_triplet = find_triplet(state.board, state.ai*2);
    const human_triplet = find_triplet(state.board, state.human*2);
    return Boolean(ai_triplet) ?
        find_empty(state.board, ai_triplet) + 1 : Boolean(human_triplet) ?
        find_empty(state.board, human_triplet) + 1 : false;
}

function opening_moves(state) {
    /// if ai is first, play in a corner
    /// if ai is second, play in the center 
    const open = [...Array(9).keys()].filter((i) => state.board[i] == 0);
    const open_corners = _corners_.filter((i) => state.board[i] == 0);
    return open.length < 8 ? false : open_corners.length == 4 ?
        _corners_[Math.floor(Math.random()*4)] + 1 : 5;
}

function combo_plays(state) {
    /// if ai has a squeeze play, win by playing in a corner
    /// if human has a squeeze play, block by playing in an edge
    /// if ai or human has a two on one play, win or block by playing in a corner
    const human_sum = state.human + state.ai + state.human;
    const ai_sum = state.ai + state.human + state.ai;
    const ai_combo = find_triplet(state.board, ai_sum, _diags_);
    const human_combo = find_triplet(state.board, human_sum, _diags_);

    if ((state.board[0] != 0 && (state.board[0] == state.board[8]))
        || (state.board[2] != 0 && (state.board[2] == state.board[6])))
        return Boolean(ai_combo) ?
            find_empty(state.board, _corners_) + 1: Boolean(human_combo) ?
            find_empty(state.board, _edges_) + 1: false;

    return Boolean(ai_combo) || Boolean(human_combo) ?
        find_empty(state.board, _corners_) + 1: false
}

function triangle_play(state) {
    /// if the opponent goes second and doesn't play in the center,
    /// play in the right corners to make a triangle combo and guarantee a win
    const open_corners = _corners_.filter((i) => state.board[i] == 0);
    if (open_corners.length == 1)
        return open_corners[0] + 1;
    
    const triplet = find_triplet(state.board, state.ai, _outer_);
    const result = find_empty(state.board, [triplet[0], triplet[2]]) + 1;
    return result;
}

function setup_combo(state) {
    // if human doesn't play in the center, ai can try to set up a triangle play
    // otherwise ai can try to set up squeeze or two on one
    const open = [...Array(9).keys()].filter((i) => state.board[i] == 0);
    if (state.board[4] == 0)
        return triangle_play(state);
    if (open.length != 7)
        return false;

    const target_sum = state.human + state.ai
    const combo = find_triplet(state.board, target_sum, _diags_);

    return Boolean(combo) ? find_empty(state.board, combo) + 1 : false;
}

function random_move(state) {
    /// choose a move at random, make sure it's open on the board
    const open = [...Array(state.board.length).keys()].filter((i) => state.board[i] == 0);
    return open[Math.floor(Math.random()*open.length)] + 1;
}

function ai_move(state) {
    /// choose the best move for the ai depending on the difficulty
    const mode = state.mode;
    console.log(mode);
    return mode == "easy"   ? random_move(state)
        :  mode == "medium" ? win_or_block(state) || random_move(state)
        :  mode == "hard"   ? win_or_block(state) || combo_plays(state) || random_move(state)
        :  win_or_block(state)
        || opening_moves(state)
        || setup_combo(state)
        || combo_plays(state)
        || random_move(state);
}

(() => {
    /// Get the needed DOM elements and start the game
    const canvas = document.getElementById("myCanvas");
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const button_wrapper = document.getElementById("buttons");
    const buttons = [...document.getElementsByClassName("btn")];
    let state = new_game(true, "easy");
    let coord = 0;
    draw_board(context, state, buttons);

    button_wrapper.addEventListener('click', (e) => {
        /// If a button was clicked, start a new game with the new options
        if (!(e.target.nodeName === 'BUTTON'))
            return;

        const button = e.target.id
        const mode = button != "playFirst" && button != "playSecond" ? button : state.mode;
        const human_first = button == "playFirst" ? true
              : button == "playSecond" ? false
              : state.human == 1;

        context.clearRect(0, 0, canvas.width, canvas.height);
        state = new_game(human_first, mode);
        if (!human_first && mode != "twoPlayer")
            state = apply_move(state, ai_move(state)-1);

        draw_board(context, state, buttons);
    });

    canvas.onclick = (e) => {
        // get the mouse position
        x = e.clientX - rect.left
        y = e.clientY - rect.top
        // check that the click is in bounds
        if (x >= 50 && x <= 850 && y >= 50 && y <= 850) {
            // convert mouse position to array indexes
            col = x <= 310 ? 0 : x <= 580 ? 1 : 2;
            row = y <= 310 ? 0 : y <= 580 ? 1 : 2;
            coord = (row * 3) + col;
            // if the spot is empty and the game is ongoing, play there
            if (state.board[coord] == 0 && !state.game_over){
                state = apply_move(state, coord);
                draw_board(context, state, buttons);
                // if the player didn't win and the ai is playing, let the ai take a turn
                if (!state.game_over && state.mode != "twoPlayer") {
                    state = apply_move(state, ai_move(state)-1);
                    draw_board(context, state, buttons);
                }
            }
        }
    };
})();
