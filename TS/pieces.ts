class Piece {
    public Points: number;
    public HasCrossed: boolean;

    constructor(points: number) {
        this.Points = points;
        this.HasCrossed = false;
    }
}

const Pieces: Array<Piece> = [
    //Pawn//
    new Piece(1),

    //Knight//
    new Piece(3),

    //Bishop//
    new Piece(3),

    //Rook//
    new Piece(5),

    //Queen//
    new Piece(9),

    //King//
    new Piece(20)
];

export default Pieces;
