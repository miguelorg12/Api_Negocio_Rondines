import { AppDataSource } from "@configs/data-source";
import { OauthClientsEntity } from "@interfaces/entity/oauth_clients.entity";

export async function seedClients() {
  const clientsData = [
    {
      client_id: "ronditrack-web-app",
      client_secret: "super-secret-web-app-key-123", // Este será hasheado por @BeforeInsert
      redirect_uri: "http://localhost:5173/auth/callback", // Generalmente React dev server corre en 3000
      name: "ronditrack Web Application",
      trusted_client: true,
    },
    {
      client_id: "ronditrack-mobile-android",
      client_secret: "super-secret-mobile-app-key-456", // Este será hasheado
      redirect_uri: "https://nm5tc167-3002.usw3.devtunnels.ms/auth/callback",
      name: "ronditrack Mobile Android App",
      trusted_client: true,
    },
    {
      client_id: "ronditrack-desktop-electron",
      client_secret: "super-secret-desktop-app-key-789",
      redirect_uri: "http://localhost:8080/auth/callback", // Generalmente Electron corre en 8080
      name: "ronditrack Desktop Application",
      trusted_client: true,
    },
    {
      client_id: "ronditrack-mobile-qa",
      client_secret: "super-secret-mobile-app-key-101",
      redirect_uri: "https://api-sec-qa.ronditrack.online/auth/callback",
      name: "ronditrack Mobile QA App",
      trusted_client: true,
    },
    {
      client_id: "ronditrack-web-qa",
      client_secret: "super-secret-web-app-key-123",
      redirect_uri: "https://api-sec-qa.ronditrack.online/auth/callback",
      name: "ronditrack Web QA App",
      trusted_client: true,
    },
  ];

  const clientRepository = AppDataSource.getRepository(OauthClientsEntity);
  for (const clientData of clientsData) {
    const client = clientRepository.create(clientData);
    await clientRepository.save(client);
  }
}
