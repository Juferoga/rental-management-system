-- =============================================================================
--  ESQUEMA COMPLETO DE BASE DE DATOS - GESTIÓN DE PROPIEDADES EN ARRIENDO
--  Motor       : PostgreSQL 15+
--  Encoding    : UTF-8
--  Autor       : Generado desde diagramas ER / Relacional (PlantUML / Chen)
--  Descripción : Sistema para administrar propiedades, zonas habitacionales,
--                contratos, inquilinos, pagos, depósitos, préstamos, servicios
--                públicos y mantenimientos.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensiones necesarias (deben instalarse ANTES de la transacción principal
-- porque CREATE EXTENSION no es transaccional en todas las versiones)
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ---------------------------------------------------------------------------
-- Buenas prácticas: todo en una transacción para rollback limpio si algo falla
-- ---------------------------------------------------------------------------
BEGIN;

-- ===========================================================================
-- SECCIÓN 1: TIPOS ENUMERADOS
-- Usar ENUMs en lugar de VARCHAR libre previene datos sucios, mejora
-- la legibilidad del query plan y reduce el tamaño de almacenamiento.
-- ===========================================================================

-- Roles que puede tener un usuario del sistema
CREATE TYPE usuario_rol AS ENUM (
    'administrador',   -- Control total del sistema
    'propietario',     -- Solo ve sus propias casas
    'asistente'        -- Rol de apoyo con permisos limitados
);

-- Estado operativo genérico reutilizado en varias entidades
CREATE TYPE estado_general AS ENUM (
    'activo',
    'inactivo',
    'suspendido'
);

-- Tipos de zona dentro de una propiedad
CREATE TYPE zona_tipo AS ENUM (
    'habitacion',
    'apartaestudio',
    'local_comercial',
    'garaje',
    'bodega',
    'otro'
);

-- Estado del ciclo de vida de un contrato
CREATE TYPE contrato_estado AS ENUM (
    'activo',
    'finalizado',
    'cancelado',
    'en_mora'
);

-- Estado del depósito de garantía
CREATE TYPE deposito_estado AS ENUM (
    'retenido',    -- El depósito está en custodia del propietario
    'devuelto',    -- Se reintegró totalmente al inquilino
    'aplicado'     -- Se aplicó por daños u otros conceptos
);

-- Tipos de movimiento sobre el depósito
CREATE TYPE movimiento_deposito_tipo AS ENUM (
    'descuento',   -- Descuento por daños o incumplimientos
    'reintegro',   -- Devolución total o parcial al inquilino
    'ajuste'       -- Corrección administrativa
);

-- Estado de un pago de renta mensual
CREATE TYPE pago_renta_estado AS ENUM (
    'pendiente',   -- Aún no se ha registrado ningún pago
    'parcial',     -- Se pagó un monto inferior al esperado
    'pagado',      -- Cancelado en su totalidad
    'vencido'      -- No se pagó y ya pasó la fecha límite
);

-- Métodos de pago aceptados
CREATE TYPE metodo_pago AS ENUM (
    'efectivo',
    'transferencia_bancaria',
    'nequi',
    'daviplata',
    'cheque',
    'otro'
);

-- Estado de un préstamo al inquilino
CREATE TYPE prestamo_estado AS ENUM (
    'activo',      -- Tiene saldo pendiente
    'saldado',     -- Pagado completamente
    'condonado',   -- Perdonado por el propietario
    'vencido'      -- No pagado fuera de plazo
);

-- Estado de una tarjeta de crédito del propietario
CREATE TYPE credit_card_estado AS ENUM (
    'activa',
    'suspendida',
    'cancelada'
);

-- Estado de una deuda del propietario
CREATE TYPE owner_debt_estado AS ENUM (
    'pendiente',
    'pagada',
    'vencida'
);

-- Tipos de servicio público / domiciliario
CREATE TYPE servicio_tipo AS ENUM (
    'agua',
    'electricidad',
    'gas',
    'internet',
    'telefonia',
    'television',
    'aseo',
    'otro'
);

-- Estado de una factura de servicio
CREATE TYPE factura_estado AS ENUM (
    'pendiente',   -- Sin pagar
    'pagada',      -- Cancelada en su totalidad
    'vencida',     -- Superó la fecha de vencimiento sin pago
    'anulada'      -- Emitida por error o reversa
);

