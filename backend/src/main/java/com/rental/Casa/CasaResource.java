package com.rental.Casa;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.List;

@Path("/api/v1/casas")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Casa", description = "Gestión de propiedades inmuebles")
public class CasaResource {

    @GET
    @Operation(summary = "Listar todos", description = "Obtiene todos los registros de Casa.")
    @APIResponse(responseCode = "200", description = "Lista recuperada")
    public List<Casa> listar() {
        return Casa.listAll();
    }

    @POST
    @Transactional
    @Operation(summary = "Crear nuevo", description = "Crea un nuevo registro de Casa.")
    @APIResponse(responseCode = "201", description = "Creado exitosamente")
    public Response crear(Casa entidad) {
        entidad.persist();
        Casa.getEntityManager().flush();
        Casa.getEntityManager().refresh(entidad);
        return Response.status(Response.Status.CREATED).entity(entidad).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualizar", description = "Modifica los datos completos de una Casa existente.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizar(@PathParam("id") Integer id, Casa casaActualizada) {
        Casa existente = Casa.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        existente.usuario = casaActualizada.usuario;
        existente.nombre = casaActualizada.nombre;
        existente.direccion = casaActualizada.direccion;
        existente.barrio = casaActualizada.barrio;
        existente.ciudad = casaActualizada.ciudad;
        existente.estado = casaActualizada.estado;
        return Response.ok(existente).build();
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualización parcial", description = "Modifica únicamente los campos enviados en la Casa.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizarParcial(@PathParam("id") Integer id, Casa datosNuevos) {
        Casa existente = Casa.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (datosNuevos.usuario != null) existente.usuario = datosNuevos.usuario;
        if (datosNuevos.nombre != null) existente.nombre = datosNuevos.nombre;
        if (datosNuevos.direccion != null) existente.direccion = datosNuevos.direccion;
        if (datosNuevos.barrio != null) existente.barrio = datosNuevos.barrio;
        if (datosNuevos.ciudad != null) existente.ciudad = datosNuevos.ciudad;
        if (datosNuevos.estado != null) existente.estado = datosNuevos.estado;
        return Response.ok(existente).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Eliminar", description = "Borra un registro de Casa por ID.")
    @APIResponse(responseCode = "204", description = "Eliminado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response eliminar(@PathParam("id") Integer id) {
        if (Casa.deleteById(id)) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }
}
