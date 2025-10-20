<?php

header('Content-Type: application/json');
require __DIR__ . '/../config/db.php';

$lat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
$lng = isset($_GET['lng']) ? floatval($_GET['lng']) : null;


$radiusKm = isset($_GET['radius_km']) ? floatval($_GET['radius_km']) : 10.0;
$radiusKm = max(0.1, min($radiusKm, 20.0));

if ($lat === null || $lng === null) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Parâmetros obrigatórios> lat e lng']);
  exit;
}

/*
  Haversine em SQL (retorna distância em km)
  6371 = raio médio da Terra em km
*/
$sql = "
  SELECT
    s.id, s.name, s.description, s.category, s.lat, s.lng,
    (6371 * ACOS(
      COS(RADIANS(:lat)) * COS(RADIANS(s.lat)) * COS(RADIANS(s.lng) - RADIANS(:lng))
      + SIN(RADIANS(:lat)) * SIN(RADIANS(s.lat))
    )) AS distance_km,
    GROUP_CONCAT(si.url ORDER BY si.sort_order SEPARATOR '||') AS images_csv
  FROM spots s
  LEFT JOIN spot_images si ON si.spot_id = s.id
  GROUP BY s.id, s.name, s.description, s.category, s.lat, s.lng
  HAVING distance_km <= :radius
  ORDER BY distance_km ASC
  LIMIT 300
";
$stmt = $pdo->prepare($sql);
$stmt->execute([':lat' => $lat, ':lng' => $lng, ':radius' => $radiusKm]);

$rows = $stmt->fetchAll();
$spots = array_map(function ($r) {
  $r['images'] = empty($r['images_csv']) ? [] : explode('||', $r['images_csv']);
  unset($r['images_csv']);
  return $r;
}, $rows);

echo json_encode(
  ['ok' => true, 'count' => count($spots), 'spots' => $spots],
  JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);
?>