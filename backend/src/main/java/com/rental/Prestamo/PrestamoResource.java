package com.rental.Prestamo;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.List;

@Path("/api/v1/prestamos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Prestamo", description = "Gestión de préstamos a inquilinos")
public class PrestamoResource {

    @GET
    @Operation(summary = "Listar todos", description = "Obtiene todos los registros de Prestamo.")
    @APIResponse(responseCode = "200", description = "Lista recuperada")
    public List<Prestamo> listar() {
        return Prestamo.listAll();
    }

    @POST
    @Transactional
    @Operation(summary = "Crear nuevo", description = "Crea un nuevo registro de Prestamo.")
    @APIResponse(responseCode = "201", description = "Creado exitosamente")
    public Response crear(Prestamo entidad) {
        entidad.persist();
        Prestamo.getEntityManager().flush();
        Prestamo.getEntityManager().refresh(entidad);
        return Response.status(Response.Status.CREATED).entity(entidad).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualizar", description = "Modifica los datos completos de un Prestamo existente.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizar(@PathParam("id") Integer id, Prestamo prestamoActualizado) {
        Prestamo existente = Prestamo.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        existente.contrato = prestamoActualizado.contrato;
        existente.fecha = prestamoActualizado.fecha;
        existente.montoTotal = prestamoActualizado.montoTotal;
        existente.saldoPendiente = prestamoActualizado.saldoPendiente;
        existente.motivo = prestamoActualizado.motivo;
        existente.estado = prestamoActualizado.estado;
        return Response.ok(existente).build();
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualización parcial", description = "Modifica únicamente los campos enviados para un Prestamo.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizarParcial(@PathParam("id") Integer id, Prestamo datosNuevos) {
        Prestamo existente = Prestamo.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (datosNuevos.contrato != null) existente.contrato = datosNuevos.contrato;
        if (datosNuevos.fecha != null) existente.fecha = datosNuevos.fecha;
        if (datosNuevos.montoTotal != null) existente.montoTotal = datosNuevos.montoTotal;
        if (datosNuevos.saldoPendiente != null) existente.saldoPendiente = datosNuevos.saldoPendiente;
        if (datosNuevos.motivo != null) existente.motivo = datosNuevos.motivo;
        if (datosNuevos.estado != null) existente.estado = datosNuevos.estado;
        return Response.ok(existente).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Eliminar", description = "Borra un registro de Prestamo por ID.")
    @APIResponse(responseCode = "204", description = "Eliminado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response eliminar(@PathParam("id") Integer id) {
        if (Prestamo.deleteById(id)) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }
}
