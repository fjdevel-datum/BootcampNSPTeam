# ═══════════════════════════════════════════════════════════════════════
# Script: Crear Usuarios en Keycloak
# ═══════════════════════════════════════════════════════════════════════
# Descripción:
#   Crea los usuarios maria.contador, juan.gerente y admin.datum en Keycloak
#   y les asigna sus roles correspondientes.
# ═══════════════════════════════════════════════════════════════════════

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  👥 Crear Usuarios en Keycloak                        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Configuración
$KEYCLOAK_URL = "http://localhost:8180"
$ADMIN_USER = "admin"
$ADMIN_PASSWORD = "admin123"
$REALM = "datum-travels"

# Usuarios a crear
$usuarios = @(
    @{
        username = "maria.contador"
        email = "maria.contador@datum.com"
        firstName = "María"
        lastName = "Contador"
        role = "contador"
        password = "contador123"
    },
    @{
        username = "juan.gerente"
        email = "juan.gerente@datum.com"
        firstName = "Juan"
        lastName = "Gerente"
        role = "gerente"
        password = "gerente123"
    },
    @{
        username = "admin.datum"
        email = "admin.datum@datum.com"
        firstName = "Admin"
        lastName = "Datum"
        role = "admin"
        password = "admin123"
    }
)

# ═══════════════════════════════════════════════════════════════════════
# Paso 1: Obtener token de administrador
# ═══════════════════════════════════════════════════════════════════════

Write-Host "1️⃣  Obteniendo token de administrador..." -ForegroundColor Yellow

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
# Paso 2: Obtener ID del rol para cada usuario
# ═══════════════════════════════════════════════════════════════════════

Write-Host "2️⃣  Obteniendo roles del realm..." -ForegroundColor Yellow

try {
    $roles = Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$REALM/roles" `
        -Headers @{Authorization = "Bearer $adminToken"} `
        -ErrorAction Stop
    
    # Crear mapa de roles
    $roleMap = @{}
    foreach ($role in $roles) {
        $roleMap[$role.name] = $role.id
    }
    
    Write-Host "   ✅ Roles obtenidos: Empleado, contador, gerente, admin`n" -ForegroundColor Green
    
} catch {
    Write-Host "   ❌ Error al obtener roles" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)`n" -ForegroundColor Yellow
    exit 1
}

# ═══════════════════════════════════════════════════════════════════════
# Paso 3: Crear cada usuario
# ═══════════════════════════════════════════════════════════════════════

Write-Host "3️⃣  Creando usuarios...`n" -ForegroundColor Yellow

$exitos = 0
$fallos = 0

foreach ($usuario in $usuarios) {
    $username = $usuario.username
    
    Write-Host "   🔧 Procesando: $username" -ForegroundColor Cyan
    
    try {
        # Verificar si ya existe
        $existingUser = Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$REALM/users?username=$username" `
            -Headers @{Authorization = "Bearer $adminToken"} `
            -ErrorAction Stop
        
        if ($existingUser.Count -gt 0) {
            Write-Host "      ⚠️  Usuario ya existe, actualizando..." -ForegroundColor Yellow
            $userId = $existingUser[0].id
        } else {
            # Crear usuario
            $userBody = @{
                username = $usuario.username
                email = $usuario.email
                firstName = $usuario.firstName
                lastName = $usuario.lastName
                enabled = $true
                emailVerified = $true
            } | ConvertTo-Json
            
            $createResponse = Invoke-WebRequest -Uri "$KEYCLOAK_URL/admin/realms/$REALM/users" `
                -Method POST `
                -Headers @{
                    Authorization = "Bearer $adminToken"
                    "Content-Type" = "application/json"
                } `
                -Body $userBody `
                -ErrorAction Stop
            
            # Obtener el ID del usuario creado
            $location = $createResponse.Headers.Location
            $userId = $location.Split('/')[-1]
            
            Write-Host "      ✅ Usuario creado (ID: $userId)" -ForegroundColor Green
        }
        
        # Establecer contraseña
        $passwordBody = @{
            type = "password"
            value = $usuario.password
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
        
        Write-Host "      ✅ Contraseña configurada: $($usuario.password)" -ForegroundColor Green
        
        # Asignar rol
        $roleName = $usuario.role
        $roleData = $roles | Where-Object { $_.name -eq $roleName }
        
        if ($roleData) {
            $roleAssignBody = @(
                @{
                    id = $roleData.id
                    name = $roleData.name
                }
            ) | ConvertTo-Json -AsArray
            
            Invoke-RestMethod -Uri "$KEYCLOAK_URL/admin/realms/$REALM/users/$userId/role-mappings/realm" `
                -Method POST `
                -Headers @{
                    Authorization = "Bearer $adminToken"
                    "Content-Type" = "application/json"
                } `
                -Body $roleAssignBody `
                -ErrorAction Stop
            
            Write-Host "      ✅ Rol asignado: $roleName" -ForegroundColor Green
        }
        
        $exitos++
        
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
Write-Host "║  📊 RESUMEN                                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "✅ Usuarios creados exitosamente: $exitos" -ForegroundColor Green
Write-Host "❌ Usuarios fallidos: $fallos`n" -ForegroundColor $(if ($fallos -gt 0) { "Red" } else { "Gray" })

if ($exitos -gt 0) {
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "🎯 PRÓXIMO PASO:`n" -ForegroundColor Yellow
    
    Write-Host "Ahora ejecuta el script para verificar los logins:" -ForegroundColor White
    Write-Host ".\setup-keycloak-passwords.ps1`n" -ForegroundColor Gray
    
    Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
}

if ($exitos -eq $usuarios.Count) {
    Write-Host "🎉 ¡TODOS LOS USUARIOS CREADOS CORRECTAMENTE!" -ForegroundColor Green -BackgroundColor Black
    Write-Host "═══════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
}
