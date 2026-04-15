#!/usr/bin/env bash

set -euo pipefail

GREEN='\e[32m'
CYAN='\e[36m'
YELLOW='\e[33m'
RED='\e[31m'
RESET='\e[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${CYAN}🚀 Rental Management | Full HD 4K Orchestration Boot Script${RESET}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

read -r -p "Do you want to start an empty installation or with dummy data? (e/d): " MODE
MODE="$(printf '%s' "$MODE" | tr '[:upper:]' '[:lower:]')"

if [[ "$MODE" != "e" && "$MODE" != "d" ]]; then
  echo -e "${RED}❌ Invalid option. Use 'e' (empty) or 'd' (dummy data).${RESET}"
  exit 1
fi

echo -e "${YELLOW}🧹 Stopping and removing existing containers/volumes...${RESET}"
docker compose down -v

echo -e "${YELLOW}🏗️  Building and starting services...${RESET}"
docker compose up -d --build

echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${RESET}"
until docker exec rental_db pg_isready -U postgres >/dev/null 2>&1; do
  echo -e "${YELLOW}   • DB not ready yet, retrying in 2s...${RESET}"
  sleep 2
done

echo -e "${GREEN}✅ PostgreSQL is ready.${RESET}"

if [[ "$MODE" == "d" ]]; then
  echo -e "${YELLOW}🧪 Loading dummy data block (zona_habitacional, casa, inquilino, contrato, pago_renta, prestamo)...${RESET}"

  SQL_BLOCK=$(cat <<'SQL'
DO $$
DECLARE
    v_usuario_id INTEGER;

    v_casa_laureles_id INTEGER;
    v_casa_belen_id INTEGER;

    v_zona_101_id INTEGER;
    v_zona_102_id INTEGER;

    v_inquilino_mateo_id INTEGER;
    v_inquilino_valentina_id INTEGER;

    v_contrato_101_id INTEGER;
    v_contrato_102_id INTEGER;
BEGIN
    -- usuario base para casas
    SELECT id INTO v_usuario_id
    FROM usuario
    WHERE correo = 'admin@gestion.local'
    LIMIT 1;

    IF v_usuario_id IS NULL THEN
        INSERT INTO usuario (nombre, apellido, correo, telefono, rol, estado)
        VALUES ('Admin', 'Sistema', 'admin@gestion.local', NULL, 'administrador', 'activo')
        RETURNING id INTO v_usuario_id;
    END IF;

    -- casa
    SELECT id INTO v_casa_laureles_id
    FROM casa
    WHERE nombre = 'Casa Laureles'
      AND direccion = 'Calle 33 #78-21'
    LIMIT 1;

    IF v_casa_laureles_id IS NULL THEN
        INSERT INTO casa (usuario_id, nombre, direccion, barrio, ciudad, estado)
        VALUES (v_usuario_id, 'Casa Laureles', 'Calle 33 #78-21', 'Laureles', 'Medellín', 'activo')
        RETURNING id INTO v_casa_laureles_id;
    END IF;

    SELECT id INTO v_casa_belen_id
    FROM casa
    WHERE nombre = 'Casa Belén'
      AND direccion = 'Carrera 74 #30A-15'
    LIMIT 1;

    IF v_casa_belen_id IS NULL THEN
        INSERT INTO casa (usuario_id, nombre, direccion, barrio, ciudad, estado)
        VALUES (v_usuario_id, 'Casa Belén', 'Carrera 74 #30A-15', 'Belén', 'Medellín', 'activo')
        RETURNING id INTO v_casa_belen_id;
    END IF;

    -- zona_habitacional
    SELECT id INTO v_zona_101_id
    FROM zona_habitacional
    WHERE casa_id = v_casa_laureles_id
      AND nombre = 'Habitación 101'
    LIMIT 1;

    IF v_zona_101_id IS NULL THEN
        INSERT INTO zona_habitacional (casa_id, nombre, tipo, area_m2, valor_arriendo, estado)
        VALUES (v_casa_laureles_id, 'Habitación 101', 'habitacion', 18.50, 950000, 'activo')
        RETURNING id INTO v_zona_101_id;
    END IF;

    SELECT id INTO v_zona_102_id
    FROM zona_habitacional
    WHERE casa_id = v_casa_laureles_id
      AND nombre = 'Apartaestudio 102'
    LIMIT 1;

    IF v_zona_102_id IS NULL THEN
        INSERT INTO zona_habitacional (casa_id, nombre, tipo, area_m2, valor_arriendo, estado)
        VALUES (v_casa_laureles_id, 'Apartaestudio 102', 'apartaestudio', 28.00, 1300000, 'activo')
        RETURNING id INTO v_zona_102_id;
    END IF;

    -- inquilino
    SELECT id INTO v_inquilino_mateo_id
    FROM inquilino
    WHERE tipo_identificacion = 'cedula_ciudadania'
      AND identificacion = '1037654321'
    LIMIT 1;

    IF v_inquilino_mateo_id IS NULL THEN
        INSERT INTO inquilino (nombre, apellido, tipo_identificacion, identificacion, telefono, correo)
        VALUES ('Mateo', 'Velásquez', 'cedula_ciudadania', '1037654321', '3011112233', 'mateo.velasquez@mail.com')
        RETURNING id INTO v_inquilino_mateo_id;
    END IF;

    SELECT id INTO v_inquilino_valentina_id
    FROM inquilino
    WHERE tipo_identificacion = 'cedula_ciudadania'
      AND identificacion = '1037123456'
    LIMIT 1;

    IF v_inquilino_valentina_id IS NULL THEN
        INSERT INTO inquilino (nombre, apellido, tipo_identificacion, identificacion, telefono, correo)
        VALUES ('Valentina', 'Rojas', 'cedula_ciudadania', '1037123456', '3022223344', 'valentina.rojas@mail.com')
        RETURNING id INTO v_inquilino_valentina_id;
    END IF;

    -- contrato
    SELECT id INTO v_contrato_101_id
    FROM contrato
    WHERE zona_habitacional_id = v_zona_101_id
      AND estado = 'activo'
    LIMIT 1;

    IF v_contrato_101_id IS NULL THEN
        INSERT INTO contrato (
            inquilino_id,
            zona_habitacional_id,
            fecha_firma,
            fecha_inicio,
            fecha_fin,
            valor_pactado,
            estado
        )
        VALUES (
            v_inquilino_mateo_id,
            v_zona_101_id,
            CURRENT_DATE - INTERVAL '90 days',
            CURRENT_DATE - INTERVAL '60 days',
            CURRENT_DATE + INTERVAL '305 days',
            950000,
            'activo'
        )
        RETURNING id INTO v_contrato_101_id;
    END IF;

    SELECT id INTO v_contrato_102_id
    FROM contrato
    WHERE zona_habitacional_id = v_zona_102_id
      AND estado = 'activo'
    LIMIT 1;

    IF v_contrato_102_id IS NULL THEN
        INSERT INTO contrato (
            inquilino_id,
            zona_habitacional_id,
            fecha_firma,
            fecha_inicio,
            fecha_fin,
            valor_pactado,
            estado
        )
        VALUES (
            v_inquilino_valentina_id,
            v_zona_102_id,
            CURRENT_DATE - INTERVAL '120 days',
            CURRENT_DATE - INTERVAL '90 days',
            CURRENT_DATE + INTERVAL '275 days',
            1300000,
            'activo'
        )
        RETURNING id INTO v_contrato_102_id;
    END IF;

    -- pago_renta (estado en minúsculas: pendiente/pagado)
    IF NOT EXISTS (
        SELECT 1
        FROM pago_renta
        WHERE contrato_id = v_contrato_101_id
          AND anio = EXTRACT(YEAR FROM CURRENT_DATE)::smallint
          AND mes = EXTRACT(MONTH FROM CURRENT_DATE)::smallint
    ) THEN
        INSERT INTO pago_renta (contrato_id, anio, mes, monto_esperado, monto_pagado, fecha_pago, metodo_pago, estado)
        VALUES (
            v_contrato_101_id,
            EXTRACT(YEAR FROM CURRENT_DATE)::smallint,
            EXTRACT(MONTH FROM CURRENT_DATE)::smallint,
            950000,
            950000,
            CURRENT_DATE - INTERVAL '2 days',
            'transferencia_bancaria',
            'pagado'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pago_renta
        WHERE contrato_id = v_contrato_102_id
          AND anio = EXTRACT(YEAR FROM CURRENT_DATE)::smallint
          AND mes = EXTRACT(MONTH FROM CURRENT_DATE)::smallint
    ) THEN
        INSERT INTO pago_renta (contrato_id, anio, mes, monto_esperado, monto_pagado, fecha_pago, metodo_pago, estado)
        VALUES (
            v_contrato_102_id,
            EXTRACT(YEAR FROM CURRENT_DATE)::smallint,
            EXTRACT(MONTH FROM CURRENT_DATE)::smallint,
            1300000,
            0,
            NULL,
            NULL,
            'pendiente'
        );
    END IF;

    -- prestamo (estado en minúsculas: activo/saldado/condonado/vencido)
    IF NOT EXISTS (
        SELECT 1
        FROM prestamo
        WHERE contrato_id = v_contrato_101_id
          AND motivo = 'Adecuación de habitación'
    ) THEN
        INSERT INTO prestamo (contrato_id, fecha, monto_total, saldo_pendiente, motivo, estado)
        VALUES (
            v_contrato_101_id,
            CURRENT_DATE - INTERVAL '15 days',
            500000,
            250000,
            'Adecuación de habitación',
            'activo'
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM prestamo
        WHERE contrato_id = v_contrato_102_id
          AND motivo = 'Apoyo de mudanza'
    ) THEN
        INSERT INTO prestamo (contrato_id, fecha, monto_total, saldo_pendiente, motivo, estado)
        VALUES (
            v_contrato_102_id,
            CURRENT_DATE - INTERVAL '45 days',
            300000,
            0,
            'Apoyo de mudanza',
            'saldado'
        );
    END IF;
END
$$;
SQL
)

  docker exec -i rental_db psql -U postgres -d rental_management -c "$SQL_BLOCK"
  echo -e "${GREEN}✅ Dummy data loaded successfully.${RESET}"
else
  echo -e "${GREEN}✅ Empty installation completed.${RESET}"
fi

echo -e "${GREEN}🎉 System is up and running. Let's build something great.${RESET}"
