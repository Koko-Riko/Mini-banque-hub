
-- Script d'initialisation de la base de données MySQL pour Mini Banque Hub

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS mini_banque;
USE mini_banque;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'cashier') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des comptes
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL UNIQUE,
    balance DECIMAL(15, 2) DEFAULT 0,
    creation_date DATE NOT NULL,
    last_activity DATE NOT NULL,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('deposit', 'withdrawal', 'transfer') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    date DATETIME NOT NULL,
    account_id INT NOT NULL,
    description TEXT,
    performed_by INT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Table des prêts
CREATE TABLE IF NOT EXISTS loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('active', 'paid', 'overdue') DEFAULT 'active',
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Table des paiements de prêts
CREATE TABLE IF NOT EXISTS loan_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    date DATE NOT NULL,
    status ENUM('paid', 'pending') DEFAULT 'pending',
    FOREIGN KEY (loan_id) REFERENCES loans(id)
);

-- Table des rapports journaliers
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_transactions INT DEFAULT 0,
    total_deposits DECIMAL(15, 2) DEFAULT 0,
    total_withdrawals DECIMAL(15, 2) DEFAULT 0,
    total_transfers DECIMAL(15, 2) DEFAULT 0,
    new_accounts INT DEFAULT 0,
    new_loans INT DEFAULT 0
);

-- Insertion de données par défaut
-- Utilisateurs par défaut
INSERT INTO users (name, username, password, role) VALUES
('Admin User', 'admin', '$2y$10$YourHashedPasswordHere', 'admin'),
('Caissier Example', 'caissier', '$2y$10$YourHashedPasswordHere', 'cashier');

-- NOTE: Dans une application réelle, vous utiliseriez des hachages de mot de passe sécurisés
-- et un script d'initialisation séparé pour les mots de passe
