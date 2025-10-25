# ═══════════════════════════════════════════════════════════════════════
# Script: Configurar Contraseñas de TODOS los Usuarios en Keycloak
# ═══════════════════════════════════════════════════════════════════════
# Descripción:
#   Configura automáticamente las contraseñas de todos los usuarios de prueba
#   en Keycloak y verifica que el login funcione para cada uno.
#
# Usuarios configurados:
#   • carlos.test    → test123       (Rol: Empleado)
#   • maria.contador → contador123   (Rol: contador)
#   • juan.gerente   → gerente123    (Rol: gerente)
#   • admin.datum    → admin123      (Rol: admin)
#
# Uso:
#   .\setup-keycloak-passwords.ps1
#
# Prerequisitos:
#   - Docker debe estar corriendo
#   - Keycloak debe estar levantado con realm importado
# ═══════════════════════════════════════════════════════════════════════

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🔐 Configurando Contraseñas de Usuarios en Keycloak  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Configuración
$KEYCLOAK_URL = "http://localhost:8180"
$ADMIN_USER = "admin"
$ADMIN_PASSWORD = "admin123"
$REALM = "datum-travels"
$CLIENT_ID = "datum-travels-backend"
$CLIENT_SECRET = "tpQkr9c6f1nD8ksGoM51hexkfbnr9UvT"

# Lista de usuarios a configurar
$usuarios = @(
    @{
        username = "carlos.test"
        password = "test123"
        descripcion = "Empleado básico"
    },
    @{
        username = "maria.contador"
        password = "contador123"
        descripcion = "Personal contable"
    },
    @{
        username = "juan.gerente"
        password = "gerente123"
        descripcion = "Gerente de área"
    },
    @{
        username = "admin.datum"
        password = "admin123"
        descripcion = "Administrador"
    }
)

# ═══════════════════════════════════════════════════════════════════════
# Paso 1: Verificar que Keycloak esté corriendo
# ═══════════════════════════════════════════════════════════════════════

Write-Host "1️⃣  Verificando que Keycloak esté corriendo..." -ForegroundColor Yellow

try {
    $healthCheck = Invoke-WebRequest -Uri "$KEYCLOAK_URL/health/ready" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Keycloak está corriendo y listo`n" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Error: Keycloak no está respondiendo" -ForegroundColor Red
    Write-Host "   Ejecuta: docker-compose -f docker-compose-dev.yml up -d`n" -ForegroundColor Yellow
    exit 1
}

# ═══════════════════════════════════════════════════════════════════════
# Paso 2: Obtener token de administrador
# ═══════════════════════════════════════════════════════════════════════

Write-Host "2️⃣  Obteniendo token de administrador..." -ForegroundColor Yellow

try {
    $tokenResponse = Invoke-RestMethod -Uri "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" `
        -Method POST `
        -Body "grant_type=password&client_id=admin-cli&username=$ADMIN_USER&password=$ADMIN_PASSWORD" `
        -ContentType "application/x-www-form-urlencoded" `
        -ErrorAction Stop
    
    $adminToken = $tokenResponse.access_token
    Write-Host "   ✅ Token obtenido correctamente`n" -ForegroundColor Green
    
} catch {
    Write-Host "   ❌ Error al autenticar como admin" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)`n" -ForegroundColor Yellow
    exit 1
}

# ═══════════════════════════════════════════════════════════════════════
# Paso 3: Configurar contraseña para cada usuario
# ═══════════════════════════════════════════════════════════════════════

Write-Host "3️⃣  Configurando contraseñas de usuarios...`n" -ForegroundColor Yellow

$exitos = 0
$fallos = 0

