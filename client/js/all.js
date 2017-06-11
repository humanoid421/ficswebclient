class Game {
    constructor(s12) {
        this.chess = new Chess();
        this.chess.header('White', s12.w_name, 'Black', s12.b_name, 'TimeControl', s12.dur + '+' + s12.inc);

        this.top_is_black = true;
        this.game_num = s12.game_num;

        this.movetimes = [];
        this.fens = [];

        this.s12 = s12;
        this.last_move_highlighted = true;
        
        this.current_move_index = -1;
    }
}

var INIT_S12 = {
    w_name: 'whiteguy',
    b_name: 'blackguy',
    dur: 5,
    inc: 0,
    game_num: '43',
    w_clock: 500,
    b_clock: 600,
};

var INIT_MOVES = 
[
'e4',
'd6',
'd4',
'e6',
'Nf3',
'h6',
'Bd3',
'g6',
];


var gamemap = new Map();


function INIT() {
    var game_num = '43';
    gamemap.set(game_num, new Game(INIT_S12));


    var game = gamemap.get(game_num);

    var moves = INIT_MOVES;

    for (var i=0; i<moves.length; i++) {
        game.chess.move(moves[i]);
        //game.fens[i] = game.chess.fen();
        game.fens[i] = game.chess.fen().split(' ')[0];
        //game.movetimes[i] = movetimes[i];
    }
    renderGame(game_num);
    renderMoveList(game_num);

}

function APPEND_MOVE(s12) {
    var ficsobj = { s12: s12 };
    let game_num = '43';
    let game = gamemap.get(game_num);

    var new_move_index = game.chess.history().length;
    
    var move_info = game.chess.move(s12.move_note_short);
    if (move_info) {
        //game.movetimes[new_move_index] = ficsobj.s12.move_time;
        game.fens[new_move_index] = game.chess.fen().split(' ')[0];
        //game.s12 = ficsobj.s12;
        appendMove(game_num, new_move_index);
    }

    renderPlayersDOM(game_num);
}

// #############################################################################


function toMinutes(seconds) {
	var seconds = parseInt(seconds);
	var minutes = Math.floor(seconds / 60).toString();
	var remaining_seconds = seconds - minutes * 60;
	
	if ( remaining_seconds.toString().length == 1 ) {
		remaining_seconds = '0' + remaining_seconds.toString();
	}
	else {
		remaining_seconds = remaining_seconds.toString();
	}
	return minutes + ':' + remaining_seconds
}

function renderPlayersDOM(game_num) {
	var game = gamemap.get(game_num);
    if (game.top_is_black) {
        $('#top_player_' + game_num).html(game.chess.header().Black);
        $('#top_time_' + game_num).html(toMinutes(game.s12.b_clock));
        $('#bottom_player_' + game_num).html(game.chess.header().White);
        $('#bottom_time_' + game_num).html(toMinutes(game.s12.w_clock));
    } else {
        $('#top_player_' + game_num).html(game.chess.header().White);
        $('#top_time_' + game_num).html(toMinutes(game.s12.w_clock));
        $('#bottom_player_' + game_num).html(game.chess.header().Black);
        $('#bottom_time_' + game_num).html(toMinutes(game.s12.b_clock));
    }
}			


function renderMoveList(game_num) {
    $('#moves_' + game_num).empty();

    var game = gamemap.get(game_num);

    var range = [];
    for (i=0; i < game.chess.history().length; i++) { range.push(i) }
    
    range.forEach( i => {
        appendMove(game_num, i);
    });
}


