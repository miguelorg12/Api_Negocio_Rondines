import { AppDataSource } from "@configs/data-source";
import { Company } from "@interfaces/entity/company.entity";

export async function seedCompanies() {
  const companyRepository = AppDataSource.getRepository(Company);
  const companies = [
    {
      name: "Tech Solutions S.A.",
      address: "Av. Reforma 123, Ciudad de México",
      email: "contacto@techsolutions.com",
      phone: "5551234567",
    },
    {
      name: "Innovatech MX",
      address: "Calle 5 de Mayo 456, Guadalajara",
      email: "info@innovatechmx.com",
      phone: "3339876543",
    },
    {
      name: "Servicios Empresariales del Norte",
      address: "Blvd. Independencia 789, Monterrey",
      email: "ventas@senorte.com",
      phone: "8187654321",
    },
  ];

  for (const companyData of companies) {
    const company = companyRepository.create(companyData);
    await companyRepository.save(company);
  }
  console.log("Companies seeded successfully");
}
