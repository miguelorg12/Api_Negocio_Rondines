import { AppDataSource } from "@configs/data-source";
import { Checkpoint } from "@entities/checkpoint.entity";
import { Branch } from "@entities/branch.entity";
import { Network } from "@entities/network.entity";

export async function seedCheckpoints() {
  const checkpointRepository = AppDataSource.getRepository(Checkpoint);
  const branchRepository = AppDataSource.getRepository(Branch);
  const networkRepository = AppDataSource.getRepository(Network);

  // Obtener branches existentes
  const branches = await branchRepository.find();
  if (branches.length === 0) {
    console.log("No hay branches disponibles para crear checkpoints");
    return;
  }

  // Crear o obtener redes para cada branch
  const networks: Network[] = [];
  for (const branch of branches) {
    let network = await networkRepository.findOne({
      where: { branch: { id: branch.id } },
    });

    if (!network) {
      network = networkRepository.create({
        ssid: `Red_${branch.name || branch.id}`,
        password: "password123",
        branch: { id: branch.id },
      });
      await networkRepository.save(network);
      console.log(
        `✅ Created network: ${network.ssid} for branch ${branch.id}`
      );
    } else {
      console.log(
        `⚠️  Network ${network.ssid} already exists for branch ${branch.id}`
      );
    }
    networks.push(network);
  }

  const checkpoints = [
    // Checkpoints para la primera branch
    {
      name: "Entrada Principal",
      branch: { id: branches[0].id },
      network: { id: networks[0].id },
    },
    {
      name: "Recepción",
      branch: { id: branches[0].id },
      network: { id: networks[0].id },
    },
    {
      name: "Estacionamiento",
      branch: { id: branches[0].id },
      network: { id: networks[0].id },
    },
    {
      name: "Sala de Espera",
      branch: { id: branches[0].id },
      network: { id: networks[0].id },
    },
    {
      name: "Pasillo Principal",
      branch: { id: branches[0].id },
      network: { id: networks[0].id },
    },
    {
      name: "Salida de Emergencia",
      branch: { id: branches[0].id },
      network: { id: networks[0].id },
    },
    // Checkpoints para la segunda branch (si existe)
    ...(branches.length > 1
      ? [
          {
            name: "Entrada Secundaria",
            branch: { id: branches[1].id },
            network: { id: networks[1].id },
          },
          {
            name: "Área de Oficinas",
            branch: { id: branches[1].id },
            network: { id: networks[1].id },
          },
          {
            name: "Cocina",
            branch: { id: branches[1].id },
            network: { id: networks[1].id },
          },
          {
            name: "Baños",
            branch: { id: branches[1].id },
            network: { id: networks[1].id },
          },
          {
            name: "Sótano",
            branch: { id: branches[1].id },
            network: { id: networks[1].id },
          },
          {
            name: "Terraza",
            branch: { id: branches[1].id },
            network: { id: networks[1].id },
          },
        ]
      : []),
    // Checkpoints para la tercera branch (si existe)
    ...(branches.length > 2
      ? [
          {
            name: "Entrada Norte",
            branch: { id: branches[2].id },
            network: { id: networks[2].id },
          },
          {
            name: "Área de Servicios",
            branch: { id: branches[2].id },
            network: { id: networks[2].id },
          },
          {
            name: "Almacén",
            branch: { id: branches[2].id },
            network: { id: networks[2].id },
          },
          {
            name: "Sala de Reuniones",
            branch: { id: branches[2].id },
            network: { id: networks[2].id },
          },
          {
            name: "Área de Descanso",
            branch: { id: branches[2].id },
            network: { id: networks[2].id },
          },
          {
            name: "Salida Trasera",
            branch: { id: branches[2].id },
            network: { id: networks[2].id },
          },
        ]
      : []),
  ];

  for (const checkpointData of checkpoints) {
    const existingCheckpoint = await checkpointRepository.findOne({
      where: {
        name: checkpointData.name,
        branch: { id: checkpointData.branch.id },
      },
    });

    if (existingCheckpoint) {
      console.log(
        `⚠️  Checkpoint ${checkpointData.name} already exists in branch ${checkpointData.branch.id}`
      );
    } else {
      const checkpoint = checkpointRepository.create(checkpointData);
      await checkpointRepository.save(checkpoint);
      console.log(
        `✅ Created checkpoint: ${checkpointData.name} for branch ${checkpointData.branch.id} with network ${checkpointData.network.id}`
      );
    }
  }

  console.log("Checkpoints seeded successfully");
}
