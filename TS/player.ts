import Pieces from "./pieces.js";

class Players {
    public static BoardIndexes: Array<number> = [];
    public static Pieces: Array<Array<number>> = [];

    public static Names: Array<string> = [];
    public static Colors: Array<string> = [];

    private static Counter: number = 0;
    private static IndexStack: Array<number> = [];

    public static createPlayer(boardIndex: number, name: string, color: string): number {
        const nextIndex: number = Players.IndexStack.pop() || Players.Counter++;

        Players.BoardIndexes[nextIndex] = boardIndex;
        Players.Pieces[nextIndex] = [];

        Players.Names[nextIndex] = name;
        Players.Colors[nextIndex] = color;

        return nextIndex;
    }

    public static removePlayer(playerIndex: number): void {
        if (playerIndex < 0 || playerIndex >= Players.Counter) return;

        Players.IndexStack.push(playerIndex);

        delete Players.BoardIndexes[playerIndex];
        delete Players.Pieces[playerIndex];
        
        delete Players.Names[playerIndex];
        delete Players.Colors[playerIndex];
    }
}

export default Players;

// class Team {
//     public BoardID: number;
//     public TeamID: number;

//     public Name: string;
//     public Color: string;

//     public PieceCount: number;

//     constructor(boardID: number, teamID: number, name: string, color: string) {
//         this.BoardID = boardID;
//         this.TeamID = teamID;

//         this.Name = name;
//         this.Color = color;

//         this.PieceCount = 16;
//     }
// }

// export default Team;