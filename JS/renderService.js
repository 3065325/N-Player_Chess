import Boards from "./board.js";
import { c } from "./canvas.js";
const PI = Math.PI;
const mod = (a, b) => { return (a % b + b) % b; };
const floor = Math.floor;
const cos = Math.cos;
const sin = Math.sin;
class Renderer {
}
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
        const center = BoardService.Centers[boardIndex];
        const colors = BoardService.Colors[boardIndex];
        const columnCount = Boards.ColumnCounts[boardIndex];
        const rowCount = Boards.RowCounts[boardIndex];
        const outerRadius = BoardService.OuterRadii[boardIndex];
        const innerRadius = BoardService.InnerRadii[boardIndex];
        const tileWidth = (outerRadius - innerRadius) / rowCount;
        if (outline) {
            c.fillStyle = "#000000";
            c.beginPath();
            c.ellipse(center[0], center[1], outerRadius + outline, outerRadius + outline, 0, 0, 2 * PI, false);
            c.fill();
        }
        c.lineWidth = tileWidth;
        const angleIncrement = 2 * PI / columnCount;
        const playerAngle = 2 * PI / Boards.PlayerCounts[boardIndex];
        const initialAngle = -0.5 * playerAngle;
        const offsetAngle = initialAngle - playerID * playerAngle;
        for (let i = 0; i < rowCount; i++) {
            const radius = innerRadius + (i + 0.5) * tileWidth;
            for (let j = 0; j < columnCount; j++) {
                c.beginPath();
                const angle = j * angleIncrement;
                const nextAngle = (j + 1) * angleIncrement;
                c.strokeStyle = colors[(i + j) % 2];
                if (i === j)
                    c.strokeStyle = "#ff0000";
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
    }
}
BoardService.Centers = [];
BoardService.InnerRadii = [];
BoardService.OuterRadii = [];
BoardService.Colors = [];
export default BoardService;
//# sourceMappingURL=renderService.js.map