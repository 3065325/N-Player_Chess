enum PieceTypes {
    Pawn = 0
}

interface dataInterface {
    points: number,
    crossesCreeks: boolean,
    movesContinuously: boolean,
    storeMoved: boolean,
    storeCrossed: boolean
}

const PieceData: Array<dataInterface> = [];

PieceData[PieceTypes.Pawn] = {
    points: 1,
    crossesCreeks: false,
    movesContinuously: false,
    storeMoved: false,
    storeCrossed: true
};

export {PieceTypes, dataInterface, PieceData};