-- Estado de un cargo de servicio asignado a un contrato
CREATE TYPE cargo_estado AS ENUM (
    'pendiente',
    'cobrado',
    'exonerado'    -- El propietario decidió no cobrarlo
);

-- Estado de un mantenimiento
CREATE TYPE mantenimiento_estado AS ENUM (
    'solicitado',
    'en_progreso',
    'completado',
    'cancelado'
);

-- Tipos de identificación (Colombia-centric, fácilmente extensible)
CREATE TYPE tipo_identificacion AS ENUM (
    'cedula_ciudadania',
    'cedula_extranjeria',
    'pasaporte',
    'nit',
    'tarjeta_identidad'
);


-- ===========================================================================
-- SECCIÓN 2: FUNCIÓN DE AUDITORÍA (updated_at automático)
-- Un trigger genérico que actualiza la columna updated_at en cualquier tabla
-- que la tenga. Se adjunta individualmente a cada tabla que lo requiera.
-- ===========================================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql AS
$$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION fn_set_updated_at() IS
    'Trigger genérico que mantiene updated_at sincronizado con la hora actual '
    'en cada UPDATE. Adjuntar con: CREATE TRIGGER trg_<tabla>_updated_at '
    'BEFORE UPDATE ON <tabla> FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();';


-- ===========================================================================
-- SECCIÓN 3: TABLAS
-- Orden de creación respeta las FK (tablas padre antes que hijas).
-- Se usan GENERATED ALWAYS AS IDENTITY (estándar SQL, preferido sobre SERIAL
-- en PostgreSQL moderno) y se añaden índices sobre todas las FK y columnas
-- frecuentemente filtradas.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 3.1  USUARIO
-- Personas que administran o supervisan propiedades en el sistema.
-- ---------------------------------------------------------------------------
CREATE TABLE usuario (
    id          INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    apellido    VARCHAR(100) NOT NULL,
    correo      VARCHAR(150) NOT NULL,
    telefono    VARCHAR(20),
    rol         usuario_rol  NOT NULL DEFAULT 'propietario',
    estado      estado_general NOT NULL DEFAULT 'activo',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- El correo es el identificador natural de login; debe ser único
    CONSTRAINT uq_usuario_correo UNIQUE (correo)
);

COMMENT ON TABLE  usuario              IS 'Administradores o propietarios que gestionan las propiedades en el sistema.';
COMMENT ON COLUMN usuario.rol          IS 'Nivel de acceso del usuario dentro del sistema.';
COMMENT ON COLUMN usuario.estado       IS 'Permite deshabilitar cuentas sin eliminar el historial.';

CREATE TRIGGER trg_usuario_updated_at
    BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- 3.2  CASA
-- Propiedad inmueble principal que contiene una o más zonas habitacionales.
-- ---------------------------------------------------------------------------
CREATE TABLE casa (
    id          INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id  INTEGER      NOT NULL,
    nombre      VARCHAR(100) NOT NULL,
    direccion   VARCHAR(200) NOT NULL,
    barrio      VARCHAR(100),
    ciudad      VARCHAR(100) NOT NULL,
    estado      estado_general NOT NULL DEFAULT 'activo',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_casa_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT   -- No borrar usuario si tiene casas registradas
);

COMMENT ON TABLE  casa             IS 'Inmueble principal (casa, edificio, lote) administrado por un usuario.';
COMMENT ON COLUMN casa.usuario_id  IS 'Propietario/administrador responsable de esta propiedad.';

CREATE INDEX idx_casa_usuario_id ON casa (usuario_id);

