const Events = new Map();
class EventService {
}
EventService.Create = (name) => {
    Events.set(name, []);
    return name;
};
EventService.Delete = (name) => {
    return Events.delete(name);
};
EventService.Connect = (name, func) => {
    return Events.get(name).push(func);
};
EventService.Disconnect = (name, connection) => {
    return Events.get(name).splice(connection);
};
EventService.Fire = (name, ...args) => {
    Events.get(name).forEach(func => func(...args));
};
export default EventService;
//# sourceMappingURL=eventService.js.map