package datum.travels.shared.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

/**
 * Utilidades para manejo de contraseñas.
 */
public final class PasswordHashUtil {

    private static final String HASH_ALGORITHM = "SHA-256";

    private PasswordHashUtil() {
        // Utility class
    }

    /**
     * Genera un hash SHA-256 en Base64 para la contraseña indicada.
     *
     * @param rawPassword contraseña en texto plano
     * @return hash en Base64
     */
    public static String hashToBase64(String rawPassword) {
        if (rawPassword == null) {
            throw new IllegalArgumentException("La contraseña no puede ser nula");
        }
        try {
            MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
            byte[] hashBytes = digest.digest(rawPassword.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("No se pudo inicializar el algoritmo de hash", e);
        }
    }
}
