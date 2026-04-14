CREATE TABLE owner_debt (
    id INT PRIMARY KEY,
    usuario_id INT,
    tipo VARCHAR(50),
    descripcion VARCHAR(255),
    monto_total DECIMAL(10,2),
    saldo_pendiente DECIMAL(10,2),
    fecha_corte DATE,
    fecha_vencimiento DATE,
    estado VARCHAR(50),
    credit_card_id INT
);
