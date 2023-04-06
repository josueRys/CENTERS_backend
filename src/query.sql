-- SELECCIONAR TODOS LOS USERS DE LAS CENTERS DONDE EL LOGIN ES ADMIN

SELECT u.*
FROM users u
JOIN users_centers uc ON u.id = uc.id_user
WHERE uc.id_center IN (
  SELECT uc2.id_center
  FROM users_centers uc2
  WHERE uc2.id_user = [id_del_usuario_login] AND uc2.rol = 'admin'
)

-- SELECCIONAR UN USERS DE LAS CENTERS DONDE EL LOGIN ES ADMIN

SELECT u.*
FROM users u
JOIN users_centers uc ON u.id = uc.id_user
WHERE uc.id_center IN (
  SELECT uc2.id_center
  FROM users_centers uc2
  WHERE uc2.id_user = [id_del_usuario_login] AND uc2.rol = 'admin'
) AND u.id = [id_del_usuario_ver]


-- SELECCIONAR TODAS LAS CENTERS DONDE APARECE EL USER

SELECT c.*
FROM centers c
JOIN users_centers uc ON c.id = uc.id_center
WHERE uc.id_user = [id_del_usuario]

