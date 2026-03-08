---
name: rental-backend
description: >
  Sistema de gestión de arriendos REST API. Usa este skill para consultar,
  crear, actualizar y eliminar datos del sistema: casas, inquilinos, contratos,
  pagos de renta, depósitos, mantenimientos, préstamos y servicios.
  Úsalo cuando el usuario pregunte por propiedades, inquilinos, pagos, contratos
  o cualquier entidad del sistema de arriendos.
---

# Skill: rental-backend — API del Sistema de Arriendos

**Base URL interna:** `http://backend:8080/api/v1`

Usa `curl` para todas las operaciones. El backend devuelve JSON.

## Reglas de uso

1. **Consulta antes de responder** — si el usuario pregunta por datos reales, haz el `curl` y muestra los datos, no supongas.
2. **Formato de salida** — presenta los resultados de forma visual y amigable (ver sección de formato más abajo).
3. **Referencias entre entidades** — usa `{"id": N}` para referenciar entidades relacionadas.
4. **Fechas** — formato `YYYY-MM-DD`. Al mostrarlas, usa formato legible: `1 de marzo de 2026`.
5. **Errores** — 404 = no existe, 409 = conflicto de datos únicos, 400 = datos inválidos.

---

## Formato de respuesta para usuarios (muy importante)

Telegram renderiza Markdown. Úsalo siempre para hacer las respuestas bonitas y legibles.

### Reglas de formato

- **Negrita** para etiquetas: `*Casa:*`, `*Inquilino:*`, `*Monto:*`
- Emojis como encabezados de sección (ver tabla abajo)
- Dinero siempre con signo y puntuación: `$1.500.000`
- Fechas en español: `15 de enero de 2026`
- Estado con emoji de color:
  - ACTIVO / DISPONIBLE / PAGADO → ✅
  - INACTIVO / OCUPADO / PENDIENTE → 🔴 / 🟡
  - COMPLETADO → ✔️
- Lista con bullets `•` en vez de guiones
- Separar registros con una línea en blanco
- Terminar con un resumen amigable: `_Total: 3 casas registradas_`

### Ejemplo de respuesta para una lista de casas

```
🏠 *Casas registradas*

*1.* Casa Norte
• 📍 Calle 45 #12-30, Chapinero, Bogotá
• Estado: ✅ Activo

*2.* Apartamento Centro
• 📍 Carrera 7 #20-15, Centro, Bogotá  
• Estado: 🔴 Inactivo

_Total: 2 propiedades_
```

### Ejemplo de respuesta para pagos

```
💰 *Pagos de renta — Marzo 2026*

*Contrato #1* (Juan Pérez)
• Monto esperado: $500.000
• Monto pagado: $500.000
• Fecha: 1 de marzo de 2026
• Método: Transferencia
• Estado: ✅ Pagado

_Total cobrado: $500.000 de $500.000_
```

### Emojis por entidad

| Entidad | Emoji |
|---|---|
| Casas | 🏠 |
| Zonas / Habitaciones | 🚪 |
| Inquilinos | 👤 |
| Contratos | 📄 |
| Pagos de renta | 💰 |
| Depósitos | 🔒 |
| Mantenimientos | 🔧 |
| Servicios / Facturas | 💡 |
| Préstamos | 🏦 |
| Usuarios del sistema | 👥 |

---

## Endpoints disponibles

### 🏠 Casas
```bash
curl -s http://backend:8080/api/v1/casas
curl -s -X POST http://backend:8080/api/v1/casas \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Mi Casa","direccion":"Calle 1 #2-3","barrio":"Centro","ciudad":"Bogotá","estado":"ACTIVO","usuario":{"id":1}}'
curl -s -X PATCH http://backend:8080/api/v1/casas/{id} \
  -H "Content-Type: application/json" \
  -d '{"estado":"INACTIVO"}'
curl -s -X DELETE http://backend:8080/api/v1/casas/{id}
```

### 🚪 Zonas Habitacionales
```bash
curl -s http://backend:8080/api/v1/zonas
curl -s -X POST http://backend:8080/api/v1/zonas \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Habitación 1","tipo":"HABITACION","areaM2":12.5,"valorArriendo":500000,"estado":"DISPONIBLE","casa":{"id":1}}'
```

