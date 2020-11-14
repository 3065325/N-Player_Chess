const mod = (a, b) => { return (a % b + b) % b; };
const floor = Math.floor;
class MovementManager {
    static movePiece(board, oldTileIndex, newTileIndex) {
        const oldTile = board.Tiles[oldTileIndex];
        const newTile = board.Tiles[newTileIndex];
        newTile.Occupation = oldTile.Occupation;
        newTile.TeamID = oldTile.TeamID;
        oldTile.Occupation = undefined;
        oldTile.TeamID = undefined;
    }
    static getPossibleMoves(board, tileIndex) {
        const tileOccupation = board.Tiles[tileIndex].Occupation;
        if (tileOccupation === undefined) {
            console.log(board, tileIndex, board.Tiles[tileIndex], board.Tiles[tileIndex].Occupation);
            return [];
        }
        return MovementManager.possibleMoveFunctions[tileOccupation](board, tileIndex);
    }
    static moveRadial(board, tileIndex, amount) {
        const differenceRatio = tileIndex / board.ColumnCount - amount;
        const isCrossed = floor(0.5 * Math.sign(differenceRatio));
        const flooredDR = floor(differenceRatio);
        const newTileIndex = board.ColumnCount * (((tileIndex / board.ColumnCount + 0.5 * isCrossed) % 1) + isCrossed * (1 + 2 * flooredDR) + flooredDR);
        if (newTileIndex < board.ColumnCount * board.RowCount)
            return newTileIndex;
    }
    static moveTangential(board, tileIndex, amount) {
        return mod(tileIndex + amount, board.ColumnCount) + floor(tileIndex / board.ColumnCount) * board.ColumnCount;
    }
    static moveDiagonalRight(board, tileIndex, amount) {
        const rowCount = board.RowCount - 1;
        const tileT = tileIndex % board.ColumnCount;
        const tileR = floor(tileIndex / board.ColumnCount);
        const deltaRow = board.RowCount - (tileR + 1);
        const moveT = mod(deltaRow + amount + rowCount, 2 * rowCount + 1) - rowCount;
        const moveR = Math.abs(moveT);
        return mod(tileT - deltaRow + moveT, board.ColumnCount) + (rowCount - moveR) * board.ColumnCount;
    }
    static moveDiagonalLeft(board, tileIndex, amount) {
        const rowCount = board.RowCount - 1;
        const tileT = tileIndex % board.ColumnCount;
        const tileR = floor(tileIndex / board.ColumnCount);
        const deltaRow = board.RowCount - (tileR + 1);
        const moveT = mod(deltaRow + amount + rowCount, 2 * rowCount + 1) - rowCount;
        const moveR = Math.abs(moveT);
        return mod(tileT + deltaRow - moveT, board.ColumnCount) + (rowCount - moveR) * board.ColumnCount;
    }
}
MovementManager.possibleMoveFunctions = [];
MovementManager.possibleMoveFunctions[0] = (board, tileIndex, teamID) => {
    const possibleMoves = [];
    const tile = board.Tiles[tileIndex];
    const team = teamID || tile.TeamID;
    let potentialTileIndex = tileIndex;
    let potentialTile = board.Tiles[potentialTileIndex];
    potentialTileIndex = MovementManager.moveDiagonalRight(board, tileIndex, 1);
    potentialTile = board.Tiles[potentialTileIndex];
    if (potentialTile.TeamID !== team && potentialTile.TeamID !== undefined) {
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
    }
    potentialTileIndex = MovementManager.moveDiagonalLeft(board, tileIndex, 1);
    potentialTile = board.Tiles[potentialTileIndex];
    if (potentialTile.TeamID !== team && potentialTile.TeamID !== undefined) {
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
    }
    potentialTileIndex = MovementManager.moveRadial(board, tileIndex, 1);
    if (potentialTileIndex && board.Tiles[potentialTileIndex].TeamID === undefined) {
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
        potentialTileIndex = MovementManager.moveRadial(board, tileIndex, 2);
        if (floor(tileIndex / board.ColumnCount) === board.RowCount - 2 && potentialTileIndex && board.Tiles[potentialTileIndex].TeamID === undefined) {
            if (!possibleMoves.includes(potentialTileIndex))
                possibleMoves.push(potentialTileIndex);
        }
    }
    return possibleMoves;
};
MovementManager.possibleMoveFunctions[1] = (board, tileIndex, teamID) => {
    const possibleMoves = [];
    const tile = board.Tiles[tileIndex];
    const team = teamID || tile.TeamID;
    let potentialTileIndex;
    let potentialTile;
    for (let i = -1; i < 2; i += 2) {
        console.log(i, ` i tangential -> radial`);
        const flipTileIndex = MovementManager.moveTangential(board, tileIndex, 3 * i);
        for (let j = -1; j < 2; j += 2) {
            console.log(j, ` j tangential -> radial`);
            potentialTileIndex = MovementManager.moveRadial(board, flipTileIndex, j);
            if (potentialTileIndex === undefined)
                continue;
            potentialTile = board.Tiles[potentialTileIndex];
            if (potentialTile.TeamID !== team) {
                if (!possibleMoves.includes(potentialTileIndex))
                    possibleMoves.push(potentialTileIndex);
            }
        }
    }
    for (let i = -1; i < 2; i += 2) {
        console.log(i, ` i radial -> tangential`);
        const flipTileIndex = MovementManager.moveRadial(board, tileIndex, 3 * i);
        if (flipTileIndex === undefined) {
            console.log(`SKIPPED`, flipTileIndex);
            continue;
        }
        for (let j = -1; j < 2; j += 2) {
            console.log(j, ` j radial -> tangential`);
            potentialTileIndex = MovementManager.moveTangential(board, flipTileIndex, j);
            potentialTile = board.Tiles[potentialTileIndex];
            if (potentialTile.TeamID !== team) {
                if (!possibleMoves.includes(potentialTileIndex))
                    possibleMoves.push(potentialTileIndex);
            }
        }
    }
    return possibleMoves;
};
MovementManager.possibleMoveFunctions[2] = (board, tileIndex, teamID) => {
    const possibleMoves = [];
    const tile = board.Tiles[tileIndex];
    const team = teamID || tile.TeamID;
    const pathLength = 2 * board.RowCount - 1;
    let potentialTileIndex;
    let potentialTile;
    let reverseOrder = true;
    for (let i = 1; i < pathLength; i++) {
        potentialTileIndex = MovementManager.moveDiagonalRight(board, tileIndex, i);
        potentialTile = board.Tiles[potentialTileIndex];
        console.log("RightIn", potentialTileIndex);
        if (potentialTile.TeamID === team)
            break;
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
        if (i === pathLength - 1)
            reverseOrder = false;
        if (potentialTile.TeamID !== undefined)
            break;
    }
    if (reverseOrder) {
        for (let i = -1; i > -pathLength; i--) {
            potentialTileIndex = MovementManager.moveDiagonalRight(board, tileIndex, i);
            potentialTile = board.Tiles[potentialTileIndex];
            console.log("RightOut", potentialTileIndex);
            if (potentialTile.TeamID === team)
                break;
            if (!possibleMoves.includes(potentialTileIndex))
                possibleMoves.push(potentialTileIndex);
            if (potentialTile.TeamID !== undefined)
                break;
        }
    }
    reverseOrder = true;
    for (let i = 1; i < pathLength; i++) {
        potentialTileIndex = MovementManager.moveDiagonalLeft(board, tileIndex, i);
        potentialTile = board.Tiles[potentialTileIndex];
        console.log("LeftIn", potentialTileIndex);
        if (potentialTile.TeamID === team)
            break;
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
        if (i === pathLength - 1)
            reverseOrder = false;
        if (potentialTile.TeamID !== undefined)
            break;
    }
    if (reverseOrder) {
        for (let i = -1; i > -pathLength; i--) {
            potentialTileIndex = MovementManager.moveDiagonalLeft(board, tileIndex, i);
            potentialTile = board.Tiles[potentialTileIndex];
            console.log("LeftOut", potentialTileIndex);
            if (potentialTile.TeamID === team)
                break;
            if (!possibleMoves.includes(potentialTileIndex))
                possibleMoves.push(potentialTileIndex);
            if (potentialTile.TeamID !== undefined)
                break;
        }
    }
    return possibleMoves;
};
MovementManager.possibleMoveFunctions[3] = (board, tileIndex, teamID) => {
    const possibleMoves = [];
    const tile = board.Tiles[tileIndex];
    const team = teamID || tile.TeamID;
    const pathLengthTangential = board.ColumnCount - 1;
    const pathLengthRadial = board.RowCount * 2 - 1;
    let potentialTileIndex;
    let potentialTile;
    let reverseOrder = true;
    for (let i = 1; i < pathLengthTangential; i++) {
        potentialTileIndex = MovementManager.moveTangential(board, tileIndex, i);
        potentialTile = board.Tiles[potentialTileIndex];
        console.log("Right", potentialTileIndex);
        if (potentialTile.TeamID === team)
            break;
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
        if (i === pathLengthTangential - 1)
            reverseOrder = false;
        if (potentialTile.TeamID !== undefined)
            break;
    }
    if (reverseOrder) {
        for (let i = -1; i > -pathLengthTangential; i--) {
            potentialTileIndex = MovementManager.moveTangential(board, tileIndex, i);
            potentialTile = board.Tiles[potentialTileIndex];
            console.log("Left", potentialTileIndex);
            if (potentialTile.TeamID === team)
                break;
            if (!possibleMoves.includes(potentialTileIndex))
                possibleMoves.push(potentialTileIndex);
            if (potentialTile.TeamID !== undefined)
                break;
        }
    }
    for (let i = 1; i < pathLengthRadial; i++) {
        potentialTileIndex = MovementManager.moveRadial(board, tileIndex, i);
        if (potentialTileIndex === undefined)
            break;
        potentialTile = board.Tiles[potentialTileIndex];
        console.log("In", potentialTileIndex);
        if (potentialTile.TeamID === team)
            break;
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
        if (potentialTile.TeamID !== undefined)
            break;
    }
    for (let i = -1; i > -pathLengthRadial; i--) {
        potentialTileIndex = MovementManager.moveRadial(board, tileIndex, i);
        if (potentialTileIndex === undefined)
            break;
        potentialTile = board.Tiles[potentialTileIndex];
        console.log("Out", potentialTileIndex);
        if (potentialTile.TeamID === team)
            break;
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
        if (potentialTile.TeamID !== undefined)
            break;
    }
    return possibleMoves;
};
MovementManager.possibleMoveFunctions[4] = (board, tileIndex, teamID) => {
    const possibleMoves = [];
    const tile = board.Tiles[tileIndex];
    const team = teamID || tile.TeamID;
    const pathLengthDiagonal = 2 * board.RowCount - 1;
    const pathLengthTangential = board.ColumnCount - 1;
    const pathLengthRadial = board.RowCount * 2 - 1;
    let potentialTileIndex;
    let potentialTile;
    let reverseOrder = true;
    for (let i = 1; i < pathLengthDiagonal; i++) {
        potentialTileIndex = MovementManager.moveDiagonalRight(board, tileIndex, i);
        potentialTile = board.Tiles[potentialTileIndex];
        console.log("RightIn", potentialTileIndex);
        if (potentialTile.TeamID === team)
            break;
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
        if (i === pathLengthDiagonal - 1)
            reverseOrder = false;
        if (potentialTile.TeamID !== undefined)
            break;
    }
    if (reverseOrder) {
        for (let i = -1; i > -pathLengthDiagonal; i--) {
            potentialTileIndex = MovementManager.moveDiagonalRight(board, tileIndex, i);
            potentialTile = board.Tiles[potentialTileIndex];
            console.log("RightOut", potentialTileIndex);
            if (potentialTile.TeamID === team)
                break;
            if (!possibleMoves.includes(potentialTileIndex))
                possibleMoves.push(potentialTileIndex);
            if (potentialTile.TeamID !== undefined)
                break;
        }
    }
    reverseOrder = true;
    for (let i = 1; i < pathLengthDiagonal; i++) {
        potentialTileIndex = MovementManager.moveDiagonalLeft(board, tileIndex, i);
        potentialTile = board.Tiles[potentialTileIndex];
        console.log("LeftIn", potentialTileIndex);
        if (potentialTile.TeamID === team)
            break;
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
        if (i === pathLengthDiagonal - 1)
            reverseOrder = false;
        if (potentialTile.TeamID !== undefined)
            break;
    }
    if (reverseOrder) {
        for (let i = -1; i > -pathLengthDiagonal; i--) {
            potentialTileIndex = MovementManager.moveDiagonalLeft(board, tileIndex, i);
            potentialTile = board.Tiles[potentialTileIndex];
            console.log("LeftOut", potentialTileIndex);
            if (potentialTile.TeamID === team)
                break;
            if (!possibleMoves.includes(potentialTileIndex))
                possibleMoves.push(potentialTileIndex);
            if (potentialTile.TeamID !== undefined)
                break;
        }
    }
    reverseOrder = true;
    for (let i = 1; i < pathLengthTangential; i++) {
        potentialTileIndex = MovementManager.moveTangential(board, tileIndex, i);
        potentialTile = board.Tiles[potentialTileIndex];
        console.log("Right", potentialTileIndex);
        if (potentialTile.TeamID === team)
            break;
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
        if (i === pathLengthTangential - 1)
            reverseOrder = false;
        if (potentialTile.TeamID !== undefined)
            break;
    }
    if (reverseOrder) {
        for (let i = -1; i > -pathLengthTangential; i--) {
            potentialTileIndex = MovementManager.moveTangential(board, tileIndex, i);
            potentialTile = board.Tiles[potentialTileIndex];
            console.log("Left", potentialTileIndex);
            if (potentialTile.TeamID === team)
                break;
            if (!possibleMoves.includes(potentialTileIndex))
                possibleMoves.push(potentialTileIndex);
            if (potentialTile.TeamID !== undefined)
                break;
        }
    }
    for (let i = 1; i < pathLengthRadial; i++) {
        potentialTileIndex = MovementManager.moveRadial(board, tileIndex, i);
        if (potentialTileIndex === undefined)
            break;
        potentialTile = board.Tiles[potentialTileIndex];
        console.log("In", potentialTileIndex);
        if (potentialTile.TeamID === team)
            break;
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
        if (potentialTile.TeamID !== undefined)
            break;
    }
    for (let i = -1; i > -pathLengthRadial; i--) {
        potentialTileIndex = MovementManager.moveRadial(board, tileIndex, i);
        if (potentialTileIndex === undefined)
            break;
        potentialTile = board.Tiles[potentialTileIndex];
        console.log("Out", potentialTileIndex);
        if (potentialTile.TeamID === team)
            break;
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
        if (potentialTile.TeamID !== undefined)
            break;
    }
    return possibleMoves;
};
MovementManager.possibleMoveFunctions[5] = (board, tileIndex, teamID) => {
    const possibleMoves = [];
    const tile = board.Tiles[tileIndex];
    const team = teamID || tile.TeamID;
    let potentialTileIndex;
    let potentialTile;
    for (let i = -1; i < 2; i += 2) {
        potentialTileIndex = MovementManager.moveRadial(board, tileIndex, i);
        if (potentialTileIndex === undefined)
            continue;
        potentialTile = board.Tiles[potentialTileIndex];
        if (potentialTile.TeamID === team)
            continue;
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
    }
    for (let i = -1; i < 2; i += 2) {
        potentialTileIndex = MovementManager.moveTangential(board, tileIndex, i);
        potentialTile = board.Tiles[potentialTileIndex];
        if (potentialTile.TeamID === team)
            continue;
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
    }
    for (let i = -1; i < 2; i += 2) {
        potentialTileIndex = MovementManager.moveDiagonalRight(board, tileIndex, i);
        potentialTile = board.Tiles[potentialTileIndex];
        if (potentialTile.TeamID === team)
            continue;
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
    }
    for (let i = -1; i < 2; i += 2) {
        potentialTileIndex = MovementManager.moveDiagonalLeft(board, tileIndex, i);
        potentialTile = board.Tiles[potentialTileIndex];
        if (potentialTile.TeamID === team)
            continue;
        if (!possibleMoves.includes(potentialTileIndex))
            possibleMoves.push(potentialTileIndex);
    }
    return possibleMoves;
};
export default MovementManager;
//# sourceMappingURL=movementManager.js.map