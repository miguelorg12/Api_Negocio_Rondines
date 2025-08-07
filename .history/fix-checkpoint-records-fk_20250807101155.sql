-- Script para verificar y crear las FK de checkpoint_records

-- 1. Verificar si la tabla existe
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'checkpoint_records'
);

-- 2. Verificar si las FK existen
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='checkpoint_records';

-- 3. Crear las FK si no existen (ejecutar solo si no existen)
-- FK para patrol_assignment_id
ALTER TABLE checkpoint_records 
ADD CONSTRAINT fk_checkpoint_records_patrol_assignment 
FOREIGN KEY (patrol_assignment_id) 
REFERENCES patrol_assignments(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- FK para checkpoint_id
ALTER TABLE checkpoint_records 
ADD CONSTRAINT fk_checkpoint_records_checkpoint 
FOREIGN KEY (checkpoint_id) 
REFERENCES checkpoints(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- 4. Verificar la estructura de la tabla
\d checkpoint_records
