
const Model=function(){console.log("Initializing Model");this.initialize_state();this.move_generator=new MoveGenerator(this);this.view=new View(this);window.model=this;};Model.prototype.each_child=function*(depth,last_src){if(depth===0){return;}
let legal_moves=this.move_generator.legal_moves();for(let i=0;i<legal_moves.length;i++){let move=legal_moves[i];if(move!=last_src){let new_last_src=this.last_uncommitted_dst();this.push_uncommitted_move(move);if(!this.is_first_piece_destination()){this.push_move();yield depth;this.pop_move();}
yield*this.each_child(depth-1,new_last_src);this.pop_uncommitted_move();}}};Model.prototype.add_to_human_move=function(dst){if(!this.is_human_turn()){alert("Its not your turn");return;}
let src=this.last_uncommitted_dst();if(this.move_generator.is_legal_piece_move(src,dst)){this.push_uncommitted_move(dst);}else if(this.is_first_piece_destination()&&this.square(dst)===this.turn()){this.pop_uncommitted_move();this.push_uncommitted_move(dst);}else{this.set_error("Not a legal move");}
this.view.draw();return;};Model.prototype.heuristic=function(maximizingPlayer){let good_side=maximizingPlayer?this.turn():this.other_team();let bad_side=maximizingPlayer?this.other_team():this.turn();if(this.winner()===good_side){return(Infinity);}
if(this.winner()===bad_side){return(-Infinity);}
let score=0;score+=this._state.square_tracker[good_side];score+=this._state.court_tracker[good_side];score-=this._state.square_tracker[bad_side]*1.5;score-=this._state.court_tracker[bad_side]*1.25;return(score);};Model.prototype.alpha_beta=function(depth,alpha=-Infinity,beta=Infinity,maximizingPlayer=true,track_moves=true){if(track_moves){console.log("Finding move for "+this.turn());}
if(depth==0||this.winner()>0){return this.heuristic(maximizingPlayer);}
let v=0;let best=null;if(maximizingPlayer){v=-Infinity;for(let i of this.each_child(5)){if(beta>alpha){let tmp=this.alpha_beta(depth-1,alpha,beta,false,false);if(tmp>v){if(track_moves){best=this.last_committed_move().slice(0);}
v=tmp;alpha=Math.max(alpha,v);}}}}else{v=Infinity;for(let i of this.each_child(5)){if(beta>alpha){let tmp=this.alpha_beta(depth-1,alpha,beta,true,false);if(tmp<v){v=tmp;beta=Math.min(v,beta);}}}}
return track_moves?best:v;};Model.prototype.handle_human_uncommitted_undo=function(){if(!this.is_human_turn()){this.set_error("It's not your turn!");return;}
if(this.is_start_of_turn()){this.set_error("Nothing to take back");this.view.draw();return;}
this.pop_uncommitted_move();if(this.is_first_piece_destination()){this._state.uncommitted_move.pop();}
this.view.draw();};Model.prototype.human_commit_move=function(){let move=this.uncommitted_move();if(move.length<2){this.set_error("You need to make a move first");this.view.draw();return;}
this.push_move();this.view.draw();setTimeout(this.make_computer_move.bind(this),100);};Model.prototype.make_computer_move=function(){let moves,r;if(this.winner()>0){return;}
move=this.alpha_beta(this._state.computer_level);console.log(`Computer Move chosen:${move}`);console.log(move);for(let i=0;i<move.length;i++){if(move[i]>-1){this.push_uncommitted_move(move[i]);}}
this.push_move();this.view.draw();};Model.prototype.is_uncommitted_slide=function(){if(this._state.uncommitted_move.length===2){return(this.move_generator.is_slide_move(this._state.uncommitted_move[0],this._state.uncommitted_move[1]));}
return(false);}
Model.prototype.set_winner=function(){this._state.winner=0;if(this.is_first_turn()){return;}
if(this._state.court_tracker[1]==0){this._state.winner=2;}
if(this._state.court_tracker[2]==0){this._state.winner=1;}};Model.prototype.push_uncommitted_move=function(dst){let src=this.last_uncommitted_dst();if(src!==undefined){this.move_piece(src,dst);}
if(this.move_generator.is_jump_move(src,dst)){let jumped=this.move_generator.jumped_square(src,dst);if(this.is_enemy(jumped)){this._state.uncommitted_move.push(-1);this.set_square(jumped,0);}}
this._state.uncommitted_move.push(dst);};Model.prototype.pop_uncommitted_move=function(){let last_dst=this._state.uncommitted_move.pop();let enemy_jump_move=false;if(last_dst===undefined){console.log("Warning: tried to pop empty uncommitted move");return;}
if(this.is_start_of_turn()){return;}
if(this.last_uncommitted_dst()===-1){this._state.uncommitted_move.pop();enemy_jump_move=true;}
let last_src=this.last_uncommitted_dst();if(last_src!==undefined){this.move_piece(last_dst,last_src);if(this.move_generator.is_jump_move(last_dst,last_src)&&enemy_jump_move){let jumped=this.move_generator.jumped_square(last_dst,last_src);this.set_square(jumped,this.other_team());}}};Model.prototype.push_move=function(){this._state.committed_moves.push(this._state.uncommitted_move.slice(0));this._state.uncommitted_move=[];this._state.turn=this.other_team();};Model.prototype.pop_move=function(){this._state.turn=this.other_team();this._state.uncommitted_move=this._state.committed_moves.pop();};Model.prototype.rollback_uncommitted=function(){while(!this.is_start_of_turn()){this.pop_uncommitted_move();}}
Model.prototype.undo=function(){this.pop_move();this.rollback_uncommitted();this.view.draw();};Model.prototype.fetch_and_clear_error_message=function(){let err=this._state.error_message;this._state.error_message=null;return(err);};Model.prototype.move_piece=function(src,dst){this.set_square(dst,this.square(src));this.set_square(src,0);};Model.prototype.court_tracker=function(i){return(this._state.court_tracker[i]);};Model.prototype.square_tracker=function(i){return(this._state.square_tracker[i]);};Model.prototype.is_start_of_turn=function(){return(this._state.uncommitted_move.length===0);};Model.prototype.is_first_piece_destination=function(){return(this._state.uncommitted_move.length===1);};Model.prototype.is_court_square=function(i){return this.court_square_map[i];};Model.prototype.is_first_turn=function(){return(this._state.committed_moves.length<2);};Model.prototype.is_enemy=function(i){return this.square(i)==this.other_team();};Model.prototype.is_empty=function(i){return this.square(i)===0;};Model.prototype.is_occupied=function(i){return this.square(i)>0;};Model.prototype.is_human_turn=function(){return(this.turn()===this.human_team());};Model.prototype.uncommitted_move=function(){return(this._state.uncommitted_move);};Model.prototype.last_committed_move=function(){if(this._state.committed_moves.length===0){return([]);}
return(this._state.committed_moves[this._state.committed_moves.length-1].slice(0));};Model.prototype.last_uncommitted_dst=function(){return(this._state.uncommitted_move[this._state.uncommitted_move.length-1]);};Model.prototype.winner=function(){return(this._state.winner);};Model.prototype.other_team=function(){return this.turn()==1?2:1;};Model.prototype.set_error=function(msg){this._state.error_message=msg;};Model.prototype.human_team=function(){return(this._state.human_team);};Model.prototype.turn=function(){return(this._state.turn);};Model.prototype.is_game_started=function(){return(this._state.playing);};Model.prototype.set_square=function(i,val){if(this.is_occupied(i)&&val===0){this._state.square_tracker[this.square(i)]-=1;if(this.is_court_square(i)){this._state.court_tracker[this.square(i)]-=1;};};if(this.square(i)===0&&val>0){this._state.square_tracker[val]+=1;if(this.is_court_square(i)){this._state.court_tracker[val]+=1;};};this._state.squares[i]=val;this.set_winner();};Model.prototype.square=function(i){return this._state.squares[i];};Model.prototype.start_game=function(human_team,computer_level){this.initialize_state(human_team,computer_level);this._state.playing=true;this.view.draw();if(!this.is_human_turn()){this.make_computer_move();}};Model.prototype.initialize_state=function(human_team=1,computer_level=1){this._state={};this._state.computer_level=computer_level;this._state.playing=false;this._state.moves=[];this._state.human_team=human_team;this._state.turn=1;this._state.winner=0;this._state.uncommitted_move=[];this._state.committed_moves=[];this._state.error_message=null;this._state.court_tracker=[0,0,0];this._state.square_tracker=[0,24,24];this._state.squares=[1,2,1,2,1,2,1,2,2,1,2,1,2,1,2,1,1,2,0,0,0,0,1,2,2,1,0,0,0,0,2,1,1,2,0,0,0,0,1,2,2,1,0,0,0,0,2,1,1,2,1,2,1,2,1,2,2,1,2,1,2,1,2,1,];};Model.prototype.court_squares=[18,19,20,21,26,27,28,29,34,35,36,37,42,43,44,45];Model.prototype.court_square_map=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];