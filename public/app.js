const DEFAULT_ZOOM = 17;
let map, userMarker, radiusCircle, spotsLayer;

const categoryIcons = (() => {
    const base = 'assets/icons/'; // relativo a public/index.html
    return {
        park: L.icon({ iconUrl: base + 'icons8-ramp-48.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -28] }),
        street: L.icon({ iconUrl: base + 'corrimao.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -28] }),
        bowl: L.icon({ iconUrl: base + 'bowl.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -28] }),
        plaza: L.icon({ iconUrl: base + 'plaza.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -28] }),
        diy: L.icon({ iconUrl: base + 'diy.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -28] }),
        default: L.icon({ iconUrl: base + 'spot-default.png', iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -24] }),
    };
})();

function renderGallery(images = []) {
    if (!images || images.length === 0) return '';
    const imgs = images.map(url =>
        `<img src="${escapeAttr(url)}" alt="spot image" loading="lazy"/>`
    ).join('');
    return `<div class="popup-gallery">${imgs}</div>`;
}

function escapeAttr(str) {
    return (str ?? '').toString().replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function iconForCategory(category) {
    const key = normalizeCategory(category);
    console.log(categoryIcons[key])
    return categoryIcons[key] || categoryIcons.default;
}

function normalizeCategory(cat) {
    const c = (cat ?? '').toString().trim().toLowerCase();
    if (['park', 'parque', 'pista', 'ramp', 'rampa'].includes(c)) return 'park';
    if (['street', 'rua', 'corrimao', 'handrail', 'ledge', 'gap', 'stair', 'escada'].includes(c)) return 'street';
    if (['bowl', 'pool'].includes(c)) return 'bowl';
    if (['plaza', 'praca', 'praça'].includes(c)) return 'plaza';
    if (['diy', 'caseiro'].includes(c)) return 'diy';
    return 'default';
}

function initMap() {
    map = L.map('map', { zoomControl: true }).setView([-23.55, -46.63], DEFAULT_ZOOM); // SP como fallback

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        {
            subdomains: 'abcd', maxZoom: 20,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }
    ).addTo(map);

    spotsLayer = L.layerGroup().addTo(map);

    // Clique no mapa para escolher localização manual se geolocation for negada
    map.on('click', (e) => {
        setUserLocation(e.latlng.lat, e.latlng.lng, true);
    });

    document.getElementById('useLocationBtn').addEventListener('click', useMyLocation);
    document.getElementById('reloadBtn').addEventListener('click', () => {
        if (!userMarker) return;
        const { lat, lng } = userMarker.getLatLng();
        loadSpots(lat, lng);
    });

    // tenta automaticamente pegar a localização
    useMyLocation();
}

function useMyLocation() {
    if (!('geolocation' in navigator)) {
        alert('Geolocalização não suportada. Clique no mapa para escolher um ponto.');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            setUserLocation(latitude, longitude, true);
        },
        (err) => {
            console.warn('Geolocation negada/erro:', err.message);
            alert('Não deu pra pegar sua localização. Clique no mapa para escolher um ponto.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

function setUserLocation(lat, lng, fetch = false) {
    if (!userMarker) {
        const userIcon = L.icon({
            className: 'user-dot',
            iconUrl: 'assets/icons/icons8-skateboard-64.png', // relativo ao index.html
            iconSize: [40, 40],      // ajuste pro seu PNG
            iconAnchor: [20, 36],    // “ponto” do marcador (base central)
            popupAnchor: [0, -36]    // onde abre o popup
        });

        userMarker = L.marker([lat, lng], { icon: userIcon }, { title: 'Você está aqui' })
            .addTo(map)
            .bindPopup('📍 Sua posição (ajustável)');
    } else {
        userMarker.setLatLng([lat, lng]);
    }

    // // círculo de 10km (ou o valor digitado)
    // const radiusKm = getRadiusKm();
    // const radiusMeters = radiusKm * 1000;

    // if (!radiusCircle) {
    //     radiusCircle = L.circle([lat, lng], { radius: radiusMeters });
    //     radiusCircle.addTo(map);
    // } else {
    //     radiusCircle.setLatLng([lat, lng]);
    //     radiusCircle.setRadius(radiusMeters);
    // }

    map.setView([lat, lng], DEFAULT_ZOOM);

    if (fetch) loadSpots(lat, lng);
}

function getRadiusKm() {
    const input = document.getElementById('radiusKm');
    let val = parseFloat(input.value);
    if (isNaN(val) || val <= 0) val = 3;
    return Math.min(Math.max(val, 0.5), 20); // 0.5–20km
}

async function loadSpots(lat, lng) {
    const radiusKm = getRadiusKm();
    try {
        const res = await fetch(`api/spots.php?lat=${lat}&lng=${lng}&radius_km=${radiusKm}`, {
            headers: { 'Accept': 'application/json' }
        });

        const data = await res.json();

        if (!data.ok) throw new Error(data.error || 'Erro ao carregar spots');

        // limpa camadas antigas
        spotsLayer.clearLayers();

        data.spots.forEach(s => {
            const m = L.marker([+s.lat, +s.lng], {
                icon: iconForCategory(s.category),
                title: s.name
            }).bindPopup(`
                ${renderGallery(s.images)}
                <strong>${escapeHtml(s.name)}</strong><br/>
                <strong>Descrição:</strong> ${escapeHtml(s.description || 'Sem descrição')}<br/>
                <strong>Categoria:</strong> ${escapeHtml(s.category || '—')}<br/>
                <small>🛣️ ~${Number(s.distance_km).toFixed(2)} km</small><br/>
                <a target="_blank" rel="noopener"
                href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}">
                Ver rotas
                </a>
            `);
            spotsLayer.addLayer(m);
        });
    } catch (e) {
        console.error(e);
        alert('Falha ao buscar spots.');
    }
}

function escapeHtml(str) {
    return (str ?? '').toString()
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
}

document.addEventListener('DOMContentLoaded', initMap);
