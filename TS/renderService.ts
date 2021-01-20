import Boards from "./board.js";
import { c } from "./canvas.js";
import MovementService from "./movementService.js";
import { PieceTypes } from "./pieceData.js";
import Pieces from "./pieces.js";
import Players from "./player.js";
import Registry from "./registry.js";
import Tiles from "./tile.js";

type Vector2D = [number, number];
type Vector2DString = [string, string];
type Vector3DString = [string, string, string];

const PI: number = Math.PI;
const mod: (a: number, b: number) => number = (a, b) => { return (a % b + b) % b };
const floor: (x: number) => number = Math.floor;
const ceil: (x: number) => number = Math.ceil;
const cos: (x: number) => number = Math.cos;
const sin: (x: number) => number = Math.sin;

class BoardService {
    public static Centers: Array<Vector2D> = [];
    public static InnerRadii: Array<number> = [];
    public static OuterRadii: Array<number> = [];
    public static Colors: Array<Vector3DString> = [];

    public static SelectedTileIDs: Array<number | undefined> = [];

    public static createBoard(center: Vector2D, innerRadius: number, outerRadius: number, colors: Vector3DString, playerCount: number, rowCount?: number, columnsPerPlayer?: number): number {
        const boardIndex: number = Boards.createBoard(playerCount, rowCount, columnsPerPlayer);

        center[1] *= -1;
        BoardService.Centers[boardIndex] = center;
        BoardService.InnerRadii[boardIndex] = innerRadius;
        BoardService.OuterRadii[boardIndex] = outerRadius;
        BoardService.Colors[boardIndex] = colors;

        BoardService.SelectedTileIDs[boardIndex] = undefined;

        for (let i = 0; i < Boards.PlayerIndices[boardIndex].length; i++) {
            const playerIndex: number = Boards.PlayerIndices[boardIndex][i];

            PlayerService.Colors[playerIndex] = `hsl(${i*300/playerCount}, 80%, 40%)`;
        }

        return boardIndex;
    }

    public static removeBoard(boardIndex: number): void {
        Boards.removeBoard(boardIndex);

        delete BoardService.Centers[boardIndex];
        delete BoardService.InnerRadii[boardIndex];
        delete BoardService.OuterRadii[boardIndex];
        delete BoardService.Colors[boardIndex];

        delete BoardService.SelectedTileIDs[boardIndex];
    }

    public static renderBoard(boardIndex: number, outline?: number, drawIDs?: boolean): void {
        const playerID: number = Boards.CurrentPlayers[boardIndex] || 0;
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

                if (!drawIDs) continue;

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

        Boards.PlayerIndices[boardIndex].forEach((playerIndex: number) => {
            Players.Pieces[playerIndex].forEach((pieceIndex: number) => {
                const tileID: number | undefined = Pieces.TileIDs[pieceIndex];
                if (tileID === undefined) return;

                const [tileRow, tileColumn] = MovementService.getTileIDRowColumn(boardIndex, tileID);
                
                const radius: number = innerRadius + (tileRow + 0.5)*tileWidth;
                const midAngle: number = (tileColumn + 0.5)*angleIncrement;

                PieceService.renderPiece(pieceIndex, [center[0] + radius*sin(offsetAngle + midAngle), center[1] + radius*cos(offsetAngle + midAngle)], tileWidth*0.5);
            });
        });
    }

