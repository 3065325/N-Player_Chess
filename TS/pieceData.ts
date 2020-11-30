enum PieceTypes {
    Pawn = 0
}

interface dataInterface {
    points: number,
    trackMoved: boolean,
    trackCrossed: boolean
}

const PieceData: Array<dataInterface> = [];
PieceData[PieceTypes.Pawn] = {
    points: 1,
    trackMoved: false,
    trackCrossed: true
};

export {PieceTypes, dataInterface, PieceData};