foreach ($usuario in $usuarios) {
    $username = $usuario.username
    $password = $usuario.password
    $descripcion = $usuario.descripcion
    
    Write-Host "   🔧 Procesando: $username ($descripcion)" -ForegroundColor Cyan
    
    try {
        # Buscar el usuario en Keycloak
        $users = Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$REALM/users?username=$username" `
            -Headers @{Authorization = "Bearer $adminToken"} `
            -ErrorAction Stop
        
        if ($users.Count -eq 0) {
            Write-Host "      ⚠️  Usuario '$username' no encontrado en Keycloak (crear primero en realm)" -ForegroundColor Yellow
            $fallos++
            continue
        }
        
        $userId = $users[0].id
        
        # Establecer la contraseña
        $passwordBody = @{
            type = "password"
            value = $password
            temporary = $false
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$REALM/users/$userId/reset-password" `
            -Method PUT `
            -Headers @{
                Authorization = "Bearer $adminToken"
                "Content-Type" = "application/json"
            } `
            -Body $passwordBody `
            -ErrorAction Stop
        
        Write-Host "      ✅ Contraseña configurada: $password" -ForegroundColor Green
        
        # Verificar que el login funcione
        try {
            $testLogin = Invoke-RestMethod -Uri "$KEYCLOAK_URL/realms/$REALM/protocol/openid-connect/token" `
                -Method POST `
                -Body "grant_type=password&client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&username=$username&password=$password" `
                -ContentType "application/x-www-form-urlencoded" `
                -ErrorAction Stop
            
            if ($testLogin.access_token) {
                Write-Host "      ✅ Login verificado - Token JWT obtenido" -ForegroundColor Green
                $exitos++
            }
        } catch {
            Write-Host "      ⚠️  Contraseña configurada pero login falló (verificar client config)" -ForegroundColor Yellow
            $fallos++
        }
        
    } catch {
        Write-Host "      ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        $fallos++
    }
    
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════════════════
# Resumen Final
# ═══════════════════════════════════════════════════════════════════════

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📊 RESUMEN DE CONFIGURACIÓN                          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "✅ Usuarios configurados exitosamente: $exitos" -ForegroundColor Green
if ($fallos -gt 0) {
    Write-Host "⚠️  Usuarios con problemas: $fallos`n" -ForegroundColor Yellow
} else {
    Write-Host "❌ Usuarios fallidos: $fallos`n" -ForegroundColor Red
}

if ($exitos -gt 0) {
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "🔑 CREDENCIALES CONFIGURADAS:`n" -ForegroundColor Yellow
    
    Write-Host "Usuario          │ Contraseña    │ Descripción" -ForegroundColor White
    Write-Host "─────────────────┼───────────────┼────────────────────" -ForegroundColor Gray
    foreach ($usuario in $usuarios) {
        $u = $usuario.username.PadRight(16)
        $p = $usuario.password.PadRight(13)
        $d = $usuario.descripcion
        Write-Host "$u │ $p │ $d" -ForegroundColor Gray
    }
    
    Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "🧪 PROBAR LOGIN (PowerShell):`n" -ForegroundColor Yellow
    
    Write-Host "# Ejemplo con carlos.test:" -ForegroundColor Cyan
    Write-Host '$body = @{usuarioApp="carlos.test"; contrasena="test123"} | ConvertTo-Json' -ForegroundColor Gray
    Write-Host 'Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -Body $body -ContentType "application/json"' -ForegroundColor Gray
    
    Write-Host "`n# Ejemplo con maria.contador:" -ForegroundColor Cyan
    Write-Host '$body = @{usuarioApp="maria.contador"; contrasena="contador123"} | ConvertTo-Json' -ForegroundColor Gray
    Write-Host 'Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method POST -Body $body -ContentType "application/json"' -ForegroundColor Gray
    
    Write-Host "`n═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "🎯 PRÓXIMOS PASOS:`n" -ForegroundColor Yellow
    
    Write-Host "1. Asegúrate de que el backend esté corriendo:" -ForegroundColor White
    Write-Host "   cd BackEnd/quarkus-api && .\mvnw quarkus:dev`n" -ForegroundColor Gray
    
    Write-Host "2. Prueba el login con cualquier usuario" -ForegroundColor White
    Write-Host "3. Los roles se obtienen automáticamente del token JWT`n" -ForegroundColor White
    
    Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
}

if ($exitos -eq $usuarios.Count) {
    Write-Host "🎉 ¡CONFIGURACIÓN COMPLETADA AL 100%!" -ForegroundColor Green -BackgroundColor Black
    Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
} elseif ($exitos -gt 0) {
    Write-Host "⚠️  Configuración parcial completada" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
} else {
    Write-Host "❌ No se pudo configurar ningún usuario" -ForegroundColor Red
    Write-Host "   Verifica que el realm esté importado correctamente`n" -ForegroundColor Yellow
}
