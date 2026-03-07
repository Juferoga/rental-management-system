package com.rental.Contrato;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.List;

@Path("/api/v1/contratos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Contrato", description = "Gestión de contratos de arrendamiento")
public class ContratoResource {

    @GET
    @Operation(summary = "Listar todos", description = "Obtiene todos los registros de Contrato.")
    @APIResponse(responseCode = "200", description = "Lista recuperada")
    public List<Contrato> listar() {
        return Contrato.listAll();
    }

    @POST
    @Transactional
    @Operation(summary = "Crear nuevo", description = "Crea un nuevo registro de Contrato.")
    @APIResponse(responseCode = "201", description = "Creado exitosamente")
    public Response crear(Contrato entidad) {
        entidad.persist();
        Contrato.getEntityManager().flush();
        Contrato.getEntityManager().refresh(entidad);
        return Response.status(Response.Status.CREATED).entity(entidad).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualizar", description = "Modifica los datos completos de un Contrato existente.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizar(@PathParam("id") Integer id, Contrato contratoActualizado) {
        Contrato existente = Contrato.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        existente.inquilino = contratoActualizado.inquilino;
        existente.zonaHabitacional = contratoActualizado.zonaHabitacional;
        existente.fechaFirma = contratoActualizado.fechaFirma;
        existente.fechaInicio = contratoActualizado.fechaInicio;
        existente.fechaFin = contratoActualizado.fechaFin;
        existente.valorPactado = contratoActualizado.valorPactado;
        existente.estado = contratoActualizado.estado;
        return Response.ok(existente).build();
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualización parcial", description = "Modifica únicamente los campos enviados para un Contrato.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizarParcial(@PathParam("id") Integer id, Contrato datosNuevos) {
        Contrato existente = Contrato.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (datosNuevos.inquilino != null) existente.inquilino = datosNuevos.inquilino;
        if (datosNuevos.zonaHabitacional != null) existente.zonaHabitacional = datosNuevos.zonaHabitacional;
        if (datosNuevos.fechaFirma != null) existente.fechaFirma = datosNuevos.fechaFirma;
        if (datosNuevos.fechaInicio != null) existente.fechaInicio = datosNuevos.fechaInicio;
        if (datosNuevos.fechaFin != null) existente.fechaFin = datosNuevos.fechaFin;
        if (datosNuevos.valorPactado != null) existente.valorPactado = datosNuevos.valorPactado;
        if (datosNuevos.estado != null) existente.estado = datosNuevos.estado;
        return Response.ok(existente).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Eliminar", description = "Borra un registro de Contrato por ID.")
    @APIResponse(responseCode = "204", description = "Eliminado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response eliminar(@PathParam("id") Integer id) {
        if (Contrato.deleteById(id)) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }
}
