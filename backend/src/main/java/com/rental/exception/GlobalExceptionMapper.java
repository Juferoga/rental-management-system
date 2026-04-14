package com.rental.exception;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Exception> {

    private static final Logger LOG = Logger.getLogger(GlobalExceptionMapper.class);

    @Override
    public Response toResponse(Exception exception) {
        if (exception instanceof WebApplicationException webEx) {
            int status = webEx.getResponse().getStatus();
            return Response.status(status)
                    .type(MediaType.APPLICATION_JSON)
                    .entity(new ErrorResponse(status, "Error de aplicación", webEx.getMessage()))
                    .build();
        }

        LOG.error("Error interno del servidor", exception);
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .type(MediaType.APPLICATION_JSON)
                .entity(new ErrorResponse(500, "Error interno", "Ocurrió un error inesperado en el servidor"))
                .build();
    }
}
