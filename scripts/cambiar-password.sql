-- ============================================
-- SCRIPT PARA CAMBIAR CONTRASEÑA EN SUPABASE
-- ============================================

-- PASO 1: Generar el hash de bcrypt
-- Necesitás generar el hash primero con bcryptjs
-- Podés usar este sitio: https://bcrypt-generator.com/
-- O ejecutar el script Node.js (cambiar-password.js)

-- PASO 2: Actualizar la contraseña
-- Reemplazá 'HASH_GENERADO_AQUI' con el hash que generaste
-- Reemplazá 'admin@growshop.com' con el email del usuario

UPDATE users
SET password = 'HASH_GENERADO_AQUI'
WHERE email = 'admin@growshop.com';

-- Verificar que se actualizó
SELECT id, email, name, role,
       substring(password, 1, 10) as password_hash_preview
FROM users
WHERE email = 'admin@growshop.com';

-- ============================================
-- EJEMPLO COMPLETO
-- ============================================
-- Si la nueva contraseña es "miNuevaPassword123"
-- Y generaste el hash: $2a$10$abcd1234...
-- El UPDATE quedaría así:

-- UPDATE users
-- SET password = '$2a$10$abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yzAB'
-- WHERE email = 'admin@growshop.com';
