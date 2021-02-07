const Physicals = new Map();
;
const addParticle = (position, velocity, radius) => {
    const nextIndex = Physicals.size;
    Physicals.set(nextIndex, { position: position, velocity: velocity, radius: radius });
    return nextIndex;
};
export default {
    addParticle
};
//# sourceMappingURL=particles.js.map