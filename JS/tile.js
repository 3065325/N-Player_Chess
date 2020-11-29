class Tiles {
    static createTile(boardIndex) {
        const nextIndex = Tiles.IndexStack.pop() || Tiles.Counter++;
        Tiles.BoardIndices[nextIndex] = boardIndex;
        Tiles.Occupations[nextIndex] = undefined;
        Tiles.HasMoved[nextIndex] = false;
        Tiles.CanAttack[nextIndex] = [];
        Tiles.AttackedBy[nextIndex] = [];
        return nextIndex;
    }
    static removeTile(tileIndex) {
        if (tileIndex < 0 || tileIndex >= Tiles.Counter)
            return;
        Tiles.IndexStack.push(tileIndex);
        delete Tiles.BoardIndices[tileIndex];
        delete Tiles.Occupations[tileIndex];
        delete Tiles.HasMoved[tileIndex];
        delete Tiles.CanAttack[tileIndex];
        delete Tiles.AttackedBy[tileIndex];
    }
}
Tiles.BoardIndices = [];
Tiles.Occupations = [];
Tiles.HasMoved = [];
Tiles.CanAttack = [];
Tiles.AttackedBy = [];
Tiles.Counter = 0;
Tiles.IndexStack = [];
export default Tiles;
//# sourceMappingURL=tile.js.map