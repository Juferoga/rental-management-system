INSERT INTO usuario (id, nombre, apellido, correo, telefono, rol, estado)
VALUES (1, 'Carlos', 'Ramirez', 'carlos.ramirez@rental.local', '3001234567', 'propietario', 'activo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO casa (id, usuario_id, nombre, direccion, barrio, ciudad, estado)
VALUES (1, 1, 'Casa Central', 'Calle 85 #45-12', 'La Floresta', 'Medellin', 'activo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO zona_habitacional (id, casa_id, nombre, tipo, area_m2, valor_arriendo, estado)
VALUES (1, 1, 'Zona Norte', 'habitacion', 24.50, 1200000.00, 'activo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inquilino (id, nombre, apellido, tipo_identificacion, identificacion, telefono, correo)
VALUES (1, 'Juan', 'Perez', 'cedula_ciudadania', '1030123456', '3115552233', 'juan.perez@mail.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO contrato (id, inquilino_id, zona_habitacional_id, fecha_firma, fecha_inicio, fecha_fin, valor_pactado, estado)
VALUES (1, 1, 1, DATE '2026-01-05', DATE '2026-02-01', DATE '2027-01-31', 1200000.00, 'activo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO pago_renta (id, contrato_id, anio, mes, monto_esperado, monto_pagado, fecha_pago, metodo_pago, tipo_pago, estado)
VALUES
    (1, 1, 2026, 2, 1200000.00, 1200000.00, DATE '2026-02-05', 'TRANSFERENCIA_BANCARIA', 'NEQUI', 'PAGADO'),
    (2, 1, 2026, 3, 1200000.00, 600000.00, DATE '2026-03-10', 'TRANSFERENCIA_BANCARIA', 'DAVIPLATA', 'PARCIAL'),
    (3, 1, 2026, 4, 1200000.00, 0.00, NULL, NULL, 'EFECTIVO', 'PENDIENTE'),
    (4, 1, 2026, 1, 1200000.00, 0.00, NULL, NULL, NULL, 'VENCIDO')
ON CONFLICT (id) DO NOTHING;

INSERT INTO prestamo (id, contrato_id, fecha, monto_total, saldo_pendiente, motivo, estado)
VALUES
    (1, 1, DATE '2026-02-15', 800000.00, 350000.00, 'Prestamo para reparacion de electrodomesticos', 'PENDIENTE'),
    (2, 1, DATE '2026-01-20', 300000.00, 0.00, 'Prestamo de apoyo de mudanza', 'PAGADO')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicio_catalogo (id, nombre, tipo, proveedor)
VALUES (1, 'Energia', 'electricidad', 'EPM')
ON CONFLICT (id) DO NOTHING;

INSERT INTO factura_servicio (id, casa_id, servicio_id, numero_factura, anio, mes, fecha_vencimiento, valor_total, estado)
VALUES (1, 1, 1, 'FS-2026-04-001', 2026, 4, DATE '2026-04-20', 180000.00, 'pendiente')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cargo_servicio (id, factura_id, contrato_id, monto_asignado, estado)
VALUES
    (1, 1, 1, 180000.00, 'pendiente')
ON CONFLICT (id) DO NOTHING;
