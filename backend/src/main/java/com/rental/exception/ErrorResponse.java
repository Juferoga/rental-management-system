package com.rental.exception;

public class ErrorResponse {
    public int status;
    public String error;
    public String mensaje;

    public ErrorResponse(int status, String error, String mensaje) {
        this.status = status;
        this.error = error;
        this.mensaje = mensaje;
    }
}
