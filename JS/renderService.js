import Boards from "./board.js";
import { c } from "./canvas.js";
const PI = Math.PI;
const mod = (a, b) => { return (a % b + b) % b; };
const floor = Math.floor;
const cos = Math.cos;
const sin = Math.sin;
class BoardService {
    static createBoard(center, innerRadius, outerRadius, colors, playerCount, rowCount, columnsPerPlayer) {
        const boardIndex = Boards.createBoard(playerCount, rowCount, columnsPerPlayer);
        BoardService.Centers[boardIndex] = center;
        BoardService.InnerRadii[boardIndex] = innerRadius;
        BoardService.OuterRadii[boardIndex] = outerRadius;
        BoardService.Colors[boardIndex] = colors;
        return boardIndex;
    }
    static removeBoard(boardIndex) {
        Boards.removeBoard(boardIndex);
        delete BoardService.Centers[boardIndex];
        delete BoardService.InnerRadii[boardIndex];
        delete BoardService.OuterRadii[boardIndex];
        delete BoardService.Colors[boardIndex];
    }
    static renderBoard(boardIndex, playerID, outline, drawIDs) {
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
            }
            if (!drawIDs)
                continue;
            for (let j = 0; j < columnCount; j++) {
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
    }
    static highlightTiles(boardIndex, tileIDs, playerID, color) {
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
        const offsetAngle = -(0.5 + playerID) * 2 * PI / playerCount;
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
}
BoardService.Centers = [];
BoardService.InnerRadii = [];
BoardService.OuterRadii = [];
BoardService.Colors = [];
class PieceService {
}
PieceService.Positions = [];
class PlayerService {
}
PlayerService.Colors = [];
export default BoardService;
//# sourceMappingURL=renderService.js.map