<template>
  <div class="content">
    <!-- One shared header/scroll for every data product; each product starts
         with a row naming it and linking to its source -->
    <DTLayout :groups="groups" :start-date="$gui.timelineStartDate" :end-date="$gui.timelineEndDate">
      <template #grid="{ cells }">
        <DTTimelineGrid :cells="cells">
          <template v-for="group in groups" :key="group.name">
            <tr class="group-row">
              <td :colspan="cells.length" class="group-cell">
                <div class="group-cell-label">
                  <span>{{ $t(group.name) }} — {{ $t('Data from') }} </span>
                  <a :href="group.product.link" target="_blank" rel="noreferrer noopener">{{ group.product.sources[0].institution }}</a>
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

export default {
  name: "ForecastSection",
  computed: {
    // Products with their rows filtered for the current panel state
    groups() {
      return this.$dataService.forecastProducts.map(dp => ({
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
