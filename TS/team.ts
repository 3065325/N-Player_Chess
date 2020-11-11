class Team {
    public BoardID: number;
    public TeamID: number;

    public Name: string;
    public Color: string;

    public PieceCount: number;

    constructor(boardID: number, teamID: number, name: string, color: string) {
        this.BoardID = boardID;
        this.TeamID = teamID;

        this.Name = name;
        this.Color = color;

        this.PieceCount = 16;
    }
}

export default Team;