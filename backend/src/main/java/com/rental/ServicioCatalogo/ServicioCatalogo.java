package com.rental.ServicioCatalogo;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

@Entity @Table(name = "servicio_catalogo")
public class ServicioCatalogo extends PanacheEntityBase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Integer id;
    public String nombre;
    public String tipo;
    public String proveedor;
}
