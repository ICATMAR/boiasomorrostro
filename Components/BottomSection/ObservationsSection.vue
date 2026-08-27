<template>
  <div class="content">
    <BuoyStatusMessage v-if="loaded && $dataService.buoy.status !== 'ok'" :product="$dataService.buoy"></BuoyStatusMessage>

    <!-- Same timeline as the forecast, but spanning the days actually measured
         by the buoy and scrolled to the newest data -->
    <DTLayout v-else :groups="groups" :start-date="range.start" :end-date="range.end" scroll-to="end">
      <template #grid="{ cells }">
        <DTTimelineGrid :cells="cells">
          <template v-for="group in groups" :key="group.key">
            <!-- Product row (also the only header in the compact view, which
                 bundles its rows into this same group - see `groups` below) -->
            <tr v-if="group.link" class="group-row">
              <td :colspan="cells.length" class="group-cell">
                <div class="group-cell-label">
                  <span>{{ $t(group.name) }} — {{ $t('Data from') }} </span>
                  <a :href="group.link" target="_blank" rel="noreferrer noopener">{{ institutions(group.product) }}</a>
                </div>
              </td>
            </tr>
            <!-- Sensor row: extended view only, one per sensor group -->
            <tr v-else class="sensor-row">
              <td :colspan="cells.length" class="sensor-cell">
                <div class="sensor-cell-label">{{ group.label }}</div>
              </td>
            </tr>
            <DataTimeline :product="group.product" :variables="group.variables" :cells="cells"></DataTimeline>
          </template>
        </DTTimelineGrid>
      </template>
    </DTLayout>
  </div>
</template>


<script>
import DTLayout from "./DataTimeline/DTLayout.vue";
import DTTimelineGrid from "./DataTimeline/DTTimelineGrid.vue";
import DataTimeline from "./DataTimeline/DataTimeline.vue";
import BuoyStatusMessage from "./BuoyStatusMessage.vue";

// Compact view: a hand-picked, fixed row order, independent of which sensor a
// row comes from or its position in the catalogue (see Catalogue.js's
// `variables`) - a view-layer decision, not something the data product
// should encode.
const COMPACT_CODES = {
  'Somorrostro buoy': ['WSPD', 'DRYT', 'TEMP', 'HCSP', 'RELH'],
};

export default {
  name: "ObservationsSection",
  async mounted() {
    // The range depends on the newest measurement, which is only known once the
    // ERDDAPs answer - until then the timeline shows the last three days up to now.
    await this.$dataService.buoy.ready();
    this.latestDate = this.$dataService.buoy.latestDate;
    this.loaded = true;
  },
  data() {
    return {
      latestDate: undefined,
      loaded: false, // product.status isn't meaningful until ready() resolves
    }
  },
  methods: {
    // Both ERDDAPs publish the same sensor, so both are credited
    institutions(product) {
      return [...new Set(product.sources.map(s => s.institution))].join(', ');
    },
    // The compact view's fixed row list, if this product has one - falls back
    // to every row, same as a product with nothing curated.
    compactVariables(product) {
      const codes = COMPACT_CODES[product.name];
      if (!codes) return product.variables;
      return codes.map(code => product.variables.find(v => v.code === code)).filter(Boolean);
    },
    // Contiguous runs of variables sharing the same `sensor` (see Catalogue.js),
    // each labelled with that sensor's instrument and depth/height - the
    // extended view's per-sensor breakdown.
    sensorGroups(product) {
      const runs = [];
      product.variables.forEach(v => {
        const last = runs[runs.length - 1];
        if (last && last.sensor === v.sensor) last.variables.push(v);
        else runs.push({ sensor: v.sensor, variables: [v] });
      });
      return runs.map(run => ({
        sensor: run.sensor,
        label: this.sensorLabel(product, run.sensor),
        variables: run.variables,
      }));
    },
    // "<sensorId> <instrument> (<depth>m below water)" - METEO's height above
    // water is stored as a negative sensor_height, everything else's depth
    // below water as a positive sensor_depth (see the ERDDAP metadata).
    sensorLabel(product, sensorId) {
      const meta = product.sensorMetadata && product.sensorMetadata(sensorId);
      if (!meta) return sensorId;
      if (meta.sensor_height != undefined)
        return `${sensorId} ${meta.instrument} - ${Math.abs(Number(meta.sensor_height))}m ${this.$t('above water')}`;
      if (meta.sensor_depth != undefined)
        return `${sensorId} ${meta.instrument} - ${Number(meta.sensor_depth)}m ${this.$t('below water')}`;
      return `${sensorId} ${meta.instrument}`;
    },
  },
  computed: {
    range() {
      return this.$gui.observationsRange(this.latestDate);
    },
    // Compact: one row per product, bundling its (curated) rows under its own
    // header. Extended: a header-only row naming the product/source, then one
    // row per sensor group, each with its own header (see DTLayout.vue - every
    // group here renders exactly one header, so its left-column spacer lines
    // up with the header row on the right).
    groups() {
      return this.$dataService.observationProducts.flatMap(dp => {
        const product = dp.product;
        if (this.$gui.isCompact) {
          return [{ key: dp.name, name: dp.name, product, link: product.link, variables: this.compactVariables(product) }];
        }
        return [
          { key: dp.name, name: dp.name, product, link: product.link, variables: [] },
          ...this.sensorGroups(product).map(g => ({ key: `${dp.name}:${g.sensor}`, product, label: g.label, variables: g.variables })),
        ];
      });
    },
  },
  components: {
    DTLayout,
    DTTimelineGrid,
    DataTimeline,
    BuoyStatusMessage,
  },
}
</script>


<style scoped>
.content {
  overflow: auto;
  font-size: small;
  max-height: 100%;
  width: 100%;
}
</style>
