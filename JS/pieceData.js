var PieceNames;
(function (PieceNames) {
    PieceNames[PieceNames["Pawn"] = 0] = "Pawn";
})(PieceNames || (PieceNames = {}));
const PieceData = [];
PieceData[PieceNames.Pawn] = {
    points: 1,
    trackMoved: false,
    trackCrossed: true,
};
export { PieceNames, PieceData };
//# sourceMappingURL=pieceData.js.map