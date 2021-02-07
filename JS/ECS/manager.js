import EventService from "../Services/eventService.js";
const ComponentConstructors = new Map();
const ComponentEvents = new Map();
const Components = new Map();
let entityIndex = 0;
const ServiceEntityIndices = new Map();
const ServiceParameters = new Map();
const Services = new Map();
function containsUnorderedTuple(arr, tuple) {
    let count = tuple.length;
    let remaining = [...tuple];
    arr.forEach((value) => {
        const index = remaining.indexOf(value);
        if (index !== -1) {
            remaining.splice(index);
            if (--count === 0)
                return true;
        }
    });
    return false;
}
class Service {
    constructor(name, func, entitiesMap) {
    }
}
class ECSManager {
}
ECSManager.CreateService = (name, func, params) => {
    Services.set(name, func);
    ServiceParameters.set(name, params);
    ServiceEntityIndices.set(name, new Map());
};
ECSManager.DeleteService = (name) => {
    Services.delete(name);
    ServiceParameters.delete(name);
    ServiceEntityIndices.delete(name);
};
ECSManager.ConstructComponent = (name, properties, events) => {
    ComponentConstructors.set(name, (...args) => {
        let returnObject = {};
        let index = 0;
        Object.entries(properties).forEach((value, key) => {
            returnObject[key] = args[index++] || value;
        });
        return returnObject;
    });
    Components.set(name, new Map());
    const eventMap = new Map();
    Object.entries(events).forEach(([eventName, func]) => eventMap.set(eventName, func));
    ComponentEvents.set(name, eventMap);
    EventService.Create(`${name}OnCreation`);
    EventService.Create(`${name}OnDeletion`);
};
ECSManager.DeconstructComponent = (name) => {
    Components.delete(name);
    ComponentConstructors.delete(name);
    EventService.Delete(`${name}OnCreation`);
    EventService.Delete(`${name}OnDeletion`);
};
ECSManager.CreateComponent = (name, index, ...args) => {
    const component = ComponentConstructors.get(name)(args);
    Components.get(name).set(index, component);
    EventService.Fire(`${name}OnCreation`, component);
};
ECSManager.DeleteComponent = (name, index) => {
    const componentMap = Components.get(name);
    const component = componentMap.get(index);
    componentMap.delete(index);
    EventService.Fire(`${name}OnDeletion`, component);
};
ECSManager.CreateEntity = (componentObject) => {
    Object.entries(componentObject).forEach(([name, values]) => {
        ECSManager.CreateComponent(name, entityIndex, ...Object.values(values));
    });
    const componentNames = Object.keys(componentObject);
    ServiceParameters.forEach((params, name) => {
        if (containsUnorderedTuple(componentNames, params))
            ServiceEntityIndices.get(name).set(entityIndex, true);
    });
    console.log(entityIndex, componentObject, ComponentEvents, ComponentConstructors, Components);
    return entityIndex++;
};
ECSManager.DeleteEntity = (index) => {
    Components.forEach(componentMap => componentMap.delete(index));
    ServiceEntityIndices.forEach(indexMap => indexMap.delete(index));
};
ECSManager.GetServiceEntities = () => {
    return ServiceEntityIndices;
};
ECSManager.GetComponents = () => {
    return Components;
};
export default ECSManager;
//# sourceMappingURL=manager.js.map