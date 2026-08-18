<template>
  <div class="content">

    <p>⚠️ {{ $t('dataPanel.dataBuoyNotAvailable') }}</p>

    <!-- One timeline per data product -->
    <div class="content-section" v-for="dp in $dataService.dataProducts" :key="dp.name">
      <h5>{{ $t(dp.name) }}</h5>
      <!-- Content -->
      <DataTimeline :product="dp.product"></DataTimeline>
      <!-- Attribution -->
      <div class="attribution">
        <i>{{ $t('Data from') }} {{ dp.product.sources[0].institution }}: </i>
        <i><a :href="dp.product.link" target="_blank" rel="noreferrer noopener">{{ dp.product.link }}</a></i>
      </div>
    </div>

  </div>
</template>


<script>
import DataTimeline from "./DataTimeline/DataTimeline.vue";

export default {
  name: "DataSection",
  components: {
    DataTimeline
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

.content-section {
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 0 4px black;
  margin: 10px 10px 20px 10px;
}

.attribution {
  padding-top: 5px;
  font-size: 0.7rem;
}
</style>
