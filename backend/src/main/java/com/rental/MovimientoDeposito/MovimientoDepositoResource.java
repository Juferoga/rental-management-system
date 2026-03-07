package com.rental.MovimientoDeposito;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.List;

@Path("/api/v1/movimientos-deposito")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "MovimientoDeposito", description = "Historial de descuentos y reintegros")
public class MovimientoDepositoResource {

    @GET
    @Operation(summary = "Listar todos", description = "Obtiene todos los registros de MovimientoDeposito.")
    @APIResponse(responseCode = "200", description = "Lista recuperada")
    public List<MovimientoDeposito> listar() {
        return MovimientoDeposito.listAll();
    }

    @POST
    @Transactional
    @Operation(summary = "Crear nuevo", description = "Crea un nuevo registro de MovimientoDeposito.")
    @APIResponse(responseCode = "201", description = "Creado exitosamente")
    public Response crear(MovimientoDeposito entidad) {
        entidad.persist();
        MovimientoDeposito.getEntityManager().flush();
        MovimientoDeposito.getEntityManager().refresh(entidad);
        return Response.status(Response.Status.CREATED).entity(entidad).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualizar", description = "Modifica los datos completos de un MovimientoDeposito existente.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizar(@PathParam("id") Integer id, MovimientoDeposito movimientoActualizado) {
        MovimientoDeposito existente = MovimientoDeposito.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        existente.deposito = movimientoActualizado.deposito;
        existente.fecha = movimientoActualizado.fecha;
        existente.monto = movimientoActualizado.monto;
        existente.tipo = movimientoActualizado.tipo;
        existente.motivo = movimientoActualizado.motivo;
        return Response.ok(existente).build();
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualización parcial", description = "Modifica únicamente los campos enviados para un MovimientoDeposito.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizarParcial(@PathParam("id") Integer id, MovimientoDeposito datosNuevos) {
        MovimientoDeposito existente = MovimientoDeposito.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (datosNuevos.deposito != null) existente.deposito = datosNuevos.deposito;
        if (datosNuevos.fecha != null) existente.fecha = datosNuevos.fecha;
        if (datosNuevos.monto != null) existente.monto = datosNuevos.monto;
        if (datosNuevos.tipo != null) existente.tipo = datosNuevos.tipo;
        if (datosNuevos.motivo != null) existente.motivo = datosNuevos.motivo;
        return Response.ok(existente).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Eliminar", description = "Borra un registro de MovimientoDeposito por ID.")
    @APIResponse(responseCode = "204", description = "Eliminado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response eliminar(@PathParam("id") Integer id) {
        if (MovimientoDeposito.deleteById(id)) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }
}
