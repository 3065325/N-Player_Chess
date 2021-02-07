import { canvas, CanvasUpdate, mousePos, vh, vw } from "./canvas.js";
import Registry from "./registry.js";
import ECSManager from "./ECS/manager.js";

ECSManager.ConstructComponent("Physical", {
    Mass: 10,
    Radius: 10,
    Position: [0, 0],
    Velocity: [0, 0]
}, {
    PhysicalOnCreation: (component: object) => {},
    PhysicalOnDeletion: (component: object) => {}
});

ECSManager.CreateService("PhysicsSystem", (entityIndices: Map<number, boolean>, componentMap: Map<number, Object>) => {

}, ["Physical"]);

ECSManager.CreateEntity({
    Physical: {
        Mass: 1,
        Radius: 1,
        Position: [10, 10],
        Velocity: [-1, 1]
    },
});

const renderLoop = setInterval(() => {
    CanvasUpdate("#111122");

}, 1000*Registry.renderDelta);