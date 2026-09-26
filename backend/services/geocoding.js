/**
 * Geocoding Service for JanSeva
 * Reverse geocodes latitude & longitude into Village, Mandal, District, and formatted address
 */

async function reverseGeocode(latitude, longitude) {
  try {
    const userAgent = process.env.NOMINATIM_USER_AGENT || 'JanSevaSmartCitizenPortal/1.0';
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim geocoding failed with status: ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};

    const village = addr.village || addr.suburb || addr.neighbourhood || addr.residential || addr.town || addr.city || 'Locality';
    const mandal = addr.county || addr.subdistrict || addr.municipality || addr.taluk || 'Mandal';
    const district = addr.state_district || addr.district || addr.state || 'District';
    const exactAddress = data.display_name || `${village}, ${mandal}, ${district}`;

    return {
      village,
      mandal,
      district,
      exactAddress
    };
  } catch (err) {
    console.warn(`[Geocoding] Reverse geocoding fallback used (${err.message})`);
    return {
      village: 'Ward / Village',
      mandal: 'Zone / Mandal',
      district: 'Urban District',
      exactAddress: `Coordinates: Lat ${latitude.toFixed(5)}, Long ${longitude.toFixed(5)}`
    };
  }
}

module.exports = { reverseGeocode };
