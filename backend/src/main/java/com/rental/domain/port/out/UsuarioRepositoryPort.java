package com.rental.domain.port.out;

import java.util.List;

import com.rental.domain.model.Usuario;

public interface UsuarioRepositoryPort {
    List<Usuario> listarTodos();    
}
