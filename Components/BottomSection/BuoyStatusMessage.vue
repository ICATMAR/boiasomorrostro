<template>
  <div class="vertical status-container">
    <p v-if="product.status === 'error'">⚠️ {{ errorMessage }}</p>
    <p v-else>⚠️ {{ $t('buoyStatus.noData') }}</p>
    <!-- Address built from two parts at render time so it never appears as a
         plain string in the source - a basic deterrent against crawlers/bots
         that scan text rather than execute the page. -->
    <p class="contact">{{ $t('buoyStatus.contactPrefix') }} {{ emailUser }}@{{ emailDomain }}</p>
  </div>
</template>


<script>
export default {
  name: "BuoyStatusMessage",
  props: {
    product: Object, // DPBuoy - status/errors only meaningful after product.ready()
  },
  data() {
    return {
      emailUser: 'observacions',
      emailDomain: 'icatmar.cat',
    }
  },
  computed: {
    errorMessage() {
      const errors = this.product.errors;
      if (errors.some(e => e.status === 429)) return this.$t('buoyStatus.tooManyRequests');
      if (errors.some(e => e.status >= 500)) return this.$t('buoyStatus.serverError');
      if (errors.some(e => e.name === 'TimeoutError')) return this.$t('buoyStatus.timeout');
      return this.$t('buoyStatus.genericError');
    },
  },
}
</script>


<style scoped>
.status-container {
  align-items: center;
  padding: 20px;
  text-align: center;
  gap: 4px;
  font-size: 0.9rem;
}
.contact {
  font-size: 0.75rem;
  opacity: 0.8;
}
</style>
