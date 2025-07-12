# Api_Negocio_Rondines
Este repositorio es todo lo referente a la API de negocio para el proyecto de 9no de igmar

## Migraciones y Seeders

### Migraciones

Las migraciones te permiten versionar y actualizar la estructura de la base de datos.

- **Generar una nueva migración:**
  
  ```bash
  npm run migration:generate
  ```

  Esto creará una nueva migración en `src/utils/migrations`.

- **Ejecutar migraciones pendientes:**

  ```bash
  npm run migrate
  ```

- **Revertir la última migración:**

  ```bash
  npm run migrate:revert
  ```

---

### Seeders

Los seeders te permiten poblar la base de datos con datos de prueba o iniciales.

- **Ejecutar seeders:**

  ```bash
  npm run seed
  ```

Esto inicializará la base de datos y ejecutará los scripts de seed ubicados en `src/utils/seeds`.

