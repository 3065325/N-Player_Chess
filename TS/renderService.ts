import Boards from "./board.js";
import { c } from "./canvas.js";
import Tiles from "./tile.js";

type Vector2D = [number, number];
type Vector2DString = [string, string];

const PI: number = Math.PI;
const mod: (a: number, b: number) => number = (a, b) => { return (a % b + b) % b };
const floor: (x: number) => number = Math.floor;
const cos: (x: number) => number = Math.cos;
const sin: (x: number) => number = Math.sin;

class Renderer {
    
}

class BoardService {
    public static Centers: Array<Vector2D> = [];
    public static InnerRadii: Array<number> = [];
    public static OuterRadii: Array<number> = [];
    public static Colors: Array<Vector2DString> = [];

    public static createBoard(center: Vector2D, innerRadius: number, outerRadius: number, colors: Vector2DString, playerCount: number, rowCount?: number, columnsPerPlayer?: number): number {
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
        const center: Vector2D = BoardService.Centers[boardIndex];
        const colors: Vector2DString = BoardService.Colors[boardIndex];
        const columnCount: number = Boards.ColumnCounts[boardIndex];
        const rowCount: number = Boards.RowCounts[boardIndex];
        const outerRadius: number = BoardService.OuterRadii[boardIndex];
        const innerRadius: number = BoardService.InnerRadii[boardIndex];
        const tileWidth: number = (outerRadius - innerRadius)/rowCount;

        if (outline) {
            c.fillStyle = "#000000";
            c.beginPath();
            c.ellipse(center[0], center[1], outerRadius + outline, outerRadius + outline, 0, 0, 2*PI, false);
            c.fill();
        }

        c.lineWidth = tileWidth;

        const angleIncrement: number = 2*PI/columnCount;
        const playerAngle: number = 2*PI/Boards.PlayerCounts[boardIndex];
        const initialAngle: number = -0.5*playerAngle;
        const offsetAngle: number = initialAngle - playerID*playerAngle;
        for (let i = 0; i < rowCount; i++) {
            const radius: number = innerRadius + (i + 0.5)*tileWidth;

            for (let j = 0; j < columnCount; j++) {
                c.beginPath();

                const angle: number = j*angleIncrement;
                const nextAngle: number = (j + 1)*angleIncrement;

                c.strokeStyle = colors[(i + j) % 2];
                if (i === j) c.strokeStyle = "#ff0000";

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
    }
}

export default BoardService;