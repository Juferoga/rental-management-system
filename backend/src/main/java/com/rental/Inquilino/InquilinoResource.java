package com.rental.Inquilino;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.List;

@Path("/api/v1/inquilinos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Inquilino", description = "Gestión de arrendatarios")
public class InquilinoResource {

    @GET
    @Operation(summary = "Listar todos", description = "Obtiene todos los registros de Inquilino.")
    @APIResponse(responseCode = "200", description = "Lista recuperada")
    public List<Inquilino> listar() {
        return Inquilino.listAll();
    }

    @POST
    @Transactional
    @Operation(summary = "Crear nuevo", description = "Crea un nuevo registro de Inquilino.")
    @APIResponse(responseCode = "201", description = "Creado exitosamente")
    public Response crear(Inquilino entidad) {
        entidad.persist();
        Inquilino.getEntityManager().flush();
        Inquilino.getEntityManager().refresh(entidad);
        return Response.status(Response.Status.CREATED).entity(entidad).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualizar", description = "Modifica los datos completos de un Inquilino existente.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizar(@PathParam("id") Integer id, Inquilino inquilinoActualizado) {
        Inquilino existente = Inquilino.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        existente.nombre = inquilinoActualizado.nombre;
        existente.apellido = inquilinoActualizado.apellido;
        existente.tipoIdentificacion = inquilinoActualizado.tipoIdentificacion;
        existente.identificacion = inquilinoActualizado.identificacion;
        existente.telefono = inquilinoActualizado.telefono;
        existente.correo = inquilinoActualizado.correo;
        return Response.ok(existente).build();
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualización parcial", description = "Modifica únicamente los campos enviados para un Inquilino.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizarParcial(@PathParam("id") Integer id, Inquilino datosNuevos) {
        Inquilino existente = Inquilino.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (datosNuevos.nombre != null) existente.nombre = datosNuevos.nombre;
        if (datosNuevos.apellido != null) existente.apellido = datosNuevos.apellido;
        if (datosNuevos.tipoIdentificacion != null) existente.tipoIdentificacion = datosNuevos.tipoIdentificacion;
        if (datosNuevos.identificacion != null) existente.identificacion = datosNuevos.identificacion;
        if (datosNuevos.telefono != null) existente.telefono = datosNuevos.telefono;
        if (datosNuevos.correo != null) existente.correo = datosNuevos.correo;
        return Response.ok(existente).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Eliminar", description = "Borra un registro de Inquilino por ID.")
    @APIResponse(responseCode = "204", description = "Eliminado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response eliminar(@PathParam("id") Integer id) {
        if (Inquilino.deleteById(id)) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }
}
