package com.rental.infrastructure.adapter.out.persistence;

import jakarta.persistence.*;

@Entity
@Table(name = "usuario")
public class UsuarioEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;
    public String nombre;
    public String apellido;
    public String correo;
    public String rol;
    public String estado;
}
