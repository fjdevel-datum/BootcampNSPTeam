import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * Utilidad para generar hashes SHA-256 de contraseñas
 * Ejecutar: java GeneratePasswordHash.java
 */
public class GeneratePasswordHash {
    public static void main(String[] args) {
        String password = "admin123";  // Cambiar por la contraseña deseada
        
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            String hash = Base64.getEncoder().encodeToString(hashBytes);
            
            System.out.println("Password: " + password);
            System.out.println("Hash SHA-256: " + hash);
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
