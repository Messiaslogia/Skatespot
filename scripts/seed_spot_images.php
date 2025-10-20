<?php

require __DIR__ . '/../config/db.php';
$pdo = $GLOBALS['pdo'];

$imgs = [
    // spot_id, url, sort_order
    [1, 'assets/spot-image/roosevelt-1.jpg', 0],
    [2, 'assets/spot-image/independencia-1.jpg', 0],
    [3, 'assets/spot-image/ibirapuera-1.jpg', 0],
];

$stmt = $pdo->prepare("INSERT INTO spot_images (spot_id, url, sort_order) VALUES (:sid, :u, :o)");
foreach ($imgs as [$sid, $u, $o]) {
    $stmt->execute([':sid' => $sid, ':u' => $u, ':o' => $o]);
}
echo "OK imagens\n";

?>