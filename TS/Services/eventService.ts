const Events: Map<string, Function[]> = new Map();

class EventService {
    public static Create = (name: string): string => {
        Events.set(name, []);

        return name;
    }

    public static Delete = (name: string): boolean => {
        return Events.delete(name);
    }

    public static Connect = (name: string, func: Function): number | undefined => {
        return Events.get(name)!.push(func);
    }

    public static Disconnect = (name: string, connection: number): Function[] => {
        return Events.get(name)!.splice(connection);
    }

    public static Fire = (name: string, ...args: any[]): void => {
        Events.get(name)!.forEach(func => func(...args));
    }
}

export default EventService;