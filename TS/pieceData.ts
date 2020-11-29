enum PieceNames {
    Pawn = 0
}

interface dataInterface {
    points: number,
    trackMoved: boolean,
    trackCrossed: boolean
}

const PieceData: Array<dataInterface> = [];
PieceData[PieceNames.Pawn] = {
    points: 1,
    trackMoved: false,
    trackCrossed: true,
};

export {PieceNames, dataInterface, PieceData};