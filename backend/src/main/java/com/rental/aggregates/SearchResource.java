package com.rental.aggregates;

import com.rental.dto.GlobalSearchResult;
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
    @Operation(summary = "Buscar datos globales", description = "Retorna resultados de zonas, arriendos, servicios y deudas.")
    public List<GlobalSearchResult> search(@QueryParam("q") String query) {
        String q = query == null ? "" : query.trim().toLowerCase();
        if (q.isEmpty()) {
            return List.of();
        }

        String like = "%" + q + "%";
        List<GlobalSearchResult> results = new ArrayList<>();

        List<Object[]> zones = Panache.getEntityManager().createNativeQuery("""
                SELECT z.id, z.nombre
                FROM zona_habitacional z
                WHERE LOWER(z.nombre) LIKE :like
                ORDER BY z.nombre
                LIMIT 10
                """).setParameter("like", like).getResultList();

        for (Object[] row : zones) {
            String id = String.valueOf(row[0]);
            String label = "Zona: " + row[1];
            results.add(new GlobalSearchResult(id, "ZONE", label, "/arriendos/" + id));
            results.add(new GlobalSearchResult(id, "SERVICE", "Servicios: " + row[1], "/servicios/" + id));
        }

        List<Object[]> rents = Panache.getEntityManager().createNativeQuery("""
                SELECT z.id,
                       CONCAT(i.nombre, ' ', i.apellido) AS tenant_name
                FROM contrato c
                JOIN zona_habitacional z ON z.id = c.zona_habitacional_id
                JOIN inquilino i ON i.id = c.inquilino_id
                WHERE LOWER(CONCAT(i.nombre, ' ', i.apellido)) LIKE :like
                ORDER BY tenant_name
                LIMIT 10
                """).setParameter("like", like).getResultList();

        for (Object[] row : rents) {
            String id = String.valueOf(row[0]);
            results.add(new GlobalSearchResult(id, "RENT", "Arriendo: " + row[1], "/arriendos/" + id));
        }

        List<Object[]> debts = Panache.getEntityManager().createNativeQuery("""
                SELECT od.id, od.descripcion
                FROM owner_debt od
                WHERE LOWER(od.descripcion) LIKE :like
                ORDER BY od.id DESC
                LIMIT 10
                """).setParameter("like", like).getResultList();

        for (Object[] row : debts) {
            String id = String.valueOf(row[0]);
            results.add(new GlobalSearchResult(id, "DEBT", "Deuda: " + row[1], "/creditos/" + id));
        }

        return results;
    }
}
