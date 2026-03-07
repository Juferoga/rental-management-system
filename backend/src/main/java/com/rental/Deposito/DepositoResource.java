package com.rental.Deposito;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.List;

@Path("/api/v1/depositos")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Deposito", description = "Gestión de depósitos de garantía")
public class DepositoResource {

    @GET
    @Operation(summary = "Listar todos", description = "Obtiene todos los registros de Deposito.")
    @APIResponse(responseCode = "200", description = "Lista recuperada")
    public List<Deposito> listar() {
        return Deposito.listAll();
    }

    @POST
    @Transactional
    @Operation(summary = "Crear nuevo", description = "Crea un nuevo registro de Deposito.")
    @APIResponse(responseCode = "201", description = "Creado exitosamente")
    public Response crear(Deposito entidad) {
        entidad.persist();
        Deposito.getEntityManager().flush();
        Deposito.getEntityManager().refresh(entidad);
        return Response.status(Response.Status.CREATED).entity(entidad).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualizar", description = "Modifica los datos completos de un Deposito existente.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizar(@PathParam("id") Integer id, Deposito depositoActualizado) {
        Deposito existente = Deposito.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        existente.contrato = depositoActualizado.contrato;
        existente.montoInicial = depositoActualizado.montoInicial;
        existente.montoDisponible = depositoActualizado.montoDisponible;
        existente.estado = depositoActualizado.estado;
        return Response.ok(existente).build();
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualización parcial", description = "Modifica únicamente los campos enviados para un Deposito.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizarParcial(@PathParam("id") Integer id, Deposito datosNuevos) {
        Deposito existente = Deposito.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (datosNuevos.contrato != null) existente.contrato = datosNuevos.contrato;
        if (datosNuevos.montoInicial != null) existente.montoInicial = datosNuevos.montoInicial;
        if (datosNuevos.montoDisponible != null) existente.montoDisponible = datosNuevos.montoDisponible;
        if (datosNuevos.estado != null) existente.estado = datosNuevos.estado;
        return Response.ok(existente).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Eliminar", description = "Borra un registro de Deposito por ID.")
    @APIResponse(responseCode = "204", description = "Eliminado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response eliminar(@PathParam("id") Integer id) {
        if (Deposito.deleteById(id)) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }
}