    public static highlightTiles(boardIndex: number, tileIDs: Array<number>, color: string) {
        const playerID: number = Boards.CurrentPlayers[boardIndex] || 0;

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
        const offsetAngle: number = -(1 + 2*playerID)*PI/playerCount;

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

    public static pointToBoard(boardIndex: number, point: Vector2D): Vector2D {
        const playerID: number = Boards.CurrentPlayers[boardIndex] || 0;

        const playerCount: number = Boards.PlayerCounts[boardIndex];
        const center: Vector2D = BoardService.Centers[boardIndex];
        const newX: number = point[0] - center[0];
        const newY: number = point[1] + center[1];
        const radius: number = Math.sqrt(newX**2 + newY**2);
        const angle: number = mod(-Math.atan(newX/newY) + PI*ceil(newY/(2*radius)) + (PI/playerCount)*(1 + 2*playerID), 2*PI);

        return [radius, angle];
    }

    public static polarToTileID(boardIndex: number, polar: Vector2D): number {
        const innerRadius: number = BoardService.InnerRadii[boardIndex];
        const outerRadius: number = BoardService.OuterRadii[boardIndex];
        const columnCount: number = Boards.ColumnCounts[boardIndex];
        const rowCount: number = Boards.RowCounts[boardIndex];

        return floor(columnCount*(polar[1])/(2*PI)) + columnCount*floor(rowCount*(innerRadius - polar[0])/(innerRadius - outerRadius));
    }

    public static selectTileID(boardIndex: number, point: Vector2D): void {
        const playerID: number = Boards.CurrentPlayers[boardIndex] || 0;
        console.log(playerID, boardIndex, Boards.CurrentPlayers)

        const currentSelected: number | undefined = BoardService.SelectedTileIDs[boardIndex];

        const polarPoint: Vector2D = BoardService.pointToBoard(boardIndex, point);
        const tileID: number = BoardService.polarToTileID(boardIndex, polarPoint);
        if (tileID < 0 || tileID >= Boards.TileIndices[boardIndex].length) {
            BoardService.SelectedTileIDs[boardIndex] = undefined;
            return;
        }

        const tileIndex: number = Boards.TileIndices[boardIndex][tileID];
        const pieceIndex: number | undefined = Tiles.Occupations[tileIndex];
        if (tileID === currentSelected) {
            BoardService.SelectedTileIDs[boardIndex] = undefined;
            return;
        }

        if (currentSelected === undefined && pieceIndex !== undefined && Pieces.PlayerIndices[pieceIndex] !== Boards.PlayerIndices[boardIndex][playerID]) {
            BoardService.SelectedTileIDs[boardIndex] = undefined;
            return;
        }
        
        if (currentSelected !== undefined) {
            const attackingTileIndex: number = Boards.TileIndices[boardIndex][currentSelected];
            const attackingPieceIndex: number | undefined = Tiles.Occupations[attackingTileIndex];
            if (attackingPieceIndex === undefined) {
                BoardService.SelectedTileIDs[boardIndex] = undefined;
                return;
            }

            const attackingPieceType: PieceTypes = Pieces.PieceTypes[attackingPieceIndex];
            const attackingPieceHasCrossed: boolean | undefined = Pieces.HasCrossed.get(attackingPieceIndex);
            const attackingPieceHasMoved: boolean | undefined = Pieces.HasMoved.get(attackingPieceIndex);

            console.log(attackingPieceIndex, attackingPieceType, attackingPieceHasCrossed, attackingPieceHasMoved)

            const possibleMoves: Array<number> = MovementService.getPossibleMovesFunction(boardIndex, currentSelected, playerID, attackingPieceType, attackingPieceHasCrossed, attackingPieceHasMoved);
            const possibleAttacks: Array<number> = MovementService.getPossibleAttacksFunction(boardIndex, currentSelected, playerID, attackingPieceType, attackingPieceHasCrossed, attackingPieceHasMoved);

            console.log(tileID, possibleAttacks.indexOf(tileID) === -1, possibleMoves.indexOf(tileID) === -1)
            if (possibleAttacks.indexOf(tileID) === -1 && possibleMoves.indexOf(tileID) === -1) {
                BoardService.SelectedTileIDs[boardIndex] = undefined;
                return;
            }
            
            Boards.movePiece(boardIndex, currentSelected, tileID);

            setTimeout(() => {
                Boards.iterateCurrentPlayer(boardIndex);
            }, 1000)

            BoardService.SelectedTileIDs[boardIndex] = undefined;

            return;
        }

        BoardService.SelectedTileIDs[boardIndex] = tileID;
    }

    public static renderSelectedTile(boardIndex: number, color: string): void {
        const playerID: number = Boards.CurrentPlayers[boardIndex] || 0;

        const tileID: number | undefined = BoardService.SelectedTileIDs[boardIndex];
        if (tileID === undefined) return;

        BoardService.highlightTiles(boardIndex, [tileID], color);

        const tileIndex: number = Boards.TileIndices[boardIndex][tileID];
        const pieceIndex: number | undefined = Tiles.Occupations[tileIndex];
        if (pieceIndex === undefined) return;

        const playerIndex: number = Pieces.PlayerIndices[pieceIndex];

        const pieceType: PieceTypes = Pieces.PieceTypes[pieceIndex];
        const pieceHasCrossed: boolean | undefined = Pieces.HasCrossed.get(pieceIndex);
        const pieceHasMoved: boolean | undefined = Pieces.HasMoved.get(pieceIndex);

        const possibleMoves: Array<number> = MovementService.getPossibleMovesFunction(boardIndex, tileID, playerID, pieceType, pieceHasCrossed, pieceHasMoved);
        const possibleAttacks: Array<number> = MovementService.getPossibleAttacksFunction(boardIndex, tileID, playerID, pieceType, pieceHasCrossed, pieceHasMoved);
        BoardService.highlightTiles(boardIndex, possibleMoves, Registry.moveColor);
        BoardService.highlightTiles(boardIndex, possibleAttacks, Registry.attackColor);
    }
}

class PieceService { // HTMLImageElement? Whats that
    public static LoadedImages: Array<HTMLImageElement> = [];

