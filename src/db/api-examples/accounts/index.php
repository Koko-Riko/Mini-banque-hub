
<?php
/**
 * API pour gérer les comptes bancaires
 * Point d'entrée pour les opérations CRUD sur les comptes
 */

// Inclure le fichier de connexion à la base de données
require_once '../db-connect.php';

// Vérifier l'authentification (à implémenter)
// require_once '../auth/check-auth.php';

// Définir le type de contenu
header('Content-Type: application/json');

// Gérer les différentes méthodes HTTP
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Récupérer les comptes
        get_accounts();
        break;
        
    case 'POST':
        // Créer un nouveau compte
        create_account();
        break;
        
    default:
        // Méthode non prise en charge
        json_response(null, false, 'Méthode non prise en charge', 405);
        break;
}

/**
 * Récupérer tous les comptes ou filtrer par paramètres
 */
function get_accounts() {
    // Vérifier s'il y a des filtres
    $query = "SELECT * FROM accounts";
    $types = '';
    $params = [];
    
    // Exemple de filtre par client_name
    if (isset($_GET['client_name'])) {
        $query .= " WHERE client_name LIKE ?";
        $types .= 's';
        $params[] = '%' . $_GET['client_name'] . '%';
    }
    
    $result = execute_query($query, $types, $params);
    
    if ($result['success']) {
        // Transformer les données pour correspondre au format attendu par le frontend
        $accounts = array_map(function($row) {
            return [
                'id' => (string)$row['id'],
                'clientName' => $row['client_name'],
                'accountNumber' => $row['account_number'],
                'balance' => (float)$row['balance'],
                'creationDate' => $row['creation_date'],
                'lastActivity' => $row['last_activity'],
            ];
        }, $result['data']);
        
        json_response($accounts);
    } else {
        json_response(null, false, 'Erreur lors de la récupération des comptes', 500);
    }
}

/**
 * Créer un nouveau compte
 */
function create_account() {
    // Récupérer et valider les données
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data || !isset($data['clientName']) || !isset($data['accountNumber'])) {
        json_response(null, false, 'Données invalides', 400);
        return;
    }
    
    $created_by = 1; // À remplacer par l'ID de l'utilisateur connecté
    
    // Préparer l'insertion
    $query = "INSERT INTO accounts (client_name, account_number, balance, creation_date, last_activity, created_by) 
              VALUES (?, ?, ?, CURRENT_DATE, CURRENT_DATE, ?)";
    
    $types = 'ssdi';
    $params = [
        $data['clientName'],
        $data['accountNumber'],
        $data['balance'] ?? 0,
        $created_by
    ];
    
    $result = execute_query($query, $types, $params);
    
    if ($result['success']) {
        // Récupérer le compte nouvellement créé
        $new_id = mysqli_insert_id(connect_db());
        $new_account_result = execute_query("SELECT * FROM accounts WHERE id = ?", 'i', [$new_id]);
        
        if ($new_account_result['success'] && !empty($new_account_result['data'])) {
            $new_account = $new_account_result['data'][0];
            
            $account = [
                'id' => (string)$new_account['id'],
                'clientName' => $new_account['client_name'],
                'accountNumber' => $new_account['account_number'],
                'balance' => (float)$new_account['balance'],
                'creationDate' => $new_account['creation_date'],
                'lastActivity' => $new_account['last_activity'],
            ];
            
            json_response($account, true, 'Compte créé avec succès', 201);
        } else {
            json_response(null, false, 'Compte créé mais impossible de récupérer les détails', 500);
        }
    } else {
        json_response(null, false, 'Erreur lors de la création du compte', 500);
    }
}
?>
