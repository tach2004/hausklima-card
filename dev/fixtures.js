/**
 * DEMO-WERTE: synthetic Home Assistant fixtures for development and browser tests.
 * This file is never imported by src/ or bundled into the installed card.
 */
const temperature = (id, name) => ({
  sensors: [{ entity: `sensor.demo_${id}_temperature`, name: name ?? 'Temperatur' }],
});
const humidity = (id) => ({ sensors: [{ entity: `sensor.demo_${id}_humidity`, name: 'Relative Feuchte' }] });
const room = (id, name, level_id, width_m) => ({
  id, name, level_id, layer_id: 'main', visible: true, width_m,
  measurements: { temperature: temperature(id), relative_humidity: humidity(id) },
});

export const demoConfig = {
  type: 'custom:hausklima-card', title: 'HausKlima', show_dimensions: false, show_room_names: true,
  grid_options: { columns: 'full', rows: 'auto' },
  test_extension: { preserved: true },
  building: {
    house: { width_m: 12, depth_m: 10 },
    garage: { width_m: 6, depth_m: 6, height_m: 3, gap_m: 5, gap_is_approximate: true },
    walls: { stated_thickness_m: 0.24, exterior_thickness_m: null, interior_thickness_m: null },
    roof: { knee_wall_height_m: 1, interior_ridge_height_m: 4, pitch_degrees: null },
    levels: [
      { id: 'basement', name: 'Keller', building_id: 'house', clear_height_m: 2.5 },
      { id: 'ground_floor', name: 'Erdgeschoss', building_id: 'house', clear_height_m: 2.64 },
      { id: 'attic', name: 'Dachgeschoss', building_id: 'house', clear_height_m: null },
      { id: 'garage', name: 'Garage', building_id: 'garage', clear_height_m: null },
    ],
    layers: [{ id: 'main', name: 'Sichtbare Raumebene' }],
    rooms: [
      room('workshop', 'Werkstatt', 'basement', 4),
      room('basement_hall', 'Flur', 'basement', 3.4),
      room('laundry', 'Waschküche', 'basement', 3.5),
      room('living_room', 'Wohnzimmer', 'ground_floor', 6.5),
      room('ground_hall', 'Flur', 'ground_floor', 0.9),
      room('kitchen', 'Küche', 'ground_floor', 3.51),
      room('bedroom', 'Schlafzimmer', 'attic', 7.6),
      room('storage', 'Abstellraum', 'attic', 3.6),
      room('garage', 'Garage', 'garage', 6),
      { id: 'demo_outdoor', name: 'Außen', location: 'outdoor', level_id: 'ground_floor', visible: false, width_m: null,
        measurements: {
          temperature: { sensors: [{ entity: 'sensor.demo_outdoor_homematic_temperature', name: 'Homematic' }, { entity: 'sensor.demo_outdoor_ecowitt_temperature', name: 'Ecowitt' }], primary: 'sensor.demo_outdoor_ecowitt_temperature' },
          relative_humidity: { sensors: [{ entity: 'sensor.demo_outdoor_homematic_humidity', name: 'Homematic' }, { entity: 'sensor.demo_outdoor_ecowitt_humidity', name: 'Ecowitt' }], primary: 'sensor.demo_outdoor_ecowitt_humidity' },
        },
      },
      { id: 'demo_study', name: 'Arbeitszimmer', location: 'indoor', level_id: 'ground_floor', visible: false, width_m: null,
        measurements: { temperature: temperature('study'), relative_humidity: humidity('study') },
      },
    ],
    notes: ['DEMO-WERTE: ausschließlich synthetische Zustände für Entwicklung und Tests.'],
  },
};
const bedroom = demoConfig.building.rooms.find((entry) => entry.id === 'bedroom');
bedroom.measurements.co2 = { sensors: [{ entity: 'sensor.demo_bedroom_co2', name: 'CO₂' }], show_in_overview: true };
bedroom.measurements.voc = { sensors: [{ entity: 'sensor.demo_bedroom_voc', name: 'VOC-Index' }], show_in_overview: false };
bedroom.measurements.absolute_humidity = { sensors: [{ entity: 'sensor.demo_bedroom_absolute_humidity', name: 'Absolute Feuchte' }], show_in_overview: false };

const values = {
  workshop: [19.8, 50], basement_hall: [20.9, 51], laundry: [21.1, 52], living_room: [21.8, 47],
  ground_hall: [21.4, 49], kitchen: [21.2, 48], bedroom: [21.3, 48], storage: [20.8, 49], garage: [18.9, 55], study: [22.1, 46],
};
export const demoStates = {};
for (const [id, [temp, rh]] of Object.entries(values)) {
  demoStates[`sensor.demo_${id}_temperature`] = { state: String(temp), attributes: { friendly_name: `${id} Temperatur`, unit_of_measurement: '°C', device_class: 'temperature' } };
  demoStates[`sensor.demo_${id}_humidity`] = { state: String(rh), attributes: { friendly_name: `${id} Feuchte`, unit_of_measurement: '%', device_class: 'humidity' } };
}
for (const [id, value, unit] of [
  ['outdoor_homematic_temperature', '3.4', '°C'], ['outdoor_ecowitt_temperature', '3.6', '°C'],
  ['outdoor_homematic_humidity', '86', '%'], ['outdoor_ecowitt_humidity', '85', '%'],
  ['bedroom_co2', '745', 'ppm'], ['bedroom_voc', '218', 'VOC-Index'], ['bedroom_absolute_humidity', '8.9', 'g/m³'],
  ['additional_temperature', '20.7', '°C'],
]) demoStates[`sensor.demo_${id}`] = { state: value, attributes: { friendly_name: id.replaceAll('_', ' '), unit_of_measurement: unit } };
