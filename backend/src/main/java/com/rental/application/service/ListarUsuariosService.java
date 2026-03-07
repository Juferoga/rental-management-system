package com.rental.application.service;

import java.util.List;
import com.rental.domain.model.Usuario;
import com.rental.domain.port.in.ListarUsuariosUseCase;
import com.rental.domain.port.out.UsuarioRepositoryPort;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ListarUsuariosService implements ListarUsuariosUseCase {

    private final UsuarioRepositoryPort usuarioRepository;

    public ListarUsuariosService(UsuarioRepositoryPort usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public List<Usuario> listarTodos() {
        return usuarioRepository.listarTodos();
    }
    
}
