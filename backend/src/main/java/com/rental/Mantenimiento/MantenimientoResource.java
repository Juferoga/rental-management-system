package com.rental.Mantenimiento;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.List;

@Path("/api/v1/mantenimientos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Mantenimiento", description = "Registro de reparaciones")
public class MantenimientoResource {

    @GET
    @Operation(summary = "Listar todos", description = "Obtiene todos los registros de Mantenimiento.")
    @APIResponse(responseCode = "200", description = "Lista recuperada")
    public List<Mantenimiento> listar() {
        return Mantenimiento.listAll();
    }

    @POST
    @Transactional
    @Operation(summary = "Crear nuevo", description = "Crea un nuevo registro de Mantenimiento.")
    @APIResponse(responseCode = "201", description = "Creado exitosamente")
    public Response crear(Mantenimiento entidad) {
        entidad.persist();
        Mantenimiento.getEntityManager().flush();
        Mantenimiento.getEntityManager().refresh(entidad);
        return Response.status(Response.Status.CREATED).entity(entidad).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualizar", description = "Modifica los datos completos de un Mantenimiento existente.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizar(@PathParam("id") Integer id, Mantenimiento mantenimientoActualizado) {
        Mantenimiento existente = Mantenimiento.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        existente.zona = mantenimientoActualizado.zona;
        existente.usuario = mantenimientoActualizado.usuario;
        existente.fecha = mantenimientoActualizado.fecha;
        existente.descripcion = mantenimientoActualizado.descripcion;
        existente.costo = mantenimientoActualizado.costo;
        existente.estado = mantenimientoActualizado.estado;
        return Response.ok(existente).build();
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualización parcial", description = "Modifica únicamente los campos enviados para un Mantenimiento.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizarParcial(@PathParam("id") Integer id, Mantenimiento datosNuevos) {
        Mantenimiento existente = Mantenimiento.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (datosNuevos.zona != null) existente.zona = datosNuevos.zona;
        if (datosNuevos.usuario != null) existente.usuario = datosNuevos.usuario;
        if (datosNuevos.fecha != null) existente.fecha = datosNuevos.fecha;
        if (datosNuevos.descripcion != null) existente.descripcion = datosNuevos.descripcion;
        if (datosNuevos.costo != null) existente.costo = datosNuevos.costo;
        if (datosNuevos.estado != null) existente.estado = datosNuevos.estado;
        return Response.ok(existente).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Eliminar", description = "Borra un registro de Mantenimiento por ID.")
    @APIResponse(responseCode = "204", description = "Eliminado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response eliminar(@PathParam("id") Integer id) {
        if (Mantenimiento.deleteById(id)) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }
}
