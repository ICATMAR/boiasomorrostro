<template>
  <div class="content">
    <!-- One shared header/scroll for every data product; each product starts
         with a row naming it and linking to its source -->
    <DTLayout :groups="$dataService.dataProducts">
      <template #grid>
        <DTTimelineGrid v-slot="{ cells }">
          <template v-for="dp in $dataService.dataProducts" :key="dp.name">
            <tr class="group-row">
              <td :colspan="cells.length" class="group-cell">
                <span>{{ $t(dp.name) }} — {{ $t('Data from') }} </span>
                <a :href="dp.product.link" target="_blank" rel="noreferrer noopener">{{ dp.product.sources[0].institution }}</a>
              </td>
            </tr>
            <DataTimeline :product="dp.product" :cells="cells"></DataTimeline>
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
  name: "DataSection",
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


<!-- Non-scoped: the group row is slotted into DTTimelineGrid's table, rendered outside
     this component. Selectors are prefixed with td.group-cell to outweigh DTTimelineGrid's
     ".dt-table td > *" reset (same specificity would otherwise depend on style load order). -->
<style>
td.group-cell {
  text-align: left;
  padding-left: 10px;
  background: var(--darkBlue);
}
td.group-cell > span,
td.group-cell > a {
  font-size: 0.65rem;
  color: white;
}
td.group-cell > a {
  text-decoration: underline;
}
</style>
