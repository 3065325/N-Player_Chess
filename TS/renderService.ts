import Boards from "./board.js";
import { c } from "./canvas.js";
import Tiles from "./tile.js";

type Vector2D = [number, number];
type Vector2DString = [string, string];
type Vector3DString = [string, string, string];

const PI: number = Math.PI;
const mod: (a: number, b: number) => number = (a, b) => { return (a % b + b) % b };
const floor: (x: number) => number = Math.floor;
const cos: (x: number) => number = Math.cos;
const sin: (x: number) => number = Math.sin;

class BoardService {
    public static Centers: Array<Vector2D> = [];
    public static InnerRadii: Array<number> = [];
    public static OuterRadii: Array<number> = [];
    public static Colors: Array<Vector3DString> = [];

    public static createBoard(center: Vector2D, innerRadius: number, outerRadius: number, colors: Vector3DString, playerCount: number, rowCount?: number, columnsPerPlayer?: number): number {
        const boardIndex: number = Boards.createBoard(playerCount, rowCount, columnsPerPlayer);

        BoardService.Centers[boardIndex] = center;
        BoardService.InnerRadii[boardIndex] = innerRadius;
        BoardService.OuterRadii[boardIndex] = outerRadius;
        BoardService.Colors[boardIndex] = colors;

        return boardIndex;
    }

    public static removeBoard(boardIndex: number): void {
        Boards.removeBoard(boardIndex);

        delete BoardService.Centers[boardIndex];
        delete BoardService.InnerRadii[boardIndex];
        delete BoardService.OuterRadii[boardIndex];
        delete BoardService.Colors[boardIndex];
    }

    public static renderBoard(boardIndex: number, playerID: number, outline?: number, drawIDs?: boolean): void {
        const playerCount: number = Boards.PlayerCounts[boardIndex];
        const columnsPerPlayer: number = Boards.ColumnCountPerPlayers[boardIndex];
        const center: Vector2D = BoardService.Centers[boardIndex];
        const colors: Vector3DString = BoardService.Colors[boardIndex];
        const columnCount: number = Boards.ColumnCounts[boardIndex];
        const rowCount: number = Boards.RowCounts[boardIndex];
        const outerRadius: number = BoardService.OuterRadii[boardIndex];
        const innerRadius: number = BoardService.InnerRadii[boardIndex];
        const tileWidth: number = (outerRadius - innerRadius)/rowCount;

        if (outline) {
            c.beginPath();
            c.fillStyle = "#000000";
            c.ellipse(center[0], center[1], outerRadius + outline, outerRadius + outline, 0, 0, 2*PI, false);
            c.fill();
        }

        c.lineWidth = tileWidth;

        const angleIncrement: number = 2*PI/columnCount;
        const playerAngle: number = 2*PI/playerCount;
        const initialAngle: number = -0.5*playerAngle;
        const offsetAngle: number = initialAngle - playerID*playerAngle;
        for (let i = 0; i < rowCount; i++) {
            const radius: number = innerRadius + (i + 0.5)*tileWidth;

            for (let j = 0; j < columnCount; j++) {
                c.beginPath();

                const angle: number = j*angleIncrement;
                const nextAngle: number = (j + 1)*angleIncrement;

                const tileExists: boolean = Boards.TileIndices[boardIndex][j + i*columnCount] !== undefined;
                c.strokeStyle = tileExists ? colors[(i + j) % 2] : "#000000";
                //if (i === j) c.strokeStyle = "#ff0000";

                c.arc(center[0], center[1], radius, -(offsetAngle + angle - PI/2), -(offsetAngle + nextAngle - PI/2), true);
                c.stroke();
            }

            if (!drawIDs) continue;

            for (let j = 0; j < columnCount; j++) {
                const midAngle: number = (j + 0.5)*angleIncrement;
                
                c.fillStyle = "#ffffff";
                c.font = `${tileWidth/2.5}px Fira Code`;

                const text: string = `${i*columnCount + j}`;
                c.fillText(text, center[0] + radius*sin(offsetAngle + midAngle) - 0.5*c.measureText(text).width, center[1] +  radius*cos(offsetAngle + midAngle) + tileWidth/5);
            }
        }

        for (let i = 0; i < playerCount; i++) {
            if (Boards.MoatIDsBridged[boardIndex].get(columnCount*(rowCount - 1) + i*columnsPerPlayer) === true) continue;

            const angle: number = -(offsetAngle + i*playerAngle - PI/2);

            c.strokeStyle = colors[2];

            const cosAngle: number = cos(angle);
            const sinAngle: number = sin(angle);

            const creekRadius: number = rowCount < 3 ? rowCount : 3;

            c.beginPath();
            c.lineWidth = outerRadius*angleIncrement/30;
            c.moveTo(center[0] + outerRadius*cosAngle, center[1] + outerRadius*sinAngle);
            c.lineTo(center[0] + (outerRadius - creekRadius*tileWidth)*cosAngle, center[1] + (outerRadius - creekRadius*tileWidth)*sinAngle);
            c.stroke();

            c.beginPath();
            c.lineWidth = outerRadius*angleIncrement/15;
            c.moveTo(center[0] + outerRadius*cosAngle, center[1] + outerRadius*sinAngle);
            c.lineTo(center[0] + (outerRadius - tileWidth)*cosAngle, center[1] + (outerRadius - tileWidth)*sinAngle);
            c.stroke();
        }
    }

    public static highlightTiles(boardIndex: number, tileIDs: Array<number>, playerID: number, color: string) {
        const center: Vector2D = BoardService.Centers[boardIndex];
        const outerRadius: number = BoardService.OuterRadii[boardIndex];
        const innerRadius: number = BoardService.InnerRadii[boardIndex];
        const columnCount: number = Boards.ColumnCounts[boardIndex];
        const rowCount: number = Boards.RowCounts[boardIndex];
        const playerCount: number = Boards.PlayerCounts[boardIndex];
        const tileWidth: number = (outerRadius - innerRadius)/rowCount;

        c.lineWidth = tileWidth;
        c.strokeStyle = color;

        const angleIncrement: number = 2*PI/columnCount;
        const offsetAngle: number = -(0.5 + playerID)*2*PI/playerCount;

        tileIDs.forEach((tileID) => {
            c.beginPath();

            const tileColumn: number = mod(tileID, columnCount);
            const tileRow: number = floor(tileID / columnCount);
            const radius: number = innerRadius + (tileRow + 0.5)*tileWidth;

            const angle: number = tileColumn*angleIncrement;
            const nextAngle: number = (tileColumn + 1)*angleIncrement;

            c.arc(center[0], center[1], radius, -(offsetAngle + angle - PI/2), -(offsetAngle + nextAngle - PI/2), true);
            c.stroke();
        });
    }
}

class PieceService {
    public static Positions: Array<Vector2D> = [];
}

class PlayerService {
    public static Colors: Array<string> = [];
}

export default BoardService;