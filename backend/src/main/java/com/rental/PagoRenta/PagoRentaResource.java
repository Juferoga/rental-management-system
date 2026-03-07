package com.rental.PagoRenta;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.List;

@Path("/api/v1/pagos-renta")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "PagoRenta", description = "Gestión de mensualidades")
public class PagoRentaResource {

    @GET
    @Operation(summary = "Listar todos", description = "Obtiene todos los registros de PagoRenta.")
    @APIResponse(responseCode = "200", description = "Lista recuperada")
    public List<PagoRenta> listar() {
        return PagoRenta.listAll();
    }

    @POST
    @Transactional
    @Operation(summary = "Crear nuevo", description = "Crea un nuevo registro de PagoRenta.")
    @APIResponse(responseCode = "201", description = "Creado exitosamente")
    public Response crear(PagoRenta entidad) {
        entidad.persist();
        PagoRenta.getEntityManager().flush();
        PagoRenta.getEntityManager().refresh(entidad);
        return Response.status(Response.Status.CREATED).entity(entidad).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualizar", description = "Modifica los datos completos de un PagoRenta existente.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizar(@PathParam("id") Integer id, PagoRenta pagoActualizado) {
        PagoRenta existente = PagoRenta.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        existente.contrato = pagoActualizado.contrato;
        existente.anio = pagoActualizado.anio;
        existente.mes = pagoActualizado.mes;
        existente.montoEsperado = pagoActualizado.montoEsperado;
        existente.montoPagado = pagoActualizado.montoPagado;
        existente.fechaPago = pagoActualizado.fechaPago;
        existente.metodoPago = pagoActualizado.metodoPago;
        existente.estado = pagoActualizado.estado;
        return Response.ok(existente).build();
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualización parcial", description = "Modifica únicamente los campos enviados para un PagoRenta.")
    @APIResponse(responseCode = "200", description = "Registro actualizado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response actualizarParcial(@PathParam("id") Integer id, PagoRenta datosNuevos) {
        PagoRenta existente = PagoRenta.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (datosNuevos.contrato != null) existente.contrato = datosNuevos.contrato;
        if (datosNuevos.anio != null) existente.anio = datosNuevos.anio;
        if (datosNuevos.mes != null) existente.mes = datosNuevos.mes;
        if (datosNuevos.montoEsperado != null) existente.montoEsperado = datosNuevos.montoEsperado;
        if (datosNuevos.montoPagado != null) existente.montoPagado = datosNuevos.montoPagado;
        if (datosNuevos.fechaPago != null) existente.fechaPago = datosNuevos.fechaPago;
        if (datosNuevos.metodoPago != null) existente.metodoPago = datosNuevos.metodoPago;
        if (datosNuevos.estado != null) existente.estado = datosNuevos.estado;
        return Response.ok(existente).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Eliminar", description = "Borra un registro de PagoRenta por ID.")
    @APIResponse(responseCode = "204", description = "Eliminado correctamente")
    @APIResponse(responseCode = "404", description = "No encontrado")
    public Response eliminar(@PathParam("id") Integer id) {
        if (PagoRenta.deleteById(id)) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }
}
