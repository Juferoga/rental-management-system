CREATE OR REPLACE FUNCTION fn_actualizar_saldo_prestamo()
RETURNS TRIGGER
LANGUAGE plpgsql AS
$$
BEGIN
    -- Restar el monto pagado del saldo pendiente
    UPDATE prestamo
    SET saldo_pendiente = saldo_pendiente - NEW.monto
    WHERE id = NEW.prestamo_id;

    -- Si el saldo llega a 0 (o menos), actualizar el estado a saldado
    UPDATE prestamo
    SET estado = 'saldado'
    WHERE id = NEW.prestamo_id AND saldo_pendiente <= 0;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pago_prestamo_insert
    AFTER INSERT ON pago_prestamo
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_saldo_prestamo();