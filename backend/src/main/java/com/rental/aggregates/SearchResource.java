package com.rental.aggregates;

import com.rental.dto.SearchResultDTO;
import io.quarkus.hibernate.orm.panache.Panache;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.ArrayList;
import java.util.List;

@Path("/api/v1/search")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Search", description = "Búsqueda global para topbar")
public class SearchResource {

    @GET
    @Operation(summary = "Buscar datos globales", description = "Retorna resultados de inquilinos, zonas y deudas.")
    public List<SearchResultDTO> search(@QueryParam("q") String query) {
        String q = query == null ? "" : query.trim().toLowerCase();
        if (q.isEmpty()) {
            return List.of();
        }

        String like = "%" + q + "%";
        List<SearchResultDTO> results = new ArrayList<>();

        List<Object[]> tenants = Panache.getEntityManager().createNativeQuery("""
                SELECT i.id,
                       TRIM(CONCAT(COALESCE(i.nombre, ''), ' ', COALESCE(i.apellido, ''))) AS full_name,
                       COALESCE(i.correo, '') AS correo
                FROM inquilino i
                WHERE LOWER(COALESCE(i.nombre, '')) LIKE :like
                   OR LOWER(COALESCE(i.apellido, '')) LIKE :like
                   OR LOWER(TRIM(CONCAT(COALESCE(i.nombre, ''), ' ', COALESCE(i.apellido, '')))) LIKE :like
                ORDER BY full_name
                LIMIT 10
                """).setParameter("like", like).getResultList();

        for (Object[] row : tenants) {
            Integer id = (Integer) row[0];
            String fullName = String.valueOf(row[1]);
            String correo = String.valueOf(row[2]);
            results.add(new SearchResultDTO(
                    "Inquilino",
                    fullName,
                    correo,
                    "/admin/inquilinos/" + id + "/editar"
            ));
        }

        List<Object[]> zones = Panache.getEntityManager().createNativeQuery("""
                SELECT z.id, z.nombre
                FROM zona_habitacional z
                WHERE LOWER(z.nombre) LIKE :like
                ORDER BY z.nombre
                LIMIT 10
                """).setParameter("like", like).getResultList();

        for (Object[] row : zones) {
            Integer id = (Integer) row[0];
            String nombre = String.valueOf(row[1]);
            results.add(new SearchResultDTO(
                    "Zona",
                    nombre,
                    "Zona habitacional",
                    "/admin/zonas/" + id + "/editar"
            ));
        }

        List<Object[]> debts = Panache.getEntityManager().createNativeQuery("""
                SELECT p.id,
                       COALESCE(NULLIF(p.motivo, ''), CONCAT('Deuda #', p.id)) AS motivo,
                       COALESCE(CAST(p.estado AS TEXT), 'Sin estado') AS estado
                FROM prestamo p
                WHERE LOWER(COALESCE(p.motivo, '')) LIKE :like
                ORDER BY p.id DESC
                LIMIT 10
                """).setParameter("like", like).getResultList();

        for (Object[] row : debts) {
            Integer id = (Integer) row[0];
            String motivo = String.valueOf(row[1]);
            String estado = String.valueOf(row[2]);
            results.add(new SearchResultDTO(
                    "Deuda",
                    motivo,
                    "Estado: " + estado,
                    "/admin/deudas/" + id + "/editar"
            ));
        }

        return results;
    }
}
