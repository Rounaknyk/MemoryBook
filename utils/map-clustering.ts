import { Memory } from '@/types/memory';

interface Cluster {
    id: string;
    lat: number;
    lng: number;
    memories: Memory[];
}

// Haversine formula to calculate distance between two points in km
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export function clusterMemories(memories: Memory[], radiusKm: number = 1): Cluster[] {
    const clusters: Cluster[] = [];
    const processedMemoryIds = new Set<string>();

    memories.forEach((memory) => {
        if (processedMemoryIds.has(memory.id) || !memory.location) return;

        const cluster: Cluster = {
            id: `cluster-${memory.id}`,
            lat: memory.location.lat,
            lng: memory.location.lng,
            memories: [memory],
        };

        processedMemoryIds.add(memory.id);

        // Find other memories within radius
        memories.forEach((otherMemory) => {
            if (
                memory.id !== otherMemory.id &&
                !processedMemoryIds.has(otherMemory.id) &&
                otherMemory.location
            ) {
                const distance = getDistanceFromLatLonInKm(
                    memory.location!.lat,
                    memory.location!.lng,
                    otherMemory.location.lat,
                    otherMemory.location.lng
                );

                if (distance <= radiusKm) {
                    cluster.memories.push(otherMemory);
                    processedMemoryIds.add(otherMemory.id);
                }
            }
        });

        clusters.push(cluster);
    });

    return clusters;
}
