package com.rental.ServicioCatalogo;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.List;

@Path("/api/v1/servicios-catalogo")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "ServicioCatalogo", description = "Catálogo maestro de servicios públicos")
public class ServicioCatalogoResource {

    @GET
    @Operation(summary = "Listar todos", description = "Obtiene todos los registros de ServicioCatalogo.")
    @APIResponse(responseCode = "200", description = "Lista recuperada")
    public List<ServicioCatalogo> listar() {
        return ServicioCatalogo.listAll();
    }

    @POST
    @Transactional
    @Operation(summary = "Crear nuevo", description = "Crea un nuevo registro de ServicioCatalogo.")
    @APIResponse(responseCode = "201", description = "Creado exitosamente")
    public Response crear(ServicioCatalogo entidad) {
        entidad.persist();
        ServicioCatalogo.getEntityManager().flush();
        ServicioCatalogo.getEntityManager().refresh(entidad);
        return Response.status(Response.Status.CREATED).entity(entidad).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualizar", description = "Modifica los datos completos de un ServicioCatalogo existente.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizar(@PathParam("id") Integer id, ServicioCatalogo servicioActualizado) {
        ServicioCatalogo existente = ServicioCatalogo.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        existente.nombre = servicioActualizado.nombre;
        existente.tipo = servicioActualizado.tipo;
        existente.proveedor = servicioActualizado.proveedor;
        return Response.ok(existente).build();
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualización parcial", description = "Modifica únicamente los campos enviados para un ServicioCatalogo.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizarParcial(@PathParam("id") Integer id, ServicioCatalogo datosNuevos) {
        ServicioCatalogo existente = ServicioCatalogo.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (datosNuevos.nombre != null) existente.nombre = datosNuevos.nombre;
        if (datosNuevos.tipo != null) existente.tipo = datosNuevos.tipo;
        if (datosNuevos.proveedor != null) existente.proveedor = datosNuevos.proveedor;
        return Response.ok(existente).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Eliminar", description = "Borra un registro de ServicioCatalogo por ID.")
    @APIResponse(responseCode = "204", description = "Eliminado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response eliminar(@PathParam("id") Integer id) {
        if (ServicioCatalogo.deleteById(id)) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }
}
