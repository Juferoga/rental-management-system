BEGIN;

-- Usuarios adicionales (además del admin seed)
INSERT INTO usuario (nombre, apellido, correo, telefono, rol, estado)
VALUES
    ('Carlos', 'Ramírez', 'carlos.ramirez@rental.local', '3001234567', 'propietario', 'activo'),
    ('Laura', 'Gómez', 'laura.gomez@rental.local', '3002345678', 'asistente', 'activo')
ON CONFLICT (correo) DO NOTHING;

-- 2 casas
INSERT INTO casa (usuario_id, nombre, direccion, barrio, ciudad, estado)
VALUES
    ((SELECT id FROM usuario WHERE correo = 'carlos.ramirez@rental.local'), 'Casa Laureles', 'Calle 33 #78-21', 'Laureles', 'Medellín', 'activo'),
    ((SELECT id FROM usuario WHERE correo = 'carlos.ramirez@rental.local'), 'Casa Belén', 'Carrera 74 #30A-15', 'Belén', 'Medellín', 'activo')
ON CONFLICT DO NOTHING;

-- 4 zonas habitacionales (2 por casa)
INSERT INTO zona_habitacional (casa_id, nombre, tipo, area_m2, valor_arriendo, estado)
VALUES
    ((SELECT id FROM casa WHERE nombre = 'Casa Laureles' AND direccion = 'Calle 33 #78-21'), 'Habitación 101', 'habitacion', 18.50, 950000, 'activo'),
    ((SELECT id FROM casa WHERE nombre = 'Casa Laureles' AND direccion = 'Calle 33 #78-21'), 'Apartaestudio 102', 'apartaestudio', 28.00, 1300000, 'activo'),
    ((SELECT id FROM casa WHERE nombre = 'Casa Belén' AND direccion = 'Carrera 74 #30A-15'), 'Habitación 201', 'habitacion', 16.20, 820000, 'activo'),
    ((SELECT id FROM casa WHERE nombre = 'Casa Belén' AND direccion = 'Carrera 74 #30A-15'), 'Habitación 202', 'habitacion', 17.80, 860000, 'activo')
ON CONFLICT DO NOTHING;

-- 4 inquilinos
INSERT INTO inquilino (nombre, apellido, tipo_identificacion, identificacion, telefono, correo)
VALUES
    ('Mateo', 'Velásquez', 'cedula_ciudadania', '1037654321', '3011112233', 'mateo.velasquez@mail.com'),
    ('Valentina', 'Rojas', 'cedula_ciudadania', '1037123456', '3022223344', 'valentina.rojas@mail.com'),
    ('Santiago', 'Pérez', 'cedula_ciudadania', '1037987654', '3033334455', 'santiago.perez@mail.com'),
    ('Camila', 'Ospina', 'cedula_ciudadania', '1037456123', '3044445566', 'camila.ospina@mail.com')
ON CONFLICT (tipo_identificacion, identificacion) DO NOTHING;

-- Contratos activos (uno por zona)
INSERT INTO contrato (
    inquilino_id,
    zona_habitacional_id,
    fecha_firma,
    fecha_inicio,
    fecha_fin,
    valor_pactado,
    estado
)
VALUES
    ((SELECT id FROM inquilino WHERE identificacion = '1037654321'),
     (SELECT id FROM zona_habitacional WHERE nombre = 'Habitación 101'),
     CURRENT_DATE - INTERVAL '90 days',
     CURRENT_DATE - INTERVAL '60 days',
     CURRENT_DATE + INTERVAL '305 days',
     950000,
     'activo'),

    ((SELECT id FROM inquilino WHERE identificacion = '1037123456'),
     (SELECT id FROM zona_habitacional WHERE nombre = 'Apartaestudio 102'),
     CURRENT_DATE - INTERVAL '120 days',
     CURRENT_DATE - INTERVAL '90 days',
     CURRENT_DATE + INTERVAL '275 days',
     1300000,
     'activo'),

    ((SELECT id FROM inquilino WHERE identificacion = '1037987654'),
     (SELECT id FROM zona_habitacional WHERE nombre = 'Habitación 201'),
     CURRENT_DATE - INTERVAL '75 days',
     CURRENT_DATE - INTERVAL '45 days',
     CURRENT_DATE + INTERVAL '320 days',
     820000,
     'activo'),

    ((SELECT id FROM inquilino WHERE identificacion = '1037456123'),
     (SELECT id FROM zona_habitacional WHERE nombre = 'Habitación 202'),
     CURRENT_DATE - INTERVAL '60 days',
     CURRENT_DATE - INTERVAL '30 days',
     CURRENT_DATE + INTERVAL '335 days',
     860000,
     'activo')
