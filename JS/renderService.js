import Boards from "./board.js";
import { c } from "./canvas.js";
import MovementService from "./movementService.js";
import Pieces from "./pieces.js";
import Players from "./player.js";
import Registry from "./registry.js";
import Tiles from "./tile.js";
const PI = Math.PI;
const mod = (a, b) => { return (a % b + b) % b; };
const floor = Math.floor;
const ceil = Math.ceil;
const cos = Math.cos;
const sin = Math.sin;
class BoardService {
    static createBoard(center, innerRadius, outerRadius, colors, playerCount, rowCount, columnsPerPlayer) {
        const boardIndex = Boards.createBoard(playerCount, rowCount, columnsPerPlayer);
        center[1] *= -1;
        BoardService.Centers[boardIndex] = center;
        BoardService.InnerRadii[boardIndex] = innerRadius;
        BoardService.OuterRadii[boardIndex] = outerRadius;
        BoardService.Colors[boardIndex] = colors;
        BoardService.SelectedTileIDs[boardIndex] = undefined;
        for (let i = 0; i < Boards.PlayerIndices[boardIndex].length; i++) {
            const playerIndex = Boards.PlayerIndices[boardIndex][i];
            PlayerService.Colors[playerIndex] = `hsl(${i * 300 / playerCount}, 80%, 40%)`;
        }
        return boardIndex;
    }
    static removeBoard(boardIndex) {
        Boards.removeBoard(boardIndex);
        delete BoardService.Centers[boardIndex];
        delete BoardService.InnerRadii[boardIndex];
        delete BoardService.OuterRadii[boardIndex];
        delete BoardService.Colors[boardIndex];
        delete BoardService.SelectedTileIDs[boardIndex];
    }
    static renderBoard(boardIndex, outline, drawIDs) {
        const playerID = Boards.CurrentPlayers[boardIndex] || 0;
        const playerCount = Boards.PlayerCounts[boardIndex];
        const columnsPerPlayer = Boards.ColumnCountPerPlayers[boardIndex];
        const center = BoardService.Centers[boardIndex];
        const colors = BoardService.Colors[boardIndex];
        const columnCount = Boards.ColumnCounts[boardIndex];
        const rowCount = Boards.RowCounts[boardIndex];
        const outerRadius = BoardService.OuterRadii[boardIndex];
        const innerRadius = BoardService.InnerRadii[boardIndex];
        const tileWidth = (outerRadius - innerRadius) / rowCount;
        if (outline) {
            c.beginPath();
            c.fillStyle = "#000000";
            c.ellipse(center[0], center[1], outerRadius + outline, outerRadius + outline, 0, 0, 2 * PI, false);
            c.fill();
        }
        c.lineWidth = tileWidth;
        const angleIncrement = 2 * PI / columnCount;
        const playerAngle = 2 * PI / playerCount;
        const initialAngle = -0.5 * playerAngle;
        const offsetAngle = initialAngle - playerID * playerAngle;
        for (let i = 0; i < rowCount; i++) {
            const radius = innerRadius + (i + 0.5) * tileWidth;
            for (let j = 0; j < columnCount; j++) {
                c.beginPath();
                const angle = j * angleIncrement;
                const nextAngle = (j + 1) * angleIncrement;
                const tileExists = Boards.TileIndices[boardIndex][j + i * columnCount] !== undefined;
                c.strokeStyle = tileExists ? colors[(i + j) % 2] : "#000000";
                c.arc(center[0], center[1], radius, -(offsetAngle + angle - PI / 2), -(offsetAngle + nextAngle - PI / 2), true);
                c.stroke();
                if (!drawIDs)
                    continue;
                const midAngle = (j + 0.5) * angleIncrement;
                c.fillStyle = "#ffffff";
                c.font = `${tileWidth / 2.5}px Fira Code`;
                const text = `${i * columnCount + j}`;
                c.fillText(text, center[0] + radius * sin(offsetAngle + midAngle) - 0.5 * c.measureText(text).width, center[1] + radius * cos(offsetAngle + midAngle) + tileWidth / 5);
            }
        }
        for (let i = 0; i < playerCount; i++) {
            if (Boards.MoatIDsBridged[boardIndex].get(columnCount * (rowCount - 1) + i * columnsPerPlayer) === true)
                continue;
            const angle = -(offsetAngle + i * playerAngle - PI / 2);
            c.strokeStyle = colors[2];
            const cosAngle = cos(angle);
            const sinAngle = sin(angle);
            const creekRadius = rowCount < 3 ? rowCount : 3;
            c.beginPath();
            c.lineWidth = outerRadius * angleIncrement / 30;
            c.moveTo(center[0] + outerRadius * cosAngle, center[1] + outerRadius * sinAngle);
            c.lineTo(center[0] + (outerRadius - creekRadius * tileWidth) * cosAngle, center[1] + (outerRadius - creekRadius * tileWidth) * sinAngle);
            c.stroke();
            c.beginPath();
            c.lineWidth = outerRadius * angleIncrement / 15;
            c.moveTo(center[0] + outerRadius * cosAngle, center[1] + outerRadius * sinAngle);
            c.lineTo(center[0] + (outerRadius - tileWidth) * cosAngle, center[1] + (outerRadius - tileWidth) * sinAngle);
            c.stroke();
        }
        Boards.PlayerIndices[boardIndex].forEach((playerIndex) => {
            Players.Pieces[playerIndex].forEach((pieceIndex) => {
                const tileID = Pieces.TileIDs[pieceIndex];
                if (tileID === undefined)
                    return;
                const [tileRow, tileColumn] = MovementService.getTileIDRowColumn(boardIndex, tileID);
                const radius = innerRadius + (tileRow + 0.5) * tileWidth;
                const midAngle = (tileColumn + 0.5) * angleIncrement;
                PieceService.renderPiece(pieceIndex, [center[0] + radius * sin(offsetAngle + midAngle), center[1] + radius * cos(offsetAngle + midAngle)], tileWidth * 0.5);
            });
        });
    }
    static highlightTiles(boardIndex, tileIDs, color) {
        const playerID = Boards.CurrentPlayers[boardIndex] || 0;
        const center = BoardService.Centers[boardIndex];
        const outerRadius = BoardService.OuterRadii[boardIndex];
        const innerRadius = BoardService.InnerRadii[boardIndex];
        const columnCount = Boards.ColumnCounts[boardIndex];
        const rowCount = Boards.RowCounts[boardIndex];
        const playerCount = Boards.PlayerCounts[boardIndex];
        const tileWidth = (outerRadius - innerRadius) / rowCount;
        c.lineWidth = tileWidth;
        c.strokeStyle = color;
        const angleIncrement = 2 * PI / columnCount;
        const offsetAngle = -(1 + 2 * playerID) * PI / playerCount;
        tileIDs.forEach((tileID) => {
            c.beginPath();
            const tileColumn = mod(tileID, columnCount);
            const tileRow = floor(tileID / columnCount);
            const radius = innerRadius + (tileRow + 0.5) * tileWidth;
            const angle = tileColumn * angleIncrement;
            const nextAngle = (tileColumn + 1) * angleIncrement;
            c.arc(center[0], center[1], radius, -(offsetAngle + angle - PI / 2), -(offsetAngle + nextAngle - PI / 2), true);
            c.stroke();
        });
    }
    static pointToBoard(boardIndex, point) {
        const playerID = Boards.CurrentPlayers[boardIndex] || 0;
        const playerCount = Boards.PlayerCounts[boardIndex];
        const center = BoardService.Centers[boardIndex];
        const newX = point[0] - center[0];
        const newY = point[1] + center[1];
        const radius = Math.sqrt(Math.pow(newX, 2) + Math.pow(newY, 2));
        const angle = mod(-Math.atan(newX / newY) + PI * ceil(newY / (2 * radius)) + (PI / playerCount) * (1 + 2 * playerID), 2 * PI);
        return [radius, angle];
    }
    static polarToTileID(boardIndex, polar) {
        const innerRadius = BoardService.InnerRadii[boardIndex];
        const outerRadius = BoardService.OuterRadii[boardIndex];
        const columnCount = Boards.ColumnCounts[boardIndex];
        const rowCount = Boards.RowCounts[boardIndex];
        return floor(columnCount * (polar[1]) / (2 * PI)) + columnCount * floor(rowCount * (innerRadius - polar[0]) / (innerRadius - outerRadius));
    }
    static selectTileID(boardIndex, point) {
        const playerID = Boards.CurrentPlayers[boardIndex] || 0;
        console.log(playerID, boardIndex, Boards.CurrentPlayers);
        const currentSelected = BoardService.SelectedTileIDs[boardIndex];
        const polarPoint = BoardService.pointToBoard(boardIndex, point);
        const tileID = BoardService.polarToTileID(boardIndex, polarPoint);
        if (tileID < 0 || tileID >= Boards.TileIndices[boardIndex].length) {
            BoardService.SelectedTileIDs[boardIndex] = undefined;
            return;
        }
        const tileIndex = Boards.TileIndices[boardIndex][tileID];
        const pieceIndex = Tiles.Occupations[tileIndex];
        if (tileID === currentSelected) {
            BoardService.SelectedTileIDs[boardIndex] = undefined;
            return;
        }
        if (currentSelected === undefined && pieceIndex !== undefined && Pieces.PlayerIndices[pieceIndex] !== Boards.PlayerIndices[boardIndex][playerID]) {
            BoardService.SelectedTileIDs[boardIndex] = undefined;
            return;
        }
        if (currentSelected !== undefined) {
            const attackingTileIndex = Boards.TileIndices[boardIndex][currentSelected];
            const attackingPieceIndex = Tiles.Occupations[attackingTileIndex];
            if (attackingPieceIndex === undefined) {
                BoardService.SelectedTileIDs[boardIndex] = undefined;
                return;
            }
            const attackingPieceType = Pieces.PieceTypes[attackingPieceIndex];
            const attackingPieceHasCrossed = Pieces.HasCrossed.get(attackingPieceIndex);
            const attackingPieceHasMoved = Pieces.HasMoved.get(attackingPieceIndex);
            console.log(attackingPieceIndex, attackingPieceType, attackingPieceHasCrossed, attackingPieceHasMoved);
            const possibleMoves = MovementService.getPossibleMovesFunction(boardIndex, currentSelected, playerID, attackingPieceType, attackingPieceHasCrossed, attackingPieceHasMoved);
            const possibleAttacks = MovementService.getPossibleAttacksFunction(boardIndex, currentSelected, playerID, attackingPieceType, attackingPieceHasCrossed, attackingPieceHasMoved);
            console.log(tileID, possibleAttacks.indexOf(tileID) === -1, possibleMoves.indexOf(tileID) === -1);
            if (possibleAttacks.indexOf(tileID) === -1 && possibleMoves.indexOf(tileID) === -1) {
                BoardService.SelectedTileIDs[boardIndex] = undefined;
                return;
            }
            Boards.movePiece(boardIndex, currentSelected, tileID);
            setTimeout(() => {
                Boards.iterateCurrentPlayer(boardIndex);
            }, 1000);
            BoardService.SelectedTileIDs[boardIndex] = undefined;
            return;
        }
        BoardService.SelectedTileIDs[boardIndex] = tileID;
    }
    static renderSelectedTile(boardIndex, color) {
        const playerID = Boards.CurrentPlayers[boardIndex] || 0;
        const tileID = BoardService.SelectedTileIDs[boardIndex];
        if (tileID === undefined)
            return;
        BoardService.highlightTiles(boardIndex, [tileID], color);
        const tileIndex = Boards.TileIndices[boardIndex][tileID];
        const pieceIndex = Tiles.Occupations[tileIndex];
        if (pieceIndex === undefined)
            return;
        const playerIndex = Pieces.PlayerIndices[pieceIndex];
        const pieceType = Pieces.PieceTypes[pieceIndex];
        const pieceHasCrossed = Pieces.HasCrossed.get(pieceIndex);
        const pieceHasMoved = Pieces.HasMoved.get(pieceIndex);
        const possibleMoves = MovementService.getPossibleMovesFunction(boardIndex, tileID, playerID, pieceType, pieceHasCrossed, pieceHasMoved);
        const possibleAttacks = MovementService.getPossibleAttacksFunction(boardIndex, tileID, playerID, pieceType, pieceHasCrossed, pieceHasMoved);
        BoardService.highlightTiles(boardIndex, possibleMoves, Registry.moveColor);
        BoardService.highlightTiles(boardIndex, possibleAttacks, Registry.attackColor);
    }
}
BoardService.Centers = [];
BoardService.InnerRadii = [];
BoardService.OuterRadii = [];
BoardService.Colors = [];
BoardService.SelectedTileIDs = [];
class PieceService {
    static renderPiece(pieceIndex, position, radius) {
        const pieceType = Pieces.PieceTypes[pieceIndex];
        const playerIndex = Pieces.PlayerIndices[pieceIndex];
        const color = PlayerService.Colors[playerIndex];
        c.beginPath();
        c.fillStyle = color;
        c.ellipse(position[0], position[1], radius, radius, 0, 0, 2 * PI, false);
        c.fill();
        c.fillStyle = "#FFFFFF";
        c.font = `${radius * 1.8}px Fira Code`;
        const text = PieceService.ImageSources[pieceType];
        c.fillText(text, position[0] - 0.5 * c.measureText(text).width, position[1] + 0.7 * radius);
    }
}
PieceService.LoadedImages = [];
PieceService.ImageSources = [
    "P",
    "N",
    "B",
    "R",
    "Q",
    "K"
];
class PlayerService {
}
PlayerService.Colors = [];
export { BoardService, PieceService };
//# sourceMappingURL=renderService.js.map