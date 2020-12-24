interface dataInterface {
    points: number,
    crossesCreeks: boolean,
    attacksContinuously: boolean,
    storeMoved: boolean,
    storeCrossed: boolean
}

enum PieceTypes {
    Pawn = 0,
    Knight,
    Bishop,
    Rook,
    Queen,
    King
}

const PieceData: Array<dataInterface> = [];

PieceData[PieceTypes.Pawn] = {
    points: 1,
    crossesCreeks: false,
    attacksContinuously: false,
    storeMoved: true,
    storeCrossed: true
};

PieceData[PieceTypes.Knight] = {
    points: 3,
    crossesCreeks: true,
    attacksContinuously: false,
    storeMoved: false,
    storeCrossed: false
};

PieceData[PieceTypes.Bishop] = {
    points: 3,
    crossesCreeks: true,
    attacksContinuously: true,
    storeMoved: false,
    storeCrossed: false
};

PieceData[PieceTypes.Rook] = {
    points: 5,
    crossesCreeks: true,
    attacksContinuously: true,
    storeMoved: false,
    storeCrossed: false
};

PieceData[PieceTypes.Queen] = {
    points: 9,
    crossesCreeks: true,
    attacksContinuously: true,
    storeMoved: false,
    storeCrossed: false
};

PieceData[PieceTypes.King] = {
    points: 100,
    crossesCreeks: true,
    attacksContinuously: false,
    storeMoved: false,
    storeCrossed: false
};

export {PieceTypes, dataInterface, PieceData};