ON CONFLICT DO NOTHING;

-- Relacionar servicios por casa
INSERT INTO casa_servicio (casa_id, servicio_id)
SELECT c.id, s.id
FROM casa c
JOIN servicio_catalogo s ON s.nombre IN ('Acueducto', 'Energía Eléctrica', 'Gas Natural', 'Internet')
WHERE c.nombre IN ('Casa Laureles', 'Casa Belén')
ON CONFLICT DO NOTHING;

-- Tarjetas de crédito del propietario
INSERT INTO credit_card (usuario_id, alias, entidad, ultimos_digitos, cupo_total, estado)
VALUES
    ((SELECT id FROM usuario WHERE correo = 'carlos.ramirez@rental.local'), 'Visa Principal', 'Bancolombia', '4821', 12000000, 'activa'),
    ((SELECT id FROM usuario WHERE correo = 'carlos.ramirez@rental.local'), 'Master Viajes', 'Davivienda', '1034', 8000000, 'activa')
ON CONFLICT (usuario_id, alias) DO NOTHING;

-- Deudas del propietario (owner_debt)
INSERT INTO owner_debt (
    usuario_id,
    credit_card_id,
    tipo,
    descripcion,
    monto_total,
    saldo_pendiente,
    fecha_corte,
    fecha_vencimiento,
    estado
)
VALUES
    ((SELECT id FROM usuario WHERE correo = 'carlos.ramirez@rental.local'),
     (SELECT id FROM credit_card WHERE alias = 'Visa Principal' AND usuario_id = (SELECT id FROM usuario WHERE correo = 'carlos.ramirez@rental.local')),
     'credit_card',
     'Factura Visa abril',
     1850000,
     650000,
     date_trunc('month', CURRENT_DATE)::date + INTERVAL '5 day',
     date_trunc('month', CURRENT_DATE)::date + INTERVAL '20 day',
     'pendiente'),

    ((SELECT id FROM usuario WHERE correo = 'carlos.ramirez@rental.local'),
     NULL,
     'loan',
     'Préstamo libre inversión',
     3000000,
     0,
     date_trunc('month', CURRENT_DATE)::date + INTERVAL '10 day',
     date_trunc('month', CURRENT_DATE)::date + INTERVAL '25 day',
     'pagada'),

    ((SELECT id FROM usuario WHERE correo = 'carlos.ramirez@rental.local'),
     NULL,
     'other',
     'Seguro anual inmueble',
     950000,
     950000,
     date_trunc('month', CURRENT_DATE)::date + INTERVAL '3 day',
     date_trunc('month', CURRENT_DATE)::date + INTERVAL '15 day',
     'vencida');