function appendMove(game_num, i) {
    var movelist_div = $('#moves_' + game_num);
    var move_number = Math.floor(i/2) + 1;

    var game = gamemap.get(game_num);

    if (i % 2 == 0) {
        var move_num_div = $('<div class="move_number">' + move_number.toString() + '</div>');
        move_num_div.appendTo(movelist_div);
    } else {
        move_number += 1;
    }

    var move_div = $('<div class="move move_' + game_num + '">' + game.chess.history()[i] + '</div>');
    move_div.attr('id', 'move_' + game_num + '_' + i);
    move_div.on({click :function() { 
        goToMove(game_num, i);
    }});

    move_div.appendTo(movelist_div);
    if (game.last_move_highlighted) {
        $('.move_'+game_num).removeClass('highlight');
        move_div.addClass('highlight');
        game.board.position(game.fens[i]);
        game.current_move_index = i;
    }
}

function goToMove(game_num, i) {
    var game = gamemap.get(game_num);
    game.board.position(game.fens[i],false);
    game.current_move_index = i;
    $('.move_'+game_num).removeClass('highlight');
    var move_div = $('#move_' + game_num + '_' + i);
    move_div.addClass('highlight');
    if (i === game.chess.history().length - 1) { 
        game.last_move_highlighted = true;
    } else { 
        game.last_move_highlighted = false;
    }
}

function renderGame(game_num) {
    var game = gamemap.get(game_num);

    var observe_div = $('<div id="observe_' + game_num + '" class="clearfix observe"></div>');
    var top_player_div = $('<div id="top_player_' + game_num + '" class="player_name"></div>');
    var board_container_div = $('<div class="board_info_container"></div>');
    var board_div = $('<div id="board_' + game_num + '" class="board"></div>');
    var game_container_div = $('<div class="game_info_container"></div>');
    var ginfo_div = $('<div id="ginfo_' + game_num + '" class="game_info"></div>');
    var top_time_div = $('<div id="top_time_' + game_num + '" class="top_time"></div>');
    var moves_div = $('<div id="moves_' + game_num + '" class="move_list clearfix"></div>');
    var bottom_time_div = $('<div id="bottom_time_' + game_num + '" class="bottom_time"></div>');
    var controls_div = $('<div id="controls_' + game_num + '" class="controls"></div>');
    var flip_button = $('<button type="button" id="flip_' + game_num + '"> Flip </button>');
    flip_button.click(function() {
        game.top_is_black = game.top_is_black ? false : true;
        game.board.flip();
        renderPlayersDOM(game_num);
    });
    var bottom_player_div = $('<div id="bottom_player_' + game_num + '" class="player_name"></div>');

    top_player_div.appendTo(observe_div);

    board_container_div.appendTo(observe_div);
    board_div.appendTo(board_container_div);

    game_container_div.appendTo(observe_div);
    ginfo_div.appendTo(game_container_div);

    top_time_div.appendTo(ginfo_div);
    moves_div.appendTo(ginfo_div);
    bottom_time_div.appendTo(ginfo_div);

    controls_div.appendTo(game_container_div);
    flip_button.appendTo(controls_div);

    bottom_player_div.appendTo(observe_div);


    observe_div.appendTo($('#games_div'));

    renderPlayersDOM(game_num);
    game.board = new ChessBoard('board_' + game_num, {position: game.chess.fen()});
}





$(document).ready(function(){
    INIT();
    var arrows_game_num = '';

    $(document).on('click', function(e) { 
        var observe_div = $(e.target).closest('[id^=observe_]');
        if (observe_div[0]) {
            arrows_game_num = observe_div.attr('id').split('_')[1];
        } else {
            arrows_game_num = '';
        }
    });
    
    $(document).on('keydown', function(e) {
        if (!arrows_game_num) return;

        if ( $.inArray(e.which, [37,38,39,40]) == -1 ) return;

        e.preventDefault();           
        
        var game = gamemap.get(arrows_game_num);
        if (!game) return;

        if (e.which == 37) {            // left
            goToMove(arrows_game_num, game.current_move_index - 1);
        } else if (e.which == 39) {     //right
            goToMove(arrows_game_num, game.current_move_index + 1);
        } else if (e.which == 38) {     //up
            goToMove(arrows_game_num, 0);
        } else if (e.which == 40) {     //down
            goToMove(arrows_game_num, game.chess.history().length - 1);
        }
    });

});
