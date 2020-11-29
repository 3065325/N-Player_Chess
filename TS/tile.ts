import Piece from "./pieces.js";

class Tiles {
    public static BoardIndices: Array<number> = [];
    public static Occupations: Array<number | undefined> = [];
    public static HasMoved: Array<boolean> = [];

    public static CanAttack: Array<Array<number>> = [];
    public static AttackedBy: Array<Array<number>> = [];

    private static Counter: number = 0;
    private static IndexStack: Array<number> = [];

    public static createTile(boardIndex: number): number {
        const nextIndex: number = Tiles.IndexStack.pop() || Tiles.Counter++;

        Tiles.BoardIndices[nextIndex] = boardIndex;
        Tiles.Occupations[nextIndex] = undefined;
        Tiles.HasMoved[nextIndex] = false;
        
        Tiles.CanAttack[nextIndex] = [];
        Tiles.AttackedBy[nextIndex] = [];

        return nextIndex;
    }

    public static removeTile(tileIndex: number): void {
        if (tileIndex < 0 || tileIndex >= Tiles.Counter) return;

        Tiles.IndexStack.push(tileIndex);

        delete Tiles.BoardIndices[tileIndex];
        delete Tiles.Occupations[tileIndex];
        delete Tiles.HasMoved[tileIndex];
        
        delete Tiles.CanAttack[tileIndex];
        delete Tiles.AttackedBy[tileIndex];
    }
}

export default Tiles;

// class Tile {
//     public BoardID: number;
//     public TeamID: number | undefined;
//     public Occupation: number | undefined;
//     public HasMoved: boolean;
//     public CanAttack: Array<number>;
//     public AttackedBy: Array<number>;

//     constructor(boardID: number, teamID?: number, Occupation?: number) {
//         this.BoardID = boardID;
//         this.TeamID = teamID || undefined;
//         this.Occupation = Occupation || undefined;
//         this.CanAttack = [];
//         this.AttackedBy = [];
//         this.HasMoved = false;
//     }
// }

// export default Tile;