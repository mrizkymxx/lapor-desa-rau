// Titik Koordinat Presisi Balai Desa Rau, Kec. Kedung, Kab. Jepara
// Google Maps: https://maps.app.goo.gl/PwiQ1iE1RmLka1gD6
export const DESA_RAU = {
  lat: -6.646463,
  lng: 110.667857,
  nama: "Balai Desa Rau, Kec. Kedung, Jepara",
  maxRadiusMeter: 2000, // 2 KM batas keliling desa
};

/**
 * Hitung jarak presisi formula Haversine (Native JS, 0 Dependency)
 * @returns jarak dalam satuan Meter
 */
export function getDistanceToRau(lat: number, lng: number): number {
  const R = 6371e3; // Radius bumi dalam meter
  const phi1 = (lat * Math.PI) / 180;
  const phi2 = (DESA_RAU.lat * Math.PI) / 180;
  const deltaPhi = ((DESA_RAU.lat - lat) * Math.PI) / 180;
  const deltaLambda = ((DESA_RAU.lng - lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export interface GeoLocationResult {
  lat: number;
  lng: number;
  isInside: boolean;
  distanceMeter: number;
  accuracy: number;
}

/**
 * Minta koordinat GPS perangkat langsung dari browser HP
 */
export function requestWargaLocation(): Promise<GeoLocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Perangkat tidak mendukung sensor lokasi GPS."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 0);
        const distanceMeter = getDistanceToRau(lat, lng);
        const isInside = distanceMeter <= DESA_RAU.maxRadiusMeter;

        resolve({
          lat,
          lng,
          isInside,
          distanceMeter,
          accuracy,
        });
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            reject(new Error("Izin lokasi ditolak. Aktifkan GPS dan izinkan browser untuk membuktikan posisi Anda di Desa Rau."));
            break;
          case err.POSITION_UNAVAILABLE:
            reject(new Error("Sinyal GPS tidak terdeteksi. Pastikan GPS HP Anda aktif."));
            break;
          case err.TIMEOUT:
            reject(new Error("Waktu pencarian GPS habis. Silakan coba kembali."));
            break;
          default:
            reject(new Error("Gagal mengambil titik koordinat GPS."));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  });
}
