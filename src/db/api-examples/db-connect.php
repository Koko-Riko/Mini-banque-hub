
<?php
/**
 * Exemple de connexion à la base de données MySQL pour le backend PHP
 * Dans un environnement de production, ce fichier serait dans un dossier sécurisé du serveur
 */

// Récupérer les variables d'environnement depuis le fichier .env
// Vous aurez besoin d'une bibliothèque PHP comme vlucas/phpdotenv dans un projet réel
$dotenv = dirname(__DIR__) . '/.env';
if (file_exists($dotenv)) {
    $lines = file($dotenv, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Configuration de la base de données
$db_config = [
    'host' => $_ENV['VITE_DB_HOST'] ?? 'localhost',
    'user' => $_ENV['VITE_DB_USER'] ?? 'root',
    'password' => $_ENV['VITE_DB_PASSWORD'] ?? '',
    'database' => $_ENV['VITE_DB_NAME'] ?? 'mini_banque',
    'port' => $_ENV['VITE_DB_PORT'] ?? 3306,
];

/**
 * Fonction pour se connecter à la base de données
 */
function connect_db() {
    global $db_config;
    
    try {
        $mysqli = new mysqli(
            $db_config['host'],
            $db_config['user'],
            $db_config['password'],
            $db_config['database'],
            $db_config['port']
        );
        
        if ($mysqli->connect_error) {
            throw new Exception("Échec de connexion à la base de données: " . $mysqli->connect_error);
        }
        
        // Définir l'encodage des caractères
        $mysqli->set_charset("utf8mb4");
        
        return $mysqli;
    } catch (Exception $e) {
        // En production, vous ne voudriez pas exposer les détails de l'erreur
        error_log($e->getMessage());
        return false;
    }
}

/**
 * Fonction pour exécuter une requête préparée en toute sécurité
 */
function execute_query($query, $types = '', $params = []) {
    $mysqli = connect_db();
    
    if (!$mysqli) {
        return ['success' => false, 'error' => 'Erreur de connexion à la base de données'];
    }
    
    try {
        $stmt = $mysqli->prepare($query);
        
        if (!$stmt) {
            throw new Exception("Erreur de préparation de la requête: " . $mysqli->error);
        }
        
        if (!empty($types) && !empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        
        $success = $stmt->execute();
        
        if (!$success) {
            throw new Exception("Erreur d'exécution de la requête: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        $data = [];
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        
        $stmt->close();
        $mysqli->close();
        
        return ['success' => true, 'data' => $data];
    } catch (Exception $e) {
        error_log($e->getMessage());
        
        if ($mysqli) {
            $mysqli->close();
        }
        
        return ['success' => false, 'error' => 'Une erreur est survenue lors de l'exécution de la requête'];
    }
}

/**
 * Fonction pour obtenir une réponse JSON standardisée
 */
function json_response($data = null, $success = true, $message = '', $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json');
    
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message,
    ]);
    
    exit;
}

// Exemple d'utilisation pour déboguer la connexion
if (basename($_SERVER['PHP_SELF']) === basename(__FILE__)) {
    $connection_test = connect_db();
    
    if ($connection_test) {
        echo "Connexion réussie à la base de données MySQL!";
        $connection_test->close();
    } else {
        echo "Échec de la connexion à la base de données.";
    }
}
?>
