var PieceTypes;
(function (PieceTypes) {
    PieceTypes[PieceTypes["Pawn"] = 0] = "Pawn";
    PieceTypes[PieceTypes["Rook"] = 1] = "Rook";
    PieceTypes[PieceTypes["King"] = 2] = "King";
})(PieceTypes || (PieceTypes = {}));
const PieceData = [];
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
export { PieceTypes, PieceData };
//# sourceMappingURL=pieceData.js.map