### 👤 Inquilinos
```bash
curl -s http://backend:8080/api/v1/inquilinos
curl -s -X POST http://backend:8080/api/v1/inquilinos \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","apellido":"Pérez","tipoIdentificacion":"CC","identificacion":"123456","telefono":"3001234567","correo":"juan@mail.com"}'
```

### 📄 Contratos
```bash
curl -s http://backend:8080/api/v1/contratos
curl -s -X POST http://backend:8080/api/v1/contratos \
  -H "Content-Type: application/json" \
  -d '{"inquilino":{"id":1},"zonaHabitacional":{"id":1},"fechaFirma":"2026-01-01","fechaInicio":"2026-01-01","fechaFin":"2026-12-31","valorPactado":500000,"estado":"ACTIVO"}'
```

### 💰 Pagos de Renta
```bash
curl -s http://backend:8080/api/v1/pagos-renta
curl -s -X POST http://backend:8080/api/v1/pagos-renta \
  -H "Content-Type: application/json" \
  -d '{"contrato":{"id":1},"anio":2026,"mes":3,"montoEsperado":500000,"montoPagado":500000,"fechaPago":"2026-03-01","metodoPago":"TRANSFERENCIA","estado":"PAGADO"}'
```

### 🔒 Depósitos
```bash
curl -s http://backend:8080/api/v1/depositos
curl -s -X POST http://backend:8080/api/v1/depositos \
  -H "Content-Type: application/json" \
  -d '{"contrato":{"id":1},"montoInicial":1000000,"montoDisponible":1000000,"estado":"ACTIVO"}'
```

### 🔧 Mantenimientos
```bash
curl -s http://backend:8080/api/v1/mantenimientos
curl -s -X POST http://backend:8080/api/v1/mantenimientos \
  -H "Content-Type: application/json" \
  -d '{"zona":{"id":1},"usuario":{"id":1},"fecha":"2026-03-08","descripcion":"Reparación tubería","costo":150000,"estado":"COMPLETADO"}'
```

### 💡 Servicios Catálogo
```bash
curl -s http://backend:8080/api/v1/servicios-catalogo
```

### 🧾 Facturas de Servicio
```bash
curl -s http://backend:8080/api/v1/facturas-servicio
curl -s -X POST http://backend:8080/api/v1/facturas-servicio \
  -H "Content-Type: application/json" \
  -d '{"casa":{"id":1},"servicio":{"id":1},"numeroFactura":"FAC-001","anio":2026,"mes":3,"fechaVencimiento":"2026-03-15","valorTotal":80000,"estado":"PENDIENTE"}'
```

### 📊 Cargos de Servicio
```bash
curl -s http://backend:8080/api/v1/cargos-servicio
```

### 🏦 Préstamos
```bash
curl -s http://backend:8080/api/v1/prestamos
curl -s -X POST http://backend:8080/api/v1/prestamos \
  -H "Content-Type: application/json" \
  -d '{"contrato":{"id":1},"fecha":"2026-03-08","montoTotal":500000,"saldoPendiente":500000,"motivo":"Adelanto de garantía","estado":"ACTIVO"}'
```

### 💳 Pagos de Préstamo
```bash
curl -s http://backend:8080/api/v1/pagos-prestamo
```

### 👥 Usuarios del sistema
```bash
curl -s http://backend:8080/api/v1/usuarios
```

---

## Equivalencias lenguaje natural → comando

| El usuario dice | Comando |
|---|---|
| "lista las casas" | `curl -s http://backend:8080/api/v1/casas` |
| "qué inquilinos hay" | `curl -s http://backend:8080/api/v1/inquilinos` |
| "contratos activos" | GET /contratos → filtrar por estado=ACTIVO |
| "pagos de marzo 2026" | GET /pagos-renta → filtrar por anio=2026 mes=3 |
| "saldo depósito contrato 1" | GET /depositos → buscar contrato.id=1 |
| "registrar pago de renta" | POST /pagos-renta con datos del contrato |
| "nuevo inquilino" | POST /inquilinos con los datos |
| "crear contrato" | POST /contratos (necesita id de inquilino y de zona) |

## Resúmenes finales

Siempre termina una consulta con un resumen en cursiva, por ejemplo:
- `_Total: 4 casas, 3 activas_`
- `_2 de 3 pagos al día este mes_`
- `_Depósito disponible: $800.000_`

Si no hay datos, responde con un mensaje amable:
> 📭 _No encontré registros todavía. ¿Quieres agregar uno?_
