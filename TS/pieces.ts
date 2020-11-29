import {dataInterface, PieceData, PieceNames} from "./pieceData.js";

class Pieces {
    public static PieceTypes: Array<number> = [];
    public static PlayerIndices: Array<number> = [];
    public static Points: Array<number> = [];

    public static HasMoved: Map<number, boolean> = new Map();
    public static HasCrossed: Map<number, boolean> = new Map();

    private static Counter: number = 0;
    private static IndexStack: Array<number> = [];

    public static createPiece(pieceType: number, playerIndex: number): number {
        const nextIndex: number = Pieces.IndexStack.pop() || Pieces.Counter++;

        const pieceData: dataInterface = PieceData[pieceType];
        Pieces.PieceTypes[nextIndex] = pieceType;
        Pieces.PlayerIndices[nextIndex] = playerIndex;
        Pieces.Points[nextIndex] = pieceData.points;

        if (pieceData.trackMoved) Pieces.HasMoved[nextIndex] = false;
        if (pieceData.trackCrossed) Pieces.HasCrossed[nextIndex] = false;

        return nextIndex;
    }

    public static removePiece(pieceIndex: number): void {
        if (pieceIndex < 0 || pieceIndex >= Pieces.Counter) return;

        Pieces.IndexStack.push(pieceIndex);

        delete Pieces.PieceTypes[pieceIndex];
        delete Pieces.PlayerIndices[pieceIndex];
        delete Pieces.Points[pieceIndex];

        delete Pieces.HasMoved[pieceIndex];
        delete Pieces.HasCrossed[pieceIndex];
    }
}

export default Pieces;

// class Piece {
//     public PieceID: number;
//     public PieceType: number;
//     public Points: number;

//     constructor(pieceType: number, pieceID: number, points: number) {
//         this.PieceID = pieceID;
//         this.PieceType = pieceType;;
//         this.Points = points;
//     }
// }

// // const Pieces: Array<Piece> = [
// //     //Pawn, 0//
// //     new Piece(1),

// //     //Knight, 1//
// //     new Piece(3),

// //     //Bishop, 2//
// //     new Piece(3),

// //     //Rook, 3//
// //     new Piece(5),

// //     //Queen, 4//
// //     new Piece(9),

// //     //King, 5//
// //     new Piece(20)
// // ];

// export default Piece;
