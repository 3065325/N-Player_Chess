import { CanvasUpdate } from "./canvas.js";
import Registry from "./registry.js";
import ECSManager from "./ECS/manager.js";
ECSManager.ConstructComponent("Physical", {
    Mass: 10,
    Radius: 10,
    Position: [0, 0],
    Velocity: [0, 0]
}, {
    PhysicalOnCreation: (component) => { },
    PhysicalOnDeletion: (component) => { }
});
ECSManager.CreateService("PhysicsSystem", (entityIndices, componentMap) => {
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
}, 1000 * Registry.renderDelta);
//# sourceMappingURL=render.js.map