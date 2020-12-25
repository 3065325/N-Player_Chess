class Players {
    static createPlayer(boardIndex) {
        const nextIndex = Players.IndexStack.pop() || Players.Counter++;
        Players.BoardIndices[nextIndex] = boardIndex;
        Players.Pieces[nextIndex] = [];
        Players.TakenPieces[nextIndex] = [];
        Players.InCheckBy[nextIndex] = undefined;
        Players.IsDead[nextIndex] = false;
        return nextIndex;
    }
    static removePlayer(playerIndex) {
        if (playerIndex < 0 || playerIndex >= Players.Counter)
            return;
        Players.IndexStack.push(playerIndex);
        delete Players.BoardIndices[playerIndex];
        delete Players.Pieces[playerIndex];
        delete Players.TakenPieces[playerIndex];
        delete Players.InCheckBy[playerIndex];
        delete Players.IsDead[playerIndex];
    }
    static setPlayerDead(playerIndex, isDead) {
        Players.IsDead[playerIndex] = isDead;
    }
}
Players.BoardIndices = [];
Players.Pieces = [];
Players.TakenPieces = [];
Players.InCheckBy = [];
Players.IsDead = [];
Players.Counter = 0;
Players.IndexStack = [];
export default Players;
//# sourceMappingURL=player.js.map