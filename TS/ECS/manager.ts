import EventService from "../Services/eventService.js";

const ComponentConstructors: Map<string, Function> = new Map();
const ComponentEvents: Map<string, Map<string, Function>> = new Map();
const Components: Map<string, Map<number, Object>> = new Map();
let entityIndex: number = 0;

const ServiceEntityIndices: Map<string, Map<number, boolean>> = new Map()
const ServiceParameters: Map<string, string[]> = new Map();
const Services: Map<string, Function> = new Map();

function containsUnorderedTuple(arr: any[], tuple: any[]): boolean {
    let count: number = tuple.length;

    let remaining = [...tuple];
    arr.forEach((value) => {
        const index = remaining.indexOf(value);
        if (index !== -1) {
            remaining.splice(index);

            if (--count === 0) return true;
        }
    });

    return false;
}

class Service {
    Entities
    
    constructor(name: string, func: Function, entitiesMap: Map<number, boolean>) {

    }
}

class ECSManager {
    public static CreateService = (name: string, func: Function, params: string[]): void => {
        Services.set(name, func);
        ServiceParameters.set(name, params);
        ServiceEntityIndices.set(name, new Map())
    }

    public static DeleteService = (name: string): void => {
        Services.delete(name);
        ServiceParameters.delete(name);
        ServiceEntityIndices.delete(name);
    }

    public static ConstructComponent = (name: string, properties: Object, events: Object): void => {
        ComponentConstructors.set(name, (...args: any[]) => {
            let returnObject = {};

            let index = 0;
            Object.entries(properties).forEach((value, key) => {
                returnObject[key] = args[index++] || value;
            });

            return returnObject;
        });

        Components.set(name, new Map());

        const eventMap: Map<string, Function> = new Map();
        Object.entries(events).forEach(([eventName, func]) => eventMap.set(eventName, func));
        ComponentEvents.set(name, eventMap);

        EventService.Create(`${name}OnCreation`);
        EventService.Create(`${name}OnDeletion`);
    }

    public static DeconstructComponent = (name: string): void => {
        Components.delete(name);
        ComponentConstructors.delete(name);

        EventService.Delete(`${name}OnCreation`);
        EventService.Delete(`${name}OnDeletion`);
    }

    public static CreateComponent = (name: string, index: number, ...args: any[]): void => {
        const component = ComponentConstructors.get(name)!(args);
        Components.get(name)!.set(index, component);

        EventService.Fire(`${name}OnCreation`, component);
    }

    public static DeleteComponent = (name: string, index: number) => {
        const componentMap = Components.get(name)!;
        const component = componentMap.get(index);
        componentMap.delete(index);

        EventService.Fire(`${name}OnDeletion`, component);
    }

    public static CreateEntity = (componentObject: object): number => {
        Object.entries(componentObject).forEach(([name, values]) => {
            ECSManager.CreateComponent(name, entityIndex, ...Object.values(values));
        });

        const componentNames: string[] = Object.keys(componentObject);
        ServiceParameters.forEach((params, name) => {
            if (containsUnorderedTuple(componentNames, params)) ServiceEntityIndices.get(name)!.set(entityIndex, true);
        });

        console.log(entityIndex, componentObject, ComponentEvents, ComponentConstructors, Components)

        return entityIndex++;
    }

    public static DeleteEntity = (index: number): void => {
        Components.forEach(componentMap => componentMap.delete(index));

        ServiceEntityIndices.forEach(indexMap => indexMap.delete(index));
    }

    public static GetServiceEntities = (): Map<string, Map<number, boolean>> => {
        return ServiceEntityIndices;
    }

    public static GetComponents = (): Map<string, Map<number, Object>> => {
        return Components;
    }
}

export default ECSManager;