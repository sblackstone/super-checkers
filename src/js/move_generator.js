const MoveGenerator = function(model) {
  this.model = model;
  window.mg = this;
  // Generated from scripts in ./scripts
  this.slide_moves    = [[1,8],[0,2,9],[1,3,10],[2,4,11],[3,5,12],[4,6,13],[5,7,14],[6,15],[9,16,0],[8,10,17,1],[9,11,18,2],[10,12,19,3],[11,13,20,4],[12,14,21,5],[13,15,22,6],[14,23,7],[17,24,8],[16,18,25,9],[17,19,26,10],[18,20,27,11],[19,21,28,12],[20,22,29,13],[21,23,30,14],[22,31,15],[25,32,16],[24,26,33,17],[25,27,34,18],[26,28,35,19],[27,29,36,20],[28,30,37,21],[29,31,38,22],[30,39,23],[33,40,24],[32,34,41,25],[33,35,42,26],[34,36,43,27],[35,37,44,28],[36,38,45,29],[37,39,46,30],[38,47,31],[41,48,32],[40,42,49,33],[41,43,50,34],[42,44,51,35],[43,45,52,36],[44,46,53,37],[45,47,54,38],[46,55,39],[49,56,40],[48,50,57,41],[49,51,58,42],[50,52,59,43],[51,53,60,44],[52,54,61,45],[53,55,62,46],[54,63,47],[57,48],[56,58,49],[57,59,50],[58,60,51],[59,61,52],[60,62,53],[61,63,54],[62,55]];
  this.jump_moves     = [[16,2],[17,3],[18,0,4],[19,1,5],[20,2,6],[21,3,7],[22,4],[23,5],[24,10],[25,11],[26,8,12],[27,9,13],[28,10,14],[29,11,15],[30,12],[31,13],[32,0,18],[33,1,19],[34,2,16,20],[35,3,17,21],[36,4,18,22],[37,5,19,23],[38,6,20],[39,7,21],[40,8,26],[41,9,27],[42,10,24,28],[43,11,25,29],[44,12,26,30],[45,13,27,31],[46,14,28],[47,15,29],[48,16,34],[49,17,35],[50,18,32,36],[51,19,33,37],[52,20,34,38],[53,21,35,39],[54,22,36],[55,23,37],[56,24,42],[57,25,43],[58,26,40,44],[59,27,41,45],[60,28,42,46],[61,29,43,47],[62,30,44],[63,31,45],[32,50],[33,51],[34,48,52],[35,49,53],[36,50,54],[37,51,55],[38,52],[39,53],[40,58],[41,59],[42,56,60],[43,57,61],[44,58,62],[45,59,63],[46,60],[47,61]];  
  
};



MoveGenerator.prototype.is_legal_piece_move = function(src, dst) {
  let moves = this.legal_moves();
  return(moves.indexOf(dst) > -1);
};


MoveGenerator.prototype.is_jump_move = function(src,dst) {
  let delta = Math.abs(dst - src);
  return(delta == 16 || delta == 2);
};

MoveGenerator.prototype.is_slide_move = function(src,dst) {
  let delta = Math.abs(dst - src);
  return(delta == 1 || delta == 8);
};


MoveGenerator.prototype.jumped_square = function(src, dst) {
  return src + ((dst - src) / 2);  
};

MoveGenerator.prototype.add_slide_moves = function(moves, src) {
  this.slide_moves[src].forEach((dst) => {
    if (this.model.is_empty(dst)) {
      moves.push(dst);
    } 
  });  
};


// This needs to not allow jump-backs
MoveGenerator.prototype.add_jump_moves = function(moves, src)  {
  this.jump_moves[src].forEach((dst)=> {
    if (this.model.is_start_of_turn() || src == this.model.last_uncommitted_dst()) {
      let js = this.jumped_square(src,dst);
      if (this.model.is_empty(dst) && !this.model.is_empty(js)) {
        moves.push(dst);        
      }      
    }
  });      
};  

MoveGenerator.prototype.legal_first_moves = function() {
  const moves = [];
  for (let i = 0; i < 64; i++) {
    if (this.model.square(i) == this.model.turn()) {
      moves.push(i);
    }
  }  
  return(moves);
};

MoveGenerator.prototype.legal_followup_moves = function() {
  const moves = [];
  const src = this.model.last_uncommitted_dst();
  if (this.model.is_first_piece_destination()) {
    this.add_slide_moves(moves, src);        
  }

  // No jumping in first 2 moves or if we've already slid..
  if (!this.model.is_first_turn() && !this.model.is_uncommitted_slide()) {
    this.add_jump_moves(moves, src);    
  }
  return(moves);  
};


MoveGenerator.prototype.legal_moves = function() {
  if (this.model.winner() > 0) {
    return([]);    
  }
  
  return this.model.is_start_of_turn() ? this.legal_first_moves() : this.legal_followup_moves();
};










