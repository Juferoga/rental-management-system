package com.rental.PagoPrestamo;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.List;

@Path("/api/v1/pagos-prestamo")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "PagoPrestamo", description = "Gestión de abonos a préstamos")
public class PagoPrestamoResource {

    @GET
    @Operation(summary = "Listar todos", description = "Obtiene todos los registros de PagoPrestamo.")
    @APIResponse(responseCode = "200", description = "Lista recuperada")
    public List<PagoPrestamo> listar() {
        return PagoPrestamo.listAll();
    }

    @POST
    @Transactional
    @Operation(summary = "Crear nuevo", description = "Crea un nuevo registro de PagoPrestamo.")
    @APIResponse(responseCode = "201", description = "Creado exitosamente")
    public Response crear(PagoPrestamo entidad) {
        entidad.persist();
        PagoPrestamo.getEntityManager().flush();
        PagoPrestamo.getEntityManager().refresh(entidad);
        return Response.status(Response.Status.CREATED).entity(entidad).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualizar", description = "Modifica los datos completos de un PagoPrestamo existente.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizar(@PathParam("id") Integer id, PagoPrestamo pagoActualizado) {
        PagoPrestamo existente = PagoPrestamo.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        existente.prestamo = pagoActualizado.prestamo;
        existente.fecha = pagoActualizado.fecha;
        existente.monto = pagoActualizado.monto;
        existente.nota = pagoActualizado.nota;
        return Response.ok(existente).build();
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualización parcial", description = "Modifica únicamente los campos enviados para un PagoPrestamo.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizarParcial(@PathParam("id") Integer id, PagoPrestamo datosNuevos) {
        PagoPrestamo existente = PagoPrestamo.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (datosNuevos.prestamo != null) existente.prestamo = datosNuevos.prestamo;
        if (datosNuevos.fecha != null) existente.fecha = datosNuevos.fecha;
        if (datosNuevos.monto != null) existente.monto = datosNuevos.monto;
        if (datosNuevos.nota != null) existente.nota = datosNuevos.nota;
        return Response.ok(existente).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Eliminar", description = "Borra un registro de PagoPrestamo por ID.")
    @APIResponse(responseCode = "204", description = "Eliminado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response eliminar(@PathParam("id") Integer id) {
        if (PagoPrestamo.deleteById(id)) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }
}
