class Tile {
    constructor(boardID, teamID, Occupation) {
        this.BoardID = boardID;
        this.TeamID = teamID || undefined;
        this.Occupation = Occupation || undefined;
        this.HasMoved = false;
    }
}
export default Tile;
//# sourceMappingURL=tile.js.map