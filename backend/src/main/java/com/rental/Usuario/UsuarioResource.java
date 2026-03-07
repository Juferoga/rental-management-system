package com.rental.Usuario;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

@Path("/api/v1/usuarios")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Usuarios", description = "Gestión de administradores y propietarios")
public class UsuarioResource {

    @GET
    @Operation(summary = "Listar usuarios", description = "Obtiene la lista completa de todos los usuarios registrados en el sistema.")
    @APIResponse(responseCode = "200", description = "Lista recuperada exitosamente")
    public List<Usuario> listarTodos() {
        return Usuario.listAll();
    }

    @POST
    @Transactional
    @Operation(summary = "Crear un nuevo usuario", description = "Registra un usuario en el sistema con su rol correspondiente.")
    @APIResponse(responseCode = "201", description = "Usuario creado exitosamente")
    public Response crear(Usuario usuario) {
        usuario.persist();
        return Response.status(Response.Status.CREATED).entity(usuario).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualizar usuario", description = "Modifica los datos completos de un usuario existente.")
    @APIResponse(responseCode = "200", description = "Usuario actualizado correctamente")
    @APIResponse(responseCode = "404", description = "Usuario no encontrado en la base de datos")
    public Response actualizar(@PathParam("id") Integer id, Usuario usuarioActualizado) {
        
        Usuario usuarioExistente = Usuario.findById(id);
        
        if (usuarioExistente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        
        usuarioExistente.nombre = usuarioActualizado.nombre;
        usuarioExistente.apellido = usuarioActualizado.apellido;
        usuarioExistente.correo = usuarioActualizado.correo;
        usuarioExistente.telefono = usuarioActualizado.telefono;
        usuarioExistente.rol = usuarioActualizado.rol;
        usuarioExistente.estado = usuarioActualizado.estado;
        
        return Response.ok(usuarioExistente).build();
    }

    @PATCH
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Actualización parcial", description = "Modifica únicamente los campos enviados sin afectar el resto de la información del usuario.")
    @APIResponse(responseCode = "200", description = "Usuario actualizado correctamente")
    @APIResponse(responseCode = "404", description = "Usuario no encontrado")
    public Response actualizarParcial(@PathParam("id") Integer id, Usuario datosNuevos) {
        Usuario existente = Usuario.findById(id);
        if (existente == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        if (datosNuevos.nombre != null) existente.nombre = datosNuevos.nombre;
        if (datosNuevos.apellido != null) existente.apellido = datosNuevos.apellido;
        if (datosNuevos.correo != null) existente.correo = datosNuevos.correo;
        if (datosNuevos.telefono != null) existente.telefono = datosNuevos.telefono;
        if (datosNuevos.rol != null) existente.rol = datosNuevos.rol;
        if (datosNuevos.estado != null) existente.estado = datosNuevos.estado;

        return Response.ok(existente).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    @Operation(summary = "Eliminar usuario", description = "Borra un usuario del sistema mediante su ID numérico.")
    @APIResponse(responseCode = "204", description = "Usuario eliminado")
    @APIResponse(responseCode = "404", description = "Usuario no encontrado")
    public Response eliminar(@PathParam("id") Integer id) {
        boolean borrado = Usuario.deleteById(id);
        if (borrado) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND).build();
    }
}