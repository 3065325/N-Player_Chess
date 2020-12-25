import Pieces from "./pieces.js";

class Players {
    public static BoardIndices: Array<number> = [];
    public static Pieces: Array<Array<number>> = [];
    public static TakenPieces: Array<Array<number>> = [];
    public static InCheckBy: Array<number | undefined> = [];
    public static IsDead: Array<boolean> = [];

    private static Counter: number = 0;
    private static IndexStack: Array<number> = [];

    public static createPlayer(boardIndex: number): number {
        const nextIndex: number = Players.IndexStack.pop() || Players.Counter++;

        Players.BoardIndices[nextIndex] = boardIndex;
        Players.Pieces[nextIndex] = [];
        Players.TakenPieces[nextIndex] = [];
        Players.InCheckBy[nextIndex] = undefined;
        Players.IsDead[nextIndex] = false;
        return nextIndex;
    }

    public static removePlayer(playerIndex: number): void {
        if (playerIndex < 0 || playerIndex >= Players.Counter) return;

        Players.IndexStack.push(playerIndex);

        delete Players.BoardIndices[playerIndex];
        delete Players.Pieces[playerIndex];
        delete Players.TakenPieces[playerIndex];
        delete Players.InCheckBy[playerIndex];
        delete Players.IsDead[playerIndex];
    }

    public static setPlayerDead(playerIndex: number, isDead: boolean): void {
        Players.IsDead[playerIndex] = isDead;
    }
}

export default Players;