package com.rental.ZonaHabitacional;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.List;

@Path("/api/v1/zonas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "ZonaHabitacional", description = "Gestión de habitaciones y locales")
public class ZonaHabitacionalResource {

    @GET
    @Operation(summary = "Listar todos", description = "Obtiene todos los registros de ZonaHabitacional.")
    @APIResponse(responseCode = "200", description = "Lista recuperada")
    public List<ZonaHabitacional> listar() {
        return ZonaHabitacional.listAll();
    }

    @POST
    @Transactional
    @Operation(summary = "Crear nuevo", description = "Crea un nuevo registro de ZonaHabitacional.")
    @APIResponse(responseCode = "201", description = "Creado exitosamente")
    public Response crear(ZonaHabitacional entidad) {
        entidad.persist();
        ZonaHabitacional.getEntityManager().flush();
        ZonaHabitacional.getEntityManager().refresh(entidad);
        return Response.status(Response.Status.CREATED).entity(entidad).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualizar", description = "Modifica los datos completos de una ZonaHabitacional existente.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizar(@PathParam("id") Integer id, ZonaHabitacional zonaActualizada) {
        ZonaHabitacional existente = ZonaHabitacional.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        existente.casa = zonaActualizada.casa;
        existente.nombre = zonaActualizada.nombre;
        existente.tipo = zonaActualizada.tipo;
        existente.areaM2 = zonaActualizada.areaM2;
        existente.valorArriendo = zonaActualizada.valorArriendo;
        existente.estado = zonaActualizada.estado;
        return Response.ok(existente).build();
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualización parcial", description = "Modifica únicamente los campos enviados para una ZonaHabitacional.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizarParcial(@PathParam("id") Integer id, ZonaHabitacional datosNuevos) {
        ZonaHabitacional existente = ZonaHabitacional.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (datosNuevos.casa != null) existente.casa = datosNuevos.casa;
        if (datosNuevos.nombre != null) existente.nombre = datosNuevos.nombre;
        if (datosNuevos.tipo != null) existente.tipo = datosNuevos.tipo;
        if (datosNuevos.areaM2 != null) existente.areaM2 = datosNuevos.areaM2;
        if (datosNuevos.valorArriendo != null) existente.valorArriendo = datosNuevos.valorArriendo;
        if (datosNuevos.estado != null) existente.estado = datosNuevos.estado;
        return Response.ok(existente).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Eliminar", description = "Borra un registro de ZonaHabitacional por ID.")
    @APIResponse(responseCode = "204", description = "Eliminado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response eliminar(@PathParam("id") Integer id) {
        if (ZonaHabitacional.deleteById(id)) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }
}
