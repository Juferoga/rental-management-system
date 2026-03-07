package com.rental.exception;

import jakarta.persistence.PersistenceException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.hibernate.exception.ConstraintViolationException;

@Provider
public class PersistenceExceptionMapper implements ExceptionMapper<PersistenceException> {

    @Override
    public Response toResponse(PersistenceException ex) {
        ConstraintViolationException cve = buscarCausa(ex, ConstraintViolationException.class);

        if (cve != null) {
            String constraint = cve.getConstraintName() != null ? cve.getConstraintName() : extraerConstraintDelMensaje(ex.getMessage());
            String mensaje = resolverMensaje(constraint != null ? constraint : "desconocida");
            return Response.status(Response.Status.CONFLICT)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(new ErrorResponse(409, "Conflicto de datos", mensaje))
                    .build();
        }

        // Detectar violación de unicidad por mensaje aunque no haya ConstraintViolationException
        String rawMsg = ex.getMessage() != null ? ex.getMessage() : "";
        if (rawMsg.contains("duplicate key") || rawMsg.contains("violates unique constraint")) {
            String constraint = extraerConstraintDelMensaje(rawMsg);
            String mensaje = resolverMensaje(constraint != null ? constraint : "desconocida");
            return Response.status(Response.Status.CONFLICT)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(new ErrorResponse(409, "Conflicto de datos", mensaje))
                    .build();
        }

        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .type(MediaType.APPLICATION_JSON)
                .entity(new ErrorResponse(500, "Error interno", rawMsg))
                .build();
    }

    @SuppressWarnings("unchecked")
    private <T extends Throwable> T buscarCausa(Throwable ex, Class<T> tipo) {
        Throwable current = ex;
        while (current != null) {
            if (tipo.isInstance(current)) return (T) current;
            current = current.getCause();
        }
        return null;
    }

    private String extraerConstraintDelMensaje(String mensaje) {
        if (mensaje == null) return null;
        // Parsea: unique constraint "nombre_constraint"
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("unique constraint \"([^\"]+)\"")
                .matcher(mensaje);
        return m.find() ? m.group(1) : null;
    }

    private String resolverMensaje(String constraint) {
        return switch (constraint.toLowerCase()) {
            case "uq_usuario_correo"         -> "Ya existe un usuario con ese correo electrónico.";
            case "usuario_pkey"              -> "Ya existe un usuario con ese ID.";
            case "inquilino_tipo_identificacion_identificacion_key" -> "Ya existe un inquilino con ese tipo y número de identificación.";
            case "uq_deposito_contrato"      -> "Ya existe un depósito registrado para ese contrato.";
            case "uq_factura_numero"         -> "Ya existe una factura con ese número para ese servicio.";
            case "uq_factura_periodo"        -> "Ya existe una factura para esa casa, servicio, año y mes.";
            case "pago_renta_contrato_id_anio_mes_key" -> "Ya existe un pago de renta registrado para ese contrato, año y mes.";
            case "servicio_catalogo_nombre_proveedor_key" -> "Ya existe un servicio con ese nombre y proveedor.";
            case "cargo_servicio_factura_id_contrato_id_key" -> "Ya existe un cargo de servicio para esa factura y contrato.";
            default -> "Violación de restricción única o de integridad referencial: [" + constraint + "]";
        };
    }
}
