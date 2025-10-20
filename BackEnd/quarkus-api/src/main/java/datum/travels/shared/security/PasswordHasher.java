package datum.travels.shared.security;

import jakarta.enterprise.context.ApplicationScoped;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

/**
 * Utilidad para hashear y verificar contraseñas
 * Usa SHA-256 para compatibilidad simple
 * 
 * NOTA: En producción, considerar usar BCrypt con Quarkus Elytron
 */
@ApplicationScoped
public class PasswordHasher {

    private static final String ALGORITHM = "SHA-256";

    /**
     * Hashea una contraseña usando SHA-256
     *
     * @param plainPassword Contraseña en texto plano
     * @return Contraseña hasheada en Base64
     */
    public String hash(String plainPassword) {
        try {
            MessageDigest digest = MessageDigest.getInstance(ALGORITHM);
            byte[] hashBytes = digest.digest(plainPassword.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error al hashear contraseña", e);
        }
    }

    /**
     * Verifica si una contraseña coincide con un hash
     *
     * @param plainPassword Contraseña en texto plano
     * @param hashedPassword Contraseña hasheada
     * @return true si coinciden, false si no
     */
    public boolean verify(String plainPassword, String hashedPassword) {
        String computedHash = hash(plainPassword);
        return computedHash.equals(hashedPassword);
    }
}