CREATE TRIGGER trg_casa_updated_at
    BEFORE UPDATE ON casa
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- 3.3  ZONA_HABITACIONAL
-- Unidad arrendable dentro de una casa (habitación, apartaestudio, local, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE zona_habitacional (
    id               INTEGER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    casa_id          INTEGER        NOT NULL,
    nombre           VARCHAR(100)   NOT NULL,
    tipo             zona_tipo      NOT NULL,
    area_m2          NUMERIC(8,2)   CHECK (area_m2 > 0),
    valor_arriendo   NUMERIC(12,2)  NOT NULL CHECK (valor_arriendo >= 0),
    estado           estado_general NOT NULL DEFAULT 'activo',
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_zona_casa
        FOREIGN KEY (casa_id) REFERENCES casa (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

COMMENT ON TABLE  zona_habitacional                IS 'Unidad arrendable dentro de una propiedad (habitación, local, etc.).';
COMMENT ON COLUMN zona_habitacional.valor_arriendo IS 'Canon mensual base pactado para esta zona.';
COMMENT ON COLUMN zona_habitacional.area_m2        IS 'Superficie en metros cuadrados; puede ser NULL si no aplica.';

CREATE INDEX idx_zona_casa_id ON zona_habitacional (casa_id);

CREATE TRIGGER trg_zona_updated_at
    BEFORE UPDATE ON zona_habitacional
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- 3.4  INQUILINO
-- Persona natural que arrienda una zona habitacional.
-- ---------------------------------------------------------------------------
CREATE TABLE inquilino (
    id                   INTEGER            GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre               VARCHAR(100)       NOT NULL,
    apellido             VARCHAR(100)       NOT NULL,
    tipo_identificacion  tipo_identificacion NOT NULL,
    identificacion       VARCHAR(50)        NOT NULL,
    telefono             VARCHAR(20),
    correo               VARCHAR(150),
    created_at           TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

    -- La cédula/pasaporte debe ser única dentro del mismo tipo de documento
    CONSTRAINT uq_inquilino_identificacion
        UNIQUE (tipo_identificacion, identificacion)
);

COMMENT ON TABLE  inquilino                     IS 'Persona que arrienda una zona habitacional. Un inquilino puede tener múltiples contratos a lo largo del tiempo.';
COMMENT ON COLUMN inquilino.tipo_identificacion IS 'Tipo de documento de identidad (CC, CE, pasaporte, etc.).';
COMMENT ON COLUMN inquilino.identificacion      IS 'Número del documento de identidad.';

CREATE INDEX idx_inquilino_identificacion ON inquilino (identificacion);

CREATE TRIGGER trg_inquilino_updated_at
    BEFORE UPDATE ON inquilino
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- 3.5  CONTRATO
-- Vínculo legal que une a un inquilino con una zona habitacional durante
-- un período de tiempo determinado.
-- ---------------------------------------------------------------------------
CREATE TABLE contrato (
    id                    INTEGER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    inquilino_id          INTEGER         NOT NULL,
    zona_habitacional_id  INTEGER         NOT NULL,
    fecha_firma           DATE            NOT NULL,
    fecha_inicio          DATE            NOT NULL,
    fecha_fin             DATE,           -- NULL = contrato indefinido
    valor_pactado         NUMERIC(12,2)   NOT NULL CHECK (valor_pactado > 0),
    estado                contrato_estado NOT NULL DEFAULT 'activo',
    created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- Una zona no puede tener dos contratos activos simultáneos
    CONSTRAINT uq_contrato_zona_activo
        EXCLUDE USING gist (
            zona_habitacional_id WITH =,
            daterange(fecha_inicio, fecha_fin, '[]') WITH &&
        ) WHERE (estado = 'activo'),

    CONSTRAINT chk_contrato_fechas
        CHECK (fecha_fin IS NULL OR fecha_fin > fecha_inicio),

    CONSTRAINT fk_contrato_inquilino
        FOREIGN KEY (inquilino_id) REFERENCES inquilino (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_contrato_zona
        FOREIGN KEY (zona_habitacional_id) REFERENCES zona_habitacional (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE  contrato                   IS 'Acuerdo legal entre un inquilino y una zona habitacional. Núcleo del modelo de negocio.';
COMMENT ON COLUMN contrato.fecha_fin         IS 'NULL indica contrato a término indefinido. Cuando se pacta, no puede ser anterior a fecha_inicio.';
COMMENT ON COLUMN contrato.valor_pactado     IS 'Canon mensual acordado en el contrato, que puede diferir del valor base de la zona.';
COMMENT ON COLUMN contrato.estado            IS 'Ciclo de vida del contrato; "en_mora" se puede activar por trigger externo.';

CREATE INDEX idx_contrato_inquilino_id         ON contrato (inquilino_id);
CREATE INDEX idx_contrato_zona_habitacional_id ON contrato (zona_habitacional_id);
CREATE INDEX idx_contrato_estado               ON contrato (estado);

CREATE TRIGGER trg_contrato_updated_at
    BEFORE UPDATE ON contrato
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- 3.6  DEPOSITO
-- Garantía económica asociada 1:1 a un contrato. Funge como respaldo ante
-- daños o incumplimientos.
-- ---------------------------------------------------------------------------
CREATE TABLE deposito (
    id                INTEGER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contrato_id       INTEGER        NOT NULL,
    monto_inicial     NUMERIC(12,2)  NOT NULL CHECK (monto_inicial > 0),
    monto_disponible  NUMERIC(12,2)  NOT NULL CHECK (monto_disponible >= 0),
    estado            deposito_estado NOT NULL DEFAULT 'retenido',
    created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_deposito_montos
        CHECK (monto_disponible <= monto_inicial),

    -- Relación 1:1 estricta: un contrato → un único depósito
    CONSTRAINT uq_deposito_contrato UNIQUE (contrato_id),

    CONSTRAINT fk_deposito_contrato
        FOREIGN KEY (contrato_id) REFERENCES contrato (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE  deposito                 IS 'Depósito de garantía asociado 1 a 1 con un contrato. Se retiene hasta la finalización y se descuenta por daños.';
COMMENT ON COLUMN deposito.monto_inicial   IS 'Valor recibido al inicio del contrato.';
COMMENT ON COLUMN deposito.monto_disponible IS 'Saldo actual del depósito; se reduce con cada descuento y se pone en 0 al devolver.';

CREATE TRIGGER trg_deposito_updated_at
    BEFORE UPDATE ON deposito
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- 3.7  MOVIMIENTO_DEPOSITO
-- Registro de cada operación (descuento, reintegro, ajuste) sobre el depósito.
-- ---------------------------------------------------------------------------
CREATE TABLE movimiento_deposito (
    id           INTEGER                 GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    deposito_id  INTEGER                 NOT NULL,
    fecha        DATE                    NOT NULL DEFAULT CURRENT_DATE,
    monto        NUMERIC(12,2)           NOT NULL CHECK (monto > 0),
    tipo         movimiento_deposito_tipo NOT NULL,
    motivo       TEXT                    NOT NULL,
    created_at   TIMESTAMPTZ             NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_movimiento_deposito
        FOREIGN KEY (deposito_id) REFERENCES deposito (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE  movimiento_deposito          IS 'Historial de movimientos (descuentos por daños, reintegros) sobre un depósito de garantía.';
COMMENT ON COLUMN movimiento_deposito.tipo     IS '"descuento" reduce monto_disponible; "reintegro" lo devuelve al inquilino; "ajuste" es corrección administrativa.';
COMMENT ON COLUMN movimiento_deposito.motivo   IS 'Descripción obligatoria del motivo para trazabilidad y posibles disputas.';

CREATE INDEX idx_movimiento_deposito_id ON movimiento_deposito (deposito_id);


-- ---------------------------------------------------------------------------
-- 3.8  PAGO_RENTA
-- Registro mensual del canon de arrendamiento. Un registro por mes/contrato.
-- ---------------------------------------------------------------------------
CREATE TABLE pago_renta (
    id              INTEGER           GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contrato_id     INTEGER           NOT NULL,
    anio            SMALLINT          NOT NULL CHECK (anio BETWEEN 2000 AND 2100),
    mes             SMALLINT          NOT NULL CHECK (mes BETWEEN 1 AND 12),
    monto_esperado  NUMERIC(12,2)     NOT NULL CHECK (monto_esperado > 0),
    monto_pagado    NUMERIC(12,2)     NOT NULL DEFAULT 0 CHECK (monto_pagado >= 0),
    fecha_pago      DATE,             -- NULL si aún no se ha pagado
    metodo_pago     metodo_pago,
    estado          pago_renta_estado NOT NULL DEFAULT 'pendiente',
    created_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

    -- Evita duplicar el periodo de un contrato
    CONSTRAINT uq_pago_renta_periodo
        UNIQUE (contrato_id, anio, mes),

    CONSTRAINT fk_pago_renta_contrato
        FOREIGN KEY (contrato_id) REFERENCES contrato (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE  pago_renta               IS 'Registro del canon mensual por contrato. Se genera uno por mes activo y se va actualizando conforme llegan abonos.';
COMMENT ON COLUMN pago_renta.monto_pagado  IS 'Puede ser menor al esperado (pago parcial) o igual (pagado completo).';
COMMENT ON COLUMN pago_renta.fecha_pago    IS 'Fecha del último abono registrado. NULL si no hay ningún pago aún.';

CREATE INDEX idx_pago_renta_contrato_id ON pago_renta (contrato_id);
CREATE INDEX idx_pago_renta_estado      ON pago_renta (estado);
CREATE INDEX idx_pago_renta_periodo     ON pago_renta (anio, mes);

CREATE TRIGGER trg_pago_renta_updated_at
    BEFORE UPDATE ON pago_renta
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- 3.9  PRESTAMO
-- Préstamo otorgado al inquilino en el contexto de un contrato
-- (ej. adelanto de dinero para reparaciones, mudanza, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE prestamo (
    id               INTEGER         GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    contrato_id      INTEGER         NOT NULL,
    fecha            DATE            NOT NULL DEFAULT CURRENT_DATE,
    monto_total      NUMERIC(12,2)   NOT NULL CHECK (monto_total > 0),
    saldo_pendiente  NUMERIC(12,2)   NOT NULL CHECK (saldo_pendiente >= 0),
    motivo           VARCHAR(255)    NOT NULL,
    estado           prestamo_estado NOT NULL DEFAULT 'activo',
    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_prestamo_saldo
        CHECK (saldo_pendiente <= monto_total),

    CONSTRAINT fk_prestamo_contrato
        FOREIGN KEY (contrato_id) REFERENCES contrato (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE  prestamo                 IS 'Préstamo otorgado al inquilino bajo el paraguas de un contrato. Se abona parcialmente a través de pago_prestamo.';
COMMENT ON COLUMN prestamo.saldo_pendiente IS 'Se reduce con cada pago registrado en pago_prestamo.';

CREATE INDEX idx_prestamo_contrato_id ON prestamo (contrato_id);
CREATE INDEX idx_prestamo_estado      ON prestamo (estado);

CREATE TRIGGER trg_prestamo_updated_at
    BEFORE UPDATE ON prestamo
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- 3.10 PAGO_PRESTAMO
-- Cada abono parcial o total a un préstamo.
-- ---------------------------------------------------------------------------
CREATE TABLE pago_prestamo (
    id           INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    prestamo_id  INTEGER      NOT NULL,
    fecha        DATE         NOT NULL DEFAULT CURRENT_DATE,
    monto        NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    nota         VARCHAR(255),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_pago_prestamo
        FOREIGN KEY (prestamo_id) REFERENCES prestamo (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE  pago_prestamo        IS 'Abonos individuales a un préstamo. La suma de montos debe converger a monto_total para saldar el préstamo.';
COMMENT ON COLUMN pago_prestamo.nota   IS 'Observación libre; útil para acuerdos verbales o pagos en especie.';

CREATE INDEX idx_pago_prestamo_id ON pago_prestamo (prestamo_id);


-- ---------------------------------------------------------------------------
-- 3.11 TARJETA DE CRÉDITO
-- Tarjetas de crédito asociadas al propietario para seguimiento de deudas.
-- ---------------------------------------------------------------------------
CREATE TABLE credit_card (
    id               INTEGER            GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id       INTEGER            NOT NULL,
    alias            VARCHAR(100)       NOT NULL,
    entidad          VARCHAR(100),
    ultimos_digitos  VARCHAR(4)         NOT NULL,
    cupo_total       NUMERIC(12,2)      NOT NULL CHECK (cupo_total >= 0),
    estado           credit_card_estado NOT NULL DEFAULT 'activa',
    created_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_credit_card_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT uq_credit_card_usuario_alias
        UNIQUE (usuario_id, alias)
);

COMMENT ON TABLE credit_card IS 'Tarjetas de crédito del propietario para agregar deudas no ligadas a contratos de arriendo.';

CREATE INDEX idx_credit_card_usuario_id ON credit_card (usuario_id);

CREATE TRIGGER trg_credit_card_updated_at
    BEFORE UPDATE ON credit_card
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- 3.12 OWNER_DEBT
-- Deudas del propietario (tarjetas, préstamos externos u otros conceptos).
-- ---------------------------------------------------------------------------
CREATE TABLE owner_debt (
    id                INTEGER            GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id        INTEGER            NOT NULL,
    credit_card_id    INTEGER,
    tipo              VARCHAR(20)        NOT NULL CHECK (tipo IN ('credit_card', 'loan', 'other')),
    descripcion       VARCHAR(255)       NOT NULL,
    monto_total       NUMERIC(12,2)      NOT NULL CHECK (monto_total > 0),
    saldo_pendiente   NUMERIC(12,2)      NOT NULL CHECK (saldo_pendiente >= 0),
    fecha_corte       DATE,
    fecha_vencimiento DATE,
    estado            owner_debt_estado  NOT NULL DEFAULT 'pendiente',
    created_at        TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_owner_debt_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_owner_debt_credit_card
        FOREIGN KEY (credit_card_id) REFERENCES credit_card (id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT chk_owner_debt_saldo
        CHECK (saldo_pendiente <= monto_total)
);

COMMENT ON TABLE owner_debt IS 'Deudas de nivel propietario visibles en dashboard y módulo de créditos.';
COMMENT ON COLUMN owner_debt.tipo IS 'Tipo de deuda: credit_card, loan u other.';

CREATE INDEX idx_owner_debt_usuario_id ON owner_debt (usuario_id);
CREATE INDEX idx_owner_debt_estado ON owner_debt (estado);
CREATE INDEX idx_owner_debt_tipo ON owner_debt (tipo);

CREATE TRIGGER trg_owner_debt_updated_at
    BEFORE UPDATE ON owner_debt
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- 3.13 SERVICIO_CATALOGO
-- Catálogo maestro de servicios públicos/domiciliarios disponibles.
-- ---------------------------------------------------------------------------
CREATE TABLE servicio_catalogo (
    id         INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre     VARCHAR(100)  NOT NULL,
    tipo       servicio_tipo NOT NULL,
    proveedor  VARCHAR(100),
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_servicio_nombre_proveedor
        UNIQUE (nombre, proveedor)
);

COMMENT ON TABLE  servicio_catalogo           IS 'Catálogo de servicios (agua, luz, gas, internet…). Un mismo tipo puede tener múltiples proveedores.';
COMMENT ON COLUMN servicio_catalogo.proveedor IS 'Empresa prestadora del servicio. NULL si es genérico o aún no se conoce.';

CREATE TRIGGER trg_servicio_catalogo_updated_at
    BEFORE UPDATE ON servicio_catalogo
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- 3.14 CASA_SERVICIO
-- Tabla puente N:M → qué servicios están instalados en cada casa.
-- ---------------------------------------------------------------------------
CREATE TABLE casa_servicio (
    casa_id      INTEGER     NOT NULL,
    servicio_id  INTEGER     NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_casa_servicio
        PRIMARY KEY (casa_id, servicio_id),

    CONSTRAINT fk_casa_servicio_casa
        FOREIGN KEY (casa_id) REFERENCES casa (id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_casa_servicio_servicio
        FOREIGN KEY (servicio_id) REFERENCES servicio_catalogo (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE casa_servicio IS 'Relación muchos a muchos: registra qué servicios están activos en cada propiedad.';

-- El índice inverso acelera consultas "¿en qué casas está instalado este servicio?"
CREATE INDEX idx_casa_servicio_servicio_id ON casa_servicio (servicio_id);


-- ---------------------------------------------------------------------------
-- 3.15 FACTURA_SERVICIO
-- Factura mensual de un servicio específico que llega a una casa.
-- ---------------------------------------------------------------------------
CREATE TABLE factura_servicio (
    id                INTEGER        GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    casa_id           INTEGER        NOT NULL,
    servicio_id       INTEGER        NOT NULL,
    numero_factura    VARCHAR(50)    NOT NULL,
    anio              SMALLINT       NOT NULL CHECK (anio BETWEEN 2000 AND 2100),
    mes               SMALLINT       NOT NULL CHECK (mes BETWEEN 1 AND 12),
    fecha_vencimiento DATE           NOT NULL,
    valor_total       NUMERIC(12,2)  NOT NULL CHECK (valor_total > 0),
    estado            factura_estado NOT NULL DEFAULT 'pendiente',
    created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    -- El número de factura debe ser único por proveedor
    CONSTRAINT uq_factura_numero UNIQUE (servicio_id, numero_factura),

    -- No duplicar el mismo servicio/casa/periodo
    CONSTRAINT uq_factura_periodo UNIQUE (casa_id, servicio_id, anio, mes),

    CONSTRAINT fk_factura_casa
        FOREIGN KEY (casa_id) REFERENCES casa (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_factura_servicio
        FOREIGN KEY (servicio_id) REFERENCES servicio_catalogo (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE  factura_servicio               IS 'Factura mensual de un servicio que llega a la propiedad. Su valor se distribuye entre inquilinos vía cargo_servicio.';
COMMENT ON COLUMN factura_servicio.numero_factura IS 'Número o referencia oficial del proveedor. Único por servicio para evitar duplicados.';

CREATE INDEX idx_factura_servicio_casa_id     ON factura_servicio (casa_id);
CREATE INDEX idx_factura_servicio_servicio_id ON factura_servicio (servicio_id);
CREATE INDEX idx_factura_servicio_estado      ON factura_servicio (estado);

CREATE TRIGGER trg_factura_servicio_updated_at
    BEFORE UPDATE ON factura_servicio
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- 3.16 CARGO_SERVICIO
-- Porción de una factura asignada a un contrato/inquilino específico.
-- Permite repartir una factura compartida entre varios arrendatarios.
-- ---------------------------------------------------------------------------
CREATE TABLE cargo_servicio (
    id              INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    factura_id      INTEGER      NOT NULL,
    contrato_id     INTEGER      NOT NULL,
    monto_asignado  NUMERIC(12,2) NOT NULL CHECK (monto_asignado > 0),
    estado          cargo_estado NOT NULL DEFAULT 'pendiente',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    -- Un contrato no puede tener dos cargos del mismo periodo/factura
    CONSTRAINT uq_cargo_factura_contrato
        UNIQUE (factura_id, contrato_id),

    CONSTRAINT fk_cargo_factura
        FOREIGN KEY (factura_id) REFERENCES factura_servicio (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_cargo_contrato
        FOREIGN KEY (contrato_id) REFERENCES contrato (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE  cargo_servicio              IS 'Porción de una factura de servicio asignada a un inquilino. La suma de montos_asignados de una factura debe <= valor_total.';
COMMENT ON COLUMN cargo_servicio.monto_asignado IS 'Monto que debe pagar este contrato/inquilino de la factura global.';

CREATE INDEX idx_cargo_servicio_factura_id  ON cargo_servicio (factura_id);
CREATE INDEX idx_cargo_servicio_contrato_id ON cargo_servicio (contrato_id);

CREATE TRIGGER trg_cargo_servicio_updated_at
    BEFORE UPDATE ON cargo_servicio
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- 3.17 MANTENIMIENTO
-- Registro de trabajos de mantenimiento/reparación en una zona habitacional,
-- supervisados por un usuario del sistema.
-- ---------------------------------------------------------------------------
CREATE TABLE mantenimiento (
    id                    INTEGER              GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    zona_habitacional_id  INTEGER              NOT NULL,
    usuario_id            INTEGER              NOT NULL,
    fecha                 DATE                 NOT NULL DEFAULT CURRENT_DATE,
    descripcion           TEXT                 NOT NULL,
    costo                 NUMERIC(12,2)        NOT NULL DEFAULT 0 CHECK (costo >= 0),
    estado                mantenimiento_estado NOT NULL DEFAULT 'solicitado',
    created_at            TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ          NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_mantenimiento_zona
        FOREIGN KEY (zona_habitacional_id) REFERENCES zona_habitacional (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_mantenimiento_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON TABLE  mantenimiento              IS 'Trabajos de reparación o mejora sobre una zona. Supervisados por un usuario del sistema.';
COMMENT ON COLUMN mantenimiento.costo        IS 'Costo real del mantenimiento; puede actualizarse al terminar el trabajo.';
COMMENT ON COLUMN mantenimiento.descripcion  IS 'Descripción libre del problema o mejora realizada.';

CREATE INDEX idx_mantenimiento_zona_id    ON mantenimiento (zona_habitacional_id);
CREATE INDEX idx_mantenimiento_usuario_id ON mantenimiento (usuario_id);
CREATE INDEX idx_mantenimiento_estado     ON mantenimiento (estado);

CREATE TRIGGER trg_mantenimiento_updated_at
    BEFORE UPDATE ON mantenimiento
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- ===========================================================================
-- SECCIÓN 4: VISTAS ÚTILES
-- Consultas frecuentes preconstruidas para agilizar el desarrollo de la app.
-- ===========================================================================

-- Vista general de contratos activos con datos del inquilino y la zona
CREATE OR REPLACE VIEW v_resumen_financiero_contrato AS
SELECT
    c.id                                                        AS contrato_id,
    i.nombre || ' ' || i.apellido                               AS inquilino,
    z.nombre                                                    AS zona,
    ca.nombre                                                   AS casa,
    -- Pagos de renta (pre-agregados, sin riesgo de multiplicación)
    COALESCE(renta.total_esperado, 0)                           AS total_esperado_renta,
    COALESCE(renta.total_pagado,   0)                           AS total_pagado_renta,
    COALESCE(renta.total_esperado - renta.total_pagado, 0)      AS deuda_renta,
    -- Préstamos (pre-agregados independientemente)
    COALESCE(prest.deuda_total, 0)                              AS deuda_prestamos,
    -- Depósito (relación 1:1, sin problema)
    d.monto_disponible                                          AS deposito_disponible
FROM contrato c
JOIN inquilino         i  ON i.id  = c.inquilino_id
JOIN zona_habitacional z  ON z.id  = c.zona_habitacional_id
JOIN casa              ca ON ca.id = z.casa_id
-- Subconsulta 1: agrega renta antes de unirse al contrato
LEFT JOIN (
    SELECT
        contrato_id,
        SUM(monto_esperado) AS total_esperado,
        SUM(monto_pagado)   AS total_pagado
    FROM pago_renta
    GROUP BY contrato_id
) AS renta ON renta.contrato_id = c.id
-- Subconsulta 2: agrega préstamos antes de unirse al contrato
LEFT JOIN (
    SELECT
        contrato_id,
        SUM(saldo_pendiente) AS deuda_total
    FROM prestamo
    WHERE estado = 'activo'
    GROUP BY contrato_id
) AS prest ON prest.contrato_id = c.id
LEFT JOIN deposito d ON d.contrato_id = c.id;

COMMENT ON VIEW v_resumen_financiero_contrato IS
    'Resumen financiero por contrato: deuda de renta acumulada, saldo de préstamos activos y depósito disponible.';


-- Vista de resumen financiero mensual por contrato
CREATE OR REPLACE VIEW v_resumen_financiero_contrato AS
SELECT
    c.id                                      AS contrato_id,
    i.nombre || ' ' || i.apellido             AS inquilino,
    z.nombre                                  AS zona,
    ca.nombre                                 AS casa,
    -- Pagos de renta
    COALESCE(SUM(pr.monto_esperado), 0)       AS total_esperado_renta,
    COALESCE(SUM(pr.monto_pagado),   0)       AS total_pagado_renta,
    COALESCE(SUM(pr.monto_esperado) - SUM(pr.monto_pagado), 0) AS deuda_renta,
    -- Préstamos
    COALESCE(SUM(DISTINCT p.saldo_pendiente), 0) AS deuda_prestamos,
    -- Depósito
    d.monto_disponible                        AS deposito_disponible
FROM contrato c
JOIN inquilino         i  ON i.id  = c.inquilino_id
JOIN zona_habitacional z  ON z.id  = c.zona_habitacional_id
JOIN casa              ca ON ca.id = z.casa_id
LEFT JOIN pago_renta   pr ON pr.contrato_id = c.id
LEFT JOIN prestamo     p  ON p.contrato_id  = c.id AND p.estado = 'activo'
LEFT JOIN deposito     d  ON d.contrato_id  = c.id
GROUP BY c.id, i.nombre, i.apellido, z.nombre, ca.nombre, d.monto_disponible;

COMMENT ON VIEW v_resumen_financiero_contrato IS
    'Resumen financiero por contrato: deuda de renta acumulada, saldo de préstamos activos y depósito disponible.';


-- ===========================================================================
-- SECCIÓN 5: DATOS SEMILLA (SEED)
-- Valores mínimos necesarios para que la app arranque sin configuración manual.
-- ===========================================================================

-- Usuario administrador inicial (la contraseña se gestiona en la capa de app)
INSERT INTO usuario (nombre, apellido, correo, telefono, rol, estado)
VALUES ('Admin', 'Sistema', 'admin@gestion.local', NULL, 'administrador', 'activo');

-- Catálogo de servicios base
INSERT INTO servicio_catalogo (nombre, tipo, proveedor) VALUES
    ('Acueducto',        'agua',          NULL),
    ('Energía Eléctrica','electricidad',  NULL),
    ('Gas Natural',      'gas',           NULL),
    ('Internet',         'internet',      NULL),
    ('Aseo Urbano',      'aseo',          NULL);


-- ===========================================================================
-- FIN DEL ESQUEMA
-- ===========================================================================

COMMIT;
