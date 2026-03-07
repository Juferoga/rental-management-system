package com.rental.infrastructure.adapter.out.persistence;

import com.rental.domain.model.Usuario;
import com.rental.domain.port.out.UsuarioRepositoryPort;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class UsuarioPanacheRepository implements PanacheRepositoryBase<UsuarioEntity, Integer>, UsuarioRepositoryPort {
    @Override
    public List<Usuario> listarTodos() {
        return listAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private Usuario toDomain(UsuarioEntity entity) {
        return new Usuario(
            entity.id, entity.nombre, entity.apellido,
            entity.correo, entity.rol, entity.estado
        );
    }
}
