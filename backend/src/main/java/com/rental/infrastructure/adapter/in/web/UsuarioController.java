package com.rental.infrastructure.adapter.in.web;

import java.util.List;

import com.rental.domain.model.Usuario;
import com.rental.domain.port.in.ListarUsuariosUseCase;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;

@Path("/api/v1/usuarios")
public class UsuarioController {
    private final ListarUsuariosUseCase listarUsuariosUseCase;

    public UsuarioController(ListarUsuariosUseCase listarUsuariosUseCase) {
        this.listarUsuariosUseCase = listarUsuariosUseCase;
    }

    @GET
    public List<Usuario> listar(){
        return listarUsuariosUseCase.listarTodos();
    }
}
