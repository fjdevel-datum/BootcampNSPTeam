package datum.travels.shared.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Servicio para generación y validación de tokens JWT
 * Usa HMAC-SHA512 para firmar los tokens
 */
@ApplicationScoped
public class JwtService {

    @ConfigProperty(name = "jwt.secret")
    String jwtSecret;

    @ConfigProperty(name = "jwt.expiration", defaultValue = "3600")
    Long jwtExpiration; // en segundos

    @ConfigProperty(name = "jwt.issuer", defaultValue = "datum-travels-api")
    String jwtIssuer;

    /**
     * Genera un token JWT para un usuario
     *
     * @param idUsuario ID del usuario
     * @param usuarioApp Nombre de usuario
     * @return Token JWT firmado
     */
    public String generateToken(Long idUsuario, String usuarioApp) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + (jwtExpiration * 1000));

        return Jwts.builder()
                .subject(idUsuario.toString())
                .claim("usuarioApp", usuarioApp)
                .issuer(jwtIssuer)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extrae el ID de usuario del token
     *
     * @param token JWT
     * @return ID del usuario
     */
    public Long extractIdUsuario(String token) {
        Claims claims = extractClaims(token);
        return Long.parseLong(claims.getSubject());
    }

    /**
     * Extrae el nombre de usuario del token
     *
     * @param token JWT
     * @return Nombre de usuario
     */
    public String extractUsuarioApp(String token) {
        Claims claims = extractClaims(token);
        return claims.get("usuarioApp", String.class);
    }

    /**
     * Valida si un token es válido
     *
     * @param token JWT a validar
     * @return true si es válido, false si no
     */
    public boolean validateToken(String token) {
        try {
            Claims claims = extractClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extrae todos los claims del token
     *
     * @param token JWT
     * @return Claims del token
     */
    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Obtiene la clave de firma desde la configuración
     *
     * @return SecretKey para firmar/validar tokens
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Retorna el tiempo de expiración configurado
     *
     * @return Tiempo de expiración en segundos
     */
    public Long getExpirationTime() {
        return jwtExpiration;
    }
}
