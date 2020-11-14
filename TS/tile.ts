class Tile {
    public BoardID: number;
    public TeamID: number | undefined;
    public Occupation: number | undefined;
    public HasMoved: boolean;
    public InSightOf: Array<number>;

    constructor(boardID: number, teamID?: number, Occupation?: number) {
        this.BoardID = boardID;
        this.TeamID = teamID || undefined;
        this.Occupation = Occupation || undefined;
        this.InSightOf = [];
        this.HasMoved = false;
    }
}

export default Tile;