class Players {
    static createPlayer(boardIndex, name, color) {
        const nextIndex = Players.IndexStack.pop() || Players.Counter++;
        Players.BoardIndexes[nextIndex] = boardIndex;
        Players.Pieces[nextIndex] = [];
        Players.Names[nextIndex] = name;
        Players.Colors[nextIndex] = color;
        Players.IsDead[nextIndex] = false;
        return nextIndex;
    }
    static removePlayer(playerIndex) {
        if (playerIndex < 0 || playerIndex >= Players.Counter)
            return;
        Players.IndexStack.push(playerIndex);
        delete Players.BoardIndexes[playerIndex];
        delete Players.Pieces[playerIndex];
        delete Players.Names[playerIndex];
        delete Players.Colors[playerIndex];
        delete Players.IsDead[playerIndex];
    }
}
Players.BoardIndexes = [];
Players.Pieces = [];
Players.Names = [];
Players.Colors = [];
Players.IsDead = [];
Players.Counter = 0;
Players.IndexStack = [];
export default Players;
//# sourceMappingURL=player.js.map