<template>
  <div class="content">
    <BuoyStatusMessage v-if="loaded && $dataService.buoy.status !== 'ok'" :product="$dataService.buoy"></BuoyStatusMessage>

    <!-- Same timeline as the forecast, but spanning the days actually measured
         by the buoy and scrolled to the newest data -->
    <DTLayout v-else :groups="groups" :start-date="range.start" :end-date="range.end" scroll-to="end">
      <template #grid="{ cells }">
        <DTTimelineGrid :cells="cells">
          <template v-for="group in groups" :key="group.name">
            <tr class="group-row">
              <td :colspan="cells.length" class="group-cell">
                <div class="group-cell-label">
                  <span>{{ $t(group.name) }} — {{ $t('Data from') }} </span>
                  <a :href="group.product.link" target="_blank" rel="noreferrer noopener">{{ institutions(group.product) }}</a>
                </div>
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
  },
  computed: {
    range() {
      return this.$gui.observationsRange(this.latestDate);
    },
    // Products with their rows filtered for the current panel state
    groups() {
      return this.$dataService.observationProducts.map(dp => ({
        name: dp.name,
        product: dp.product,
        variables: dp.product.visibleVariables(this.$gui.isCompact),
      }));
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