    public static ImageSources: Array<string> = [
        "P",
        "N",
        "B",
        "R",
        "Q",
        "K"
    ];

    public static renderPiece(pieceIndex: number, position: Vector2D, radius: number): void {
        const pieceType: PieceTypes = Pieces.PieceTypes[pieceIndex];
        const playerIndex: number = Pieces.PlayerIndices[pieceIndex];
        const color: string = PlayerService.Colors[playerIndex];

        c.beginPath();
        c.fillStyle = color;
        c.ellipse(position[0], position[1], radius, radius, 0, 0, 2*PI, false);
        c.fill();

        c.fillStyle = "#FFFFFF";
        c.font = `${radius*1.8}px Fira Code`;

        const text: string = PieceService.ImageSources[pieceType];
        c.fillText(text, position[0] - 0.5*c.measureText(text).width, position[1] + 0.7*radius);
    }
}

class PlayerService {
    public static Colors: Array<string> = [];
    

    // public static createPlayer(boardIndex: number, color: string): number {
    //     const playerIndex: number = Players.createPlayer(boardIndex);

    //     PlayerService.Colors[playerIndex] = color;
    //     PlayerService.Colors[playerIndex] = color;

    //     // const nextIndex: number = Players.IndexStack.pop() || Players.Counter++;

    //     // Players.BoardIndices[nextIndex] = boardIndex;
    //     // Players.Pieces[nextIndex] = [];
    //     // Players.TakenPieces[nextIndex] = [];
    //     // Players.InCheckBy[nextIndex] = undefined;
    //     // Players.IsDead[nextIndex] = false;

    //     // return nextIndex;
    // }

    // public static removePlayer(playerIndex: number): void {
    //     if (playerIndex < 0 || playerIndex >= Players.Counter) return;

    //     Players.IndexStack.push(playerIndex);

    //     delete Players.BoardIndices[playerIndex];
    //     delete Players.Pieces[playerIndex];
    //     delete Players.TakenPieces[playerIndex];
    //     delete Players.InCheckBy[playerIndex];
    //     delete Players.IsDead[playerIndex];
    // }
}

export {BoardService, PieceService};