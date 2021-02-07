const Physicals: Map<number, object> = new Map();

interface Vector2 {x: number, y: number};

interface Physical {positionj: Vector2, velocity: Vector2, radius: number}

const addParticle = (position: Vector2, velocity: Vector2, radius: number): number => {
    const nextIndex = Physicals.size;
    
    Physicals.set(nextIndex, {position: position, velocity: velocity, radius: radius});
    
    return nextIndex;
}

export default {
    addParticle
}