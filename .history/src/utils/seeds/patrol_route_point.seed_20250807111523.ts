import { AppDataSource } from "@configs/data-source";
import { PatrolRoutePoint } from "@entities/patrol_route_point.entity";
import { Patrol } from "@entities/patrol.entity";
import { Checkpoint } from "@entities/checkpoint.entity";

export const seedPatrolRoutePoints = async () => {
  const patrolRoutePointRepository = AppDataSource.getRepository(PatrolRoutePoint);
  const patrolRepository = AppDataSource.getRepository(Patrol);
  const checkpointRepository = AppDataSource.getRepository(Checkpoint);

  try {
    // Obtener las patrullas existentes
    const patrols = await patrolRepository.find();
    
    // Obtener los checkpoints existentes
    const checkpoints = await checkpointRepository.find();

    if (patrols.length === 0) {
      console.log("No hay patrullas disponibles para crear route points");
      return;
    }

    if (checkpoints.length === 0) {
      console.log("No hay checkpoints disponibles para crear route points");
      return;
    }

    const routePoints = [];

    // Para cada patrulla, asignar algunos checkpoints en orden
    for (const patrol of patrols) {
      // Seleccionar algunos checkpoints aleatorios para esta patrulla
      const selectedCheckpoints = checkpoints.slice(0, Math.floor(Math.random() * 4) + 2); // Entre 2 y 5 checkpoints

      for (let i = 0; i < selectedCheckpoints.length; i++) {
        const checkpoint = selectedCheckpoints[i];
        
        // Crear coordenadas aleatorias para el route point
        const latitude = 19.4326 + (Math.random() - 0.5) * 0.1; // Aproximadamente CDMX
        const longitude = -99.1332 + (Math.random() - 0.5) * 0.1;

        const routePoint = patrolRoutePointRepository.create({
          patrol,
          checkpoint,
          order: i + 1, // Orden secuencial
          latitude,
          longitude,
          address: `Dirección ${i + 1} para ${patrol.name}`,
          formatted_address: `Formatted Address ${i + 1}, ${patrol.name}`,
        });

        routePoints.push(routePoint);
      }
    }

    await patrolRoutePointRepository.save(routePoints);

    console.log(`✅ Se crearon ${routePoints.length} patrol route points`);
  } catch (error) {
    console.error("❌ Error al crear patrol route points:", error);
  }
};
