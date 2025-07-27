import { AppDataSource } from "@configs/data-source";
import { PatrolAssignment } from "@entities/patrol_assigment.entity";

export async function seedPatrolAssignments() {
  const patrolAssignmentRepository =
    AppDataSource.getRepository(PatrolAssignment);

  const patrolAssignments = [
    {
      date: new Date("2023-10-01T08:00:00Z"),
      user: { id: 5 },
      patrol: { id: 1 },
      shift: { id: 1 },
    },
    {
      date: new Date("2023-10-01T16:00:00Z"),
      user: { id: 6 },
      patrol: { id: 2 },
      shift: { id: 2 },
    },
    {
      date: new Date("2023-10-02T08:00:00Z"),
      user: { id: 6 },
      patrol: { id: 3 },
      shift: { id: 3 },
    },
  ];
  for (const assignmentData of patrolAssignments) {
    const patrolAssignment = patrolAssignmentRepository.create(assignmentData);
    await patrolAssignmentRepository.save(patrolAssignment);
  }
  console.log("Patrol assignments seeded successfully");
}
