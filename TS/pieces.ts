class Piece {
    public Points: number;

    constructor(points: number) {
        this.Points = points;
    }
}

const Pieces: Array<Piece> = [
    //Pawn, 0//
    new Piece(1),

    //Knight, 1//
    new Piece(3),

    //Bishop, 2//
    new Piece(3),

    //Rook, 3//
    new Piece(5),

    //Queen, 4//
    new Piece(9),

    //King, 5//
    new Piece(20)
];

export default Pieces;
