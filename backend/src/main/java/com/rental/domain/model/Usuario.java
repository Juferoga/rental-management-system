package com.rental.domain.model;

public class Usuario {
    private Integer id;
    private String nombre;
    private String apellido;
    private String correo;
    private String rol;
    private String estado;

    public Usuario(Integer id, String nombre, String apellido, String correo, String rol, String estado) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.rol = rol;
        this.estado = estado;
    }
    
    public Integer getId() { return id; }
    public String getNombre() { return nombre; }
    public String getApellido() { return apellido; }
    public String getCorreo() { return correo; }
    public String getRol() { return rol; }
    public String getEstado() { return estado; }
}