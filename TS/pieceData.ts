interface dataInterface {
    points: number,
    crossesCreeks: boolean,
    movesContinuously: boolean,
    storeMoved: boolean,
    storeCrossed: boolean
}

enum PieceTypes {
    Pawn = 0,
    Rook,
    King
}

const PieceData: Array<dataInterface> = [];

PieceData[PieceTypes.Pawn] = {
    points: 1,
    crossesCreeks: false,
    movesContinuously: false,
    storeMoved: false,
    storeCrossed: true
};

PieceData[PieceTypes.Rook] = {
    points: 5,
    crossesCreeks: true,
    movesContinuously: true,
    storeMoved: false,
    storeCrossed: false
};

PieceData[PieceTypes.King] = {
    points: 100,
    crossesCreeks: true,
    movesContinuously: false,
    storeMoved: false,
    storeCrossed: false
};

export {PieceTypes, dataInterface, PieceData};