<?php
require __DIR__ . '/../config/db.php';

$spots = [
    ['Praça Roosevelt', 'Street com ledges e gaps. Movimento à noite.', -23.545100, -46.644600],
    ['Parque da Independência', 'Chão liso, boas linhas e corrimões baixos.', -23.586000, -46.609000],
    ['Ibirapuera – Marquise', 'Flat infinito, clássico de SP. Cuidado com horários.', -23.587000, -46.657000],
    ['Pista Diadema', 'Bowl médio e banks, iluminação OK.', -23.691900, -46.620700],
    ['Pista São Bernardo', 'Street + bowl grande, variedade de obstáculos.', -23.701500, -46.550200]
];

$sql = "INSERT INTO spots (name, description, lat, lng) VALUES (:name, :description, :lat, :lng)";
$stmt = $pdo->prepare($sql);

$inserted = 0;
foreach ($spots as $s) {
    $stmt->execute([
        ':name' => $s[0],
        ':description' => $s[1],
        ':lat' => $s[2],
        ':lng' => $s[3],
    ]);
    $inserted++;
}

echo "Inseridos {$inserted} spots.\n";
