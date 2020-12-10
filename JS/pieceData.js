var PieceTypes;
(function (PieceTypes) {
    PieceTypes[PieceTypes["Pawn"] = 0] = "Pawn";
})(PieceTypes || (PieceTypes = {}));
const PieceData = [];
PieceData[PieceTypes.Pawn] = {
    points: 1,
    trackMoved: false,
    trackCrossed: true
};
export { PieceTypes, PieceData };
//# sourceMappingURL=pieceData.js.map