-- Facturas de servicios del mes actual
INSERT INTO factura_servicio (
    casa_id,
    servicio_id,
    numero_factura,
    anio,
    mes,
    fecha_vencimiento,
    valor_total,
    estado
)
VALUES
    ((SELECT id FROM casa WHERE nombre = 'Casa Laureles'),
     (SELECT id FROM servicio_catalogo WHERE nombre = 'Acueducto'),
     CONCAT('AGUA-LAU-', to_char(CURRENT_DATE, 'YYYYMM')),
     EXTRACT(YEAR FROM CURRENT_DATE)::smallint,
     EXTRACT(MONTH FROM CURRENT_DATE)::smallint,
     date_trunc('month', CURRENT_DATE)::date + INTERVAL '12 day',
     210000,
     'pendiente'),

    ((SELECT id FROM casa WHERE nombre = 'Casa Laureles'),
     (SELECT id FROM servicio_catalogo WHERE nombre = 'Energía Eléctrica'),
     CONCAT('LUZ-LAU-', to_char(CURRENT_DATE, 'YYYYMM')),
     EXTRACT(YEAR FROM CURRENT_DATE)::smallint,
     EXTRACT(MONTH FROM CURRENT_DATE)::smallint,
     date_trunc('month', CURRENT_DATE)::date + INTERVAL '18 day',
     320000,
     'pagada'),

    ((SELECT id FROM casa WHERE nombre = 'Casa Belén'),
     (SELECT id FROM servicio_catalogo WHERE nombre = 'Gas Natural'),
     CONCAT('GAS-BEL-', to_char(CURRENT_DATE, 'YYYYMM')),
     EXTRACT(YEAR FROM CURRENT_DATE)::smallint,
     EXTRACT(MONTH FROM CURRENT_DATE)::smallint,
     date_trunc('month', CURRENT_DATE)::date + INTERVAL '16 day',
     165000,
     'vencida'),

    ((SELECT id FROM casa WHERE nombre = 'Casa Belén'),
     (SELECT id FROM servicio_catalogo WHERE nombre = 'Internet'),
     CONCAT('NET-BEL-', to_char(CURRENT_DATE, 'YYYYMM')),
     EXTRACT(YEAR FROM CURRENT_DATE)::smallint,
     EXTRACT(MONTH FROM CURRENT_DATE)::smallint,
     date_trunc('month', CURRENT_DATE)::date + INTERVAL '22 day',
     198000,
     'pendiente')
ON CONFLICT (casa_id, servicio_id, anio, mes) DO NOTHING;

-- Cargos de servicio por contrato
INSERT INTO cargo_servicio (factura_id, contrato_id, monto_asignado, estado)
VALUES
    ((SELECT fs.id FROM factura_servicio fs WHERE fs.numero_factura = CONCAT('AGUA-LAU-', to_char(CURRENT_DATE, 'YYYYMM'))),
     (SELECT c.id FROM contrato c JOIN zona_habitacional z ON z.id = c.zona_habitacional_id WHERE z.nombre = 'Habitación 101' AND c.estado = 'activo'),
     105000,
     'pendiente'),
    ((SELECT fs.id FROM factura_servicio fs WHERE fs.numero_factura = CONCAT('AGUA-LAU-', to_char(CURRENT_DATE, 'YYYYMM'))),
     (SELECT c.id FROM contrato c JOIN zona_habitacional z ON z.id = c.zona_habitacional_id WHERE z.nombre = 'Apartaestudio 102' AND c.estado = 'activo'),
     105000,
     'cobrado'),
    ((SELECT fs.id FROM factura_servicio fs WHERE fs.numero_factura = CONCAT('LUZ-LAU-', to_char(CURRENT_DATE, 'YYYYMM'))),
     (SELECT c.id FROM contrato c JOIN zona_habitacional z ON z.id = c.zona_habitacional_id WHERE z.nombre = 'Habitación 101' AND c.estado = 'activo'),
     160000,
     'cobrado'),
    ((SELECT fs.id FROM factura_servicio fs WHERE fs.numero_factura = CONCAT('LUZ-LAU-', to_char(CURRENT_DATE, 'YYYYMM'))),
     (SELECT c.id FROM contrato c JOIN zona_habitacional z ON z.id = c.zona_habitacional_id WHERE z.nombre = 'Apartaestudio 102' AND c.estado = 'activo'),
     160000,
     'cobrado'),
    ((SELECT fs.id FROM factura_servicio fs WHERE fs.numero_factura = CONCAT('GAS-BEL-', to_char(CURRENT_DATE, 'YYYYMM'))),
     (SELECT c.id FROM contrato c JOIN zona_habitacional z ON z.id = c.zona_habitacional_id WHERE z.nombre = 'Habitación 201' AND c.estado = 'activo'),
     82500,
     'pendiente'),
    ((SELECT fs.id FROM factura_servicio fs WHERE fs.numero_factura = CONCAT('GAS-BEL-', to_char(CURRENT_DATE, 'YYYYMM'))),
     (SELECT c.id FROM contrato c JOIN zona_habitacional z ON z.id = c.zona_habitacional_id WHERE z.nombre = 'Habitación 202' AND c.estado = 'activo'),
     82500,
     'pendiente'),
    ((SELECT fs.id FROM factura_servicio fs WHERE fs.numero_factura = CONCAT('NET-BEL-', to_char(CURRENT_DATE, 'YYYYMM'))),
     (SELECT c.id FROM contrato c JOIN zona_habitacional z ON z.id = c.zona_habitacional_id WHERE z.nombre = 'Habitación 201' AND c.estado = 'activo'),
     99000,
     'pendiente'),
    ((SELECT fs.id FROM factura_servicio fs WHERE fs.numero_factura = CONCAT('NET-BEL-', to_char(CURRENT_DATE, 'YYYYMM'))),
     (SELECT c.id FROM contrato c JOIN zona_habitacional z ON z.id = c.zona_habitacional_id WHERE z.nombre = 'Habitación 202' AND c.estado = 'activo'),
     99000,
     'pendiente')
ON CONFLICT (factura_id, contrato_id) DO NOTHING;

-- Pagos de renta (mes actual + mes anterior)
INSERT INTO pago_renta (contrato_id, anio, mes, monto_esperado, monto_pagado, fecha_pago, metodo_pago, estado)
SELECT
    c.id,
    EXTRACT(YEAR FROM CURRENT_DATE)::smallint,
    EXTRACT(MONTH FROM CURRENT_DATE)::smallint,
    c.valor_pactado,
    CASE z.nombre
        WHEN 'Habitación 101' THEN c.valor_pactado
        WHEN 'Apartaestudio 102' THEN c.valor_pactado * 0.50
        WHEN 'Habitación 201' THEN 0
        ELSE c.valor_pactado
    END,
    CASE z.nombre
        WHEN 'Habitación 101' THEN CURRENT_DATE - INTERVAL '2 days'
        WHEN 'Apartaestudio 102' THEN CURRENT_DATE - INTERVAL '1 days'
        WHEN 'Habitación 201' THEN NULL
        ELSE CURRENT_DATE - INTERVAL '4 days'
    END,
    CASE z.nombre
        WHEN 'Habitación 201' THEN NULL::metodo_pago
        ELSE 'transferencia_bancaria'::metodo_pago
    END,
    CASE z.nombre
        WHEN 'Habitación 101' THEN 'pagado'::pago_renta_estado
        WHEN 'Apartaestudio 102' THEN 'parcial'::pago_renta_estado
        WHEN 'Habitación 201' THEN 'pendiente'::pago_renta_estado
        ELSE 'pagado'::pago_renta_estado
    END
FROM contrato c
JOIN zona_habitacional z ON z.id = c.zona_habitacional_id
WHERE c.estado = 'activo'
ON CONFLICT (contrato_id, anio, mes) DO NOTHING;

INSERT INTO pago_renta (contrato_id, anio, mes, monto_esperado, monto_pagado, fecha_pago, metodo_pago, estado)
SELECT
    c.id,
    EXTRACT(YEAR FROM (CURRENT_DATE - INTERVAL '1 month'))::smallint,
    EXTRACT(MONTH FROM (CURRENT_DATE - INTERVAL '1 month'))::smallint,
    c.valor_pactado,
    c.valor_pactado,
    (date_trunc('month', CURRENT_DATE)::date - INTERVAL '5 days')::date,
    'transferencia_bancaria'::metodo_pago,
    'pagado'::pago_renta_estado
FROM contrato c
WHERE c.estado = 'activo'
ON CONFLICT (contrato_id, anio, mes) DO NOTHING;

COMMIT;
