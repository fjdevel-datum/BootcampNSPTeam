# Script para probar la eliminación de eventos
# Asegúrate de que el backend esté corriendo en http://localhost:8081

Write-Host "🧪 Test: Eliminar Evento con Gastos Asociados" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$backendUrl = "http://localhost:8081"
$username = "carlos.martinez"  # Cambiar según tu usuario
$password = "1234"              # Cambiar según tu contraseña

Write-Host "📝 Paso 1: Obtener token de autenticación..." -ForegroundColor Yellow

# Obtener token de Keycloak
$keycloakUrl = "http://localhost:9090/realms/datum-travels/protocol/openid-connect/token"
$body = @{
    grant_type = "password"
    client_id = "datum-travels-app"
    username = $username
    password = $password
}

try {
    $tokenResponse = Invoke-RestMethod -Uri $keycloakUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
    $token = $tokenResponse.access_token
    Write-Host "✅ Token obtenido exitosamente" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Error al obtener token: $_" -ForegroundColor Red
    exit 1
}

# Headers con autenticación
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "📝 Paso 2: Listar eventos existentes..." -ForegroundColor Yellow
try {
    $eventos = Invoke-RestMethod -Uri "$backendUrl/api/eventos" -Method Get -Headers $headers
    
    if ($eventos.Count -eq 0) {
        Write-Host "⚠️ No hay eventos registrados. Creando uno de prueba..." -ForegroundColor Yellow
        
        # Crear evento de prueba
        $nuevoEvento = @{
            nombreEvento = "EVENTO PRUEBA ELIMINACION"
        } | ConvertTo-Json
        
        $eventoCreado = Invoke-RestMethod -Uri "$backendUrl/api/eventos" -Method Post -Headers $headers -Body $nuevoEvento
        Write-Host "✅ Evento creado: $($eventoCreado.nombreEvento) (ID: $($eventoCreado.idEvento))" -ForegroundColor Green
        $idEventoAEliminar = $eventoCreado.idEvento
    } else {
        Write-Host "✅ Eventos encontrados:" -ForegroundColor Green
        foreach ($evento in $eventos) {
            Write-Host "   - $($evento.nombreEvento) (ID: $($evento.idEvento)) - Estado: $($evento.estado)" -ForegroundColor White
        }
        
        # Tomar el primer evento
        $idEventoAEliminar = $eventos[0].idEvento
        Write-Host ""
        Write-Host "📌 Usando evento ID: $idEventoAEliminar para prueba de eliminación" -ForegroundColor Cyan
    }
    Write-Host ""
} catch {
    Write-Host "❌ Error al listar eventos: $_" -ForegroundColor Red
    exit 1
}

Write-Host "📝 Paso 3: Verificar gastos del evento..." -ForegroundColor Yellow
try {
    $gastos = Invoke-RestMethod -Uri "$backendUrl/api/gastos/evento/$idEventoAEliminar" -Method Get -Headers $headers
    Write-Host "✅ El evento tiene $($gastos.Count) gasto(s) registrado(s)" -ForegroundColor Green
    
    if ($gastos.Count -gt 0) {
        Write-Host "   Gastos que serán eliminados:" -ForegroundColor Yellow
        foreach ($gasto in $gastos) {
            Write-Host "   - $($gasto.descripcion): `$$($gasto.monto) $($gasto.moneda)" -ForegroundColor White
        }
    }
    Write-Host ""
} catch {
    Write-Host "⚠️ No se pudieron obtener los gastos del evento" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "📝 Paso 4: Eliminar evento (CASCADE)..." -ForegroundColor Yellow
Write-Host "⚠️ Se eliminarán el evento Y todos sus gastos asociados" -ForegroundColor Red

$confirmacion = Read-Host "¿Confirmas la eliminación del evento ID $idEventoAEliminar? (s/n)"

if ($confirmacion -ne "s") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    exit 0
}

try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/eventos/$idEventoAEliminar" -Method Delete -Headers $headers
    
    if ($response.StatusCode -eq 204) {
        Write-Host "✅ Evento eliminado exitosamente (HTTP 204 No Content)" -ForegroundColor Green
        Write-Host ""
        
        # Verificar que ya no existe
        Write-Host "📝 Paso 5: Verificar eliminación..." -ForegroundColor Yellow
        try {
            $eventoEliminado = Invoke-RestMethod -Uri "$backendUrl/api/eventos/$idEventoAEliminar" -Method Get -Headers $headers
            Write-Host "❌ ERROR: El evento aún existe en la BD" -ForegroundColor Red
        } catch {
            if ($_.Exception.Response.StatusCode -eq 404) {
                Write-Host "✅ Confirmado: El evento ya no existe (HTTP 404)" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Error al verificar: $_" -ForegroundColor Yellow
            }
        }
        
        # Verificar que los gastos también fueron eliminados
        try {
            $gastosRestantes = Invoke-RestMethod -Uri "$backendUrl/api/gastos/evento/$idEventoAEliminar" -Method Get -Headers $headers
            if ($gastosRestantes.Count -eq 0) {
                Write-Host "✅ Confirmado: Todos los gastos asociados fueron eliminados (CASCADE)" -ForegroundColor Green
            } else {
                Write-Host "❌ ERROR: Aún quedan $($gastosRestantes.Count) gasto(s) en la BD" -ForegroundColor Red
            }
        } catch {
            Write-Host "✅ Confirmado: No quedan gastos del evento eliminado" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️ Respuesta inesperada: HTTP $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "❌ Error: Evento no encontrado (HTTP 404)" -ForegroundColor Red
    } else {
        Write-Host "❌ Error al eliminar evento: $_" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🏁 Prueba completada" -ForegroundColor Cyan
