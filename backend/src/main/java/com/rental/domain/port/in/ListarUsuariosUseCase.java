package com.rental.domain.port.in;

import java.util.List;

import com.rental.domain.model.Usuario;

public interface ListarUsuariosUseCase {
    List<Usuario> listarTodos();
}
