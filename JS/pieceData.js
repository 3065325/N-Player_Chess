var PieceTypes;
(function (PieceTypes) {
    PieceTypes[PieceTypes["Pawn"] = 0] = "Pawn";
    PieceTypes[PieceTypes["Knight"] = 1] = "Knight";
    PieceTypes[PieceTypes["Bishop"] = 2] = "Bishop";
    PieceTypes[PieceTypes["Rook"] = 3] = "Rook";
    PieceTypes[PieceTypes["Queen"] = 4] = "Queen";
    PieceTypes[PieceTypes["King"] = 5] = "King";
})(PieceTypes || (PieceTypes = {}));
const PieceData = [];
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
export { PieceTypes, PieceData };
//# sourceMappingURL=pieceData.js.map