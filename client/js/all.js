class Game {
    constructor(s12) {
        this.chess = new Chess();
        this.chess.header('White', s12.w_name, 'Black', s12.b_name, 'TimeControl', s12.dur + '+' + s12.inc);

        this.startfen = this.chess.fen().split(' ')[0];

        this.top_is_black = true;
        this.game_num = s12.game_num;

        this.movetimes = [];
        this.fens = [];

        this.s12 = s12;
        
        this.current_move_index = -1;
        this.clocks = {w:null, b:null};
    }
}

var INIT_S12 = new Map();
INIT_S12.set('43', {
    w_name: 'steinitz',
    b_name: 'burden',
    dur: 5,
    inc: 0,
    game_num: '43',
    w_clock: 500,
    b_clock: 600, });
INIT_S12.set('66', {
    w_name: 'nakamura',
    b_name: 'MVL',
    dur: 5,
    inc: 0,
    game_num: '66',
    w_clock: 500,
    b_clock: 600, });

var INIT_MOVES = new Map();
INIT_MOVES.set('43', ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nf6', 'Ng5', 'd5', 'exd5', 'Na5', 'd3', 'h6', 'Nf3', 'e4', 'Qe2', 'Nxc4', 'dxc4', 'Bg4', 'h3', 'Bh5', 'g4', 'Bg6', 'Nd4', 'h5', 'g5', 'Nd7', 'h4', 'Bc5', 'Be3', 'Ne5', 'Nd2', 'O-O', 'O-O-O', 'a5', 'N2b3', 'Ba7', 'a4', 'f5', 'gxf6', 'Rxf6', 'Bg5', 'Ng4', 'Ne6', 'Rxf2', 'Qxf2', 'Qxg5+', 'hxg5', 'Nxf2', 'Nxc7', 'Rc8', 'Nb5', 'Be3+', 'Kb1', 'Bxg5', 'Rhg1', 'Nxd1', 'Rxg5', 'h4', 'Rxg6', 'h3', 'Rg3', 'Nf2', 'Rxh3', 'Nxh3', 'Nd6', 'e3', 'Kc1', 'Rf8', 'Kd1', 'Ng1', ]);
INIT_MOVES.set('66', ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Bd3', 'e5', 'Nde2', 'Be7', 'O-O', 'O-O', 'Ng3', 'Be6', 'Nd5', 'Bxd5', 'exd5', 'g6', 'c4', 'Ne8', 'Bh6', 'Ng7', 'b4', 'Nd7', 'Rc1', 'a5', 'a3', 'axb4', 'axb4', 'Ra3', 'Ne4', 'f5', 'Nc3', 'e4', 'Be2', 'Bg5', 'Bxg5', 'Qxg5', 'c5', 'Ne5', 'c6', 'Nh5', 'Bxh5', 'gxh5', 'Kh1', 'Qh4', 'Qd4', 'Ng4', 'h3', 'f4', 'Kg1', 'e3', 'hxg4', 'hxg4', 'cxb7', 'exf2+', 'Rxf2', 'g3', 'Rxf4', 'Qh2+', 'Kf1', ]);


var gamemap = new Map();


function INIT() {
    //['43'].forEach(game_num => {
    ['43','66'].forEach(game_num => {
        gamemap.set(game_num, new Game(INIT_S12.get(game_num)));

        var game = gamemap.get(game_num);

        var moves = INIT_MOVES.get(game_num);

        for (var i=0; i<moves.length; i++) {
            game.chess.move(moves[i],{sloppy:true});
            game.fens[i] = game.chess.fen().split(' ')[0];
            //game.movetimes[i] = movetimes[i];
        }

        game.current_move_index = game.chess.history().length - 1;

        renderGame(game_num);
        renderMoveList(game_num);
    });

}

function APPEND_MOVE(s12) {
    var ficsobj = { s12: s12 };
    let game_num = ficsobj.s12.game_num;;
    let game = gamemap.get(game_num);

    
    if ( 0 ) {
        console.log('qwe');
    } else {
        var new_move_index = game.chess.history().length;
        
        var move_info = game.chess.move(s12.move_note_short, {sloppy:true});
        if (move_info) {
            //game.movetimes[new_move_index] = ficsobj.s12.move_time;
            game.fens[new_move_index] = game.chess.fen().split(' ')[0];
            //game.s12 = ficsobj.s12;
            appendToMoveList(game_num, new_move_index);
            if (game.current_move_index == new_move_index - 1) {
                goToMove(game_num, new_move_index, animate=true);
            }
        }
    }

    runClock(game_num);
    //renderPlayersDOM(game_num);
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


function runClock(game_num) {
    var game = gamemap.get(game_num);
    var whose_move = ['w','b'][game.chess.history().length % 2];
    var not_whose_move = ['b','w'][game.chess.history().length % 2];
    clearInterval(game.clocks[not_whose_move]);
    game.clocks[whose_move] = setInterval( function() {
        if ( (game.top_is_black && whose_move === 'b') || (!game.top_is_black && whose_move === 'w') ) {
            $('#top_time_' + game_num).html(toMinutes(game.s12[whose_move+'_clock']));
        } else {
            $('#bottom_time_' + game_num).html(toMinutes(game.s12[whose_move+'_clock']));
        }
        game.s12[whose_move+'_clock'] -= 1;
    }, 1000);
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
    runClock(game_num);
}			


function renderMoveList(game_num) {
    $('#moves_' + game_num).empty();

    var game = gamemap.get(game_num);

    var range = [];
    for (i=0; i < game.chess.history().length; i++) { range.push(i) }
    
    range.forEach( i => {
        appendToMoveList(game_num, i);
    });

    goToMove( game_num, game.chess.history().length-1 );
}


function appendToMoveList(game_num, i, goto_move = false, animate=false) {
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
    if (goto_move) { 
        goToMove(game_num, i, animate=animate);
    }
}


function goToMove(game_num, i, animate=false) {
    var game = gamemap.get(game_num);
    $('.move_'+game_num).removeClass('highlight');
    game.current_move_index = i;
    if (i == -1) {
        game.board.position(game.startfen, animate);
    } else {
        game.board.position(game.fens[i], animate);
        $('#move_' + game_num + '_' + i).addClass('highlight');;
    }
    if (i == game.chess.history().length -1) {
        $('#moves_'+game_num).scrollTop($('#moves_'+focus_game_num).prop('scrollHeight'));
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
    game.board = new ChessBoard('board_' + game_num, {
        position: game.chess.fen(),
        onDrop : function(source, target, piece, newPos, oldPos, orientation) {
            var valid_move = game.chess.move({ from: source, to: target });
            if (!valid_move) {
                return 'snapback';
            }
            game.fens[game.chess.history().length - 1] = game.chess.fen().split(' ')[0];
            appendToMoveList(game_num, game.chess.history().length-1, goto_move=true);
            focus_game_num = game_num;
            runClock(game_num);
        },
        draggable:true
    });
}



var focus_game_num = '';

$(document).ready(function(){
    INIT();

    $(document).on('mousedown', function(e) { 
        var observe_div = $(e.target).closest('[id^=observe_]');
        if (observe_div[0]) {
            focus_game_num = observe_div.attr('id').split('_')[1];
        } else {
            focus_game_num = '';
        }
    });
    
    $(document).on('keydown', function(e) {
        if (!focus_game_num) return;

        if ( $.inArray(e.which, [37,38,39,40]) == -1 ) return;

        e.preventDefault();           
        
        var game = gamemap.get(focus_game_num);
        if (!game) return;

        if (e.which == 37) {            // left
            if (game.current_move_index > -1) {
                $('#moves_'+focus_game_num).scrollTop($('#move_'+focus_game_num+'_0').height() * Math.floor((game.current_move_index -1) / 2) - 75);
                goToMove(focus_game_num, game.current_move_index - 1);
            } else {
                $('#moves_'+focus_game_num).scrollTop(0);
            }
        } else if (e.which == 39) {     //right
            if (game.current_move_index < game.chess.history().length - 1) {
                $('#moves_'+focus_game_num).scrollTop($('#move_'+focus_game_num+'_0').height() * Math.floor((game.current_move_index -1) / 2) - 75);
                goToMove(focus_game_num, game.current_move_index + 1);
            } else {
                $('#moves_'+focus_game_num).scrollTop($('#moves_'+focus_game_num).prop('scrollHeight'));
            }
        } else if (e.which == 38) {     //up
            $('#moves_'+focus_game_num).scrollTop(0);
            goToMove(focus_game_num, -1);
        } else if (e.which == 40) {     //down
            $('#moves_'+focus_game_num).scrollTop($('#moves_'+focus_game_num).prop('scrollHeight'));
            goToMove(focus_game_num, game.chess.history().length - 1);
        }
    });

});
