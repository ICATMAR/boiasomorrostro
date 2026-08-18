<template>
  <div class="vertical content" :class="{ 'content-full-screen': $gui.panelState === 'fullscreen' }">
    <BuoyStatusMessage v-if="loaded && $dataService.buoy.status !== 'ok'" :product="$dataService.buoy"></BuoyStatusMessage>

    <template v-else>
      <!-- Compass rose. The arrow sits on the ring at the bearing the wind comes
           from and points inward, the usual way of drawing wind direction. -->
      <div class="rose">
        <div class="rose-ring"></div>

        <!-- Direction labels -->
        <div class="rose-label" v-for="label in labels" :key="label.text"
          :style="{ left: label.x + 'px', top: label.y + 'px' }">{{ label.text }}</div>

        <!-- Wind direction arrow -->
        <div v-if="direction != undefined" class="rose-arrow-anchor" :style="{ transform: `rotate(${direction}deg)` }">
          <i class="fa-solid fa-caret-down rose-arrow"></i>
        </div>

        <!-- Speed at the center -->
        <div class="vertical rose-center">
          <span class="rose-speed">{{ speedText }}</span>
          <span class="rose-direction">{{ directionText }}</span>
          <span class="rose-unit clickable" @click="$gui.cycleUnit('wind')">{{ windUnit.unit }}</span>
        </div>
      </div>

      <!-- How old the measurement is -->
      <div class="vertical rose-time">
        <span>{{ timeAgo }}</span>
        <span class="rose-tmst">{{ timestamp }}</span>
      </div>
    </template>

  </div>
</template>


<script>
import BuoyStatusMessage from "./BuoyStatusMessage.vue";

const RADIUS = 110;       // half of the 220px rose
const LABEL_RADIUS = 90;  // where the direction labels sit

// 16-point rose for English and Spanish (Spanish uses O for Oeste). Catalan
// names the 8 traditional Mediterranean winds instead.
const COMPASS = {
  en: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
  //es: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'],
  es: ['Tramontana', 'Gregal', 'Levante', 'Siroco', 'Ostro', 'Garbino', 'Poniente', 'Mistral'],
  ca: ['Tramuntana', 'Gregal', 'Llevant', 'Xaloc', 'Migjorn', 'Garbí', 'Ponent', 'Mestral'],
};

export default {
  name: "WindSection",
  async mounted() {
    await this.$dataService.buoy.ready();
    this.row = this.$dataService.buoy.latestRow('WSPD');
    this.loaded = true;
    // Refresh how old the measurement reads as time passes
    this.nowTimer = setInterval(() => { this.now = Date.now(); }, 60000);
  },
  beforeUnmount() {
    clearInterval(this.nowTimer);
  },
  data() {
    return {
      row: undefined, // latest buoy row with a wind speed
      now: Date.now(),
      loaded: false, // product.status isn't meaningful until ready() resolves
    }
  },
  methods: {
    // Same steps as VISOC's DTAPBuoysPlatformDetail, translated
    formatTimeAgo(hours) {
      if (hours == null) return '';
      const minutes = Math.floor(hours * 60);
      if (minutes < 1) return this.$t('timeAgo.now');
      if (hours < 1) return this.$t('timeAgo.minutes', { n: minutes });
      if (hours < 2) return this.$t('timeAgo.hour');
      if (hours < 24) return this.$t('timeAgo.hours', { n: Math.floor(hours) });
      const days = Math.floor(hours / 24);
      if (days === 1) return this.$t('timeAgo.day');
      if (days <= 7) return this.$t('timeAgo.days', { n: days });
      return this.$t('timeAgo.moreThanWeek');
    },
  },
  computed: {
    windUnit() {
      return this.$gui.unitOption('wind');
    },
    speedText() {
      const speed = this.row?.values.WSPD;
      if (speed == undefined) return '--';
      return this.windUnit.toDisplay(speed).toFixed(this.windUnit.decimals);
    },
    directionText() {
      const direction = this.direction;
      if (direction == undefined || Number.isNaN(Number(direction))) return '--';
      const names = COMPASS[this.$i18n.locale] || COMPASS.en;
      const step = 360 / names.length;
      // Normalize bearing to [0, 360)
      const bearing = ((Number(direction) % 360) + 360) % 360;
      // Round to the nearest compass point
      const index = Math.floor((bearing + step / 2) / step) % names.length;
      return names[index];
    },
    // Bearing the wind comes from, as measured (WDIR is wind_from_direction)
    direction() {
      return this.row?.values.WDIR;
    },
    labels() {
      const names = COMPASS[this.$i18n.locale] || COMPASS.en;
      const step = 360 / names.length;
      return names.map((text, i) => {
        const rad = (i * step - 90) * Math.PI / 180; // -90: 0º points up
        return {
          text,
          x: RADIUS + LABEL_RADIUS * 1.2 * Math.cos(rad),
          y: RADIUS + LABEL_RADIUS * 1.1 * Math.sin(rad),
        };
      });
    },
    timeAgo() {
      if (!this.row) return this.$t('No data available');
      return this.formatTimeAgo((this.now - this.row.date.getTime()) / 3600000);
    },
    timestamp() {
      return this.row ? this.row.date.toISOString() : '';
    },
  },
  components: {
    BuoyStatusMessage,
  },
}
</script>


<style scoped>
.content {
  align-items: center;
  justify-content: center;
  padding: 10px;
  width: 100%;
  
}

.content-full-screen {
  transform: translateY(50%)
}

.rose {
  position: relative;
  width: 220px;
  height: 220px;
  flex-shrink: 0;
}

.rose-ring {
  position: absolute;
  inset: 20px;
  border: 2px solid var(--darkBlue);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
}

.rose-label {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 0.55rem;
  color: var(--darkBlue);
  white-space: nowrap;
  pointer-events: none;
  background: #ffffff94;
  border-radius: 10px;
  padding-left: 5px;
  padding-right: 5px;
  pointer-events: none;
}

/* Rotates around the rose center; the arrow itself sits on the ring */
.rose-arrow-anchor {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.rose-arrow {
  position: absolute;
  top: 3px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 50px;
  color: var(--red);
}

.rose-center {
  position: absolute;
  inset: 0;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

/* Explicit colours: the global span style is white-on-shadow, unreadable on
   the rose's light background */
.rose-speed {
  font-size: 2.2rem;
  line-height: 1;
  padding-top: 10px;
  color: var(--darkBlue);
  text-shadow: none;
}

.rose-direction {
  font-size: 1.5rem;
  color: var(--darkBlue);
  text-shadow: none;
}

.rose-unit {
  font-size: 0.8rem;
  text-decoration: underline;
  pointer-events: auto;
  color: var(--darkBlue);
  text-shadow: none;
}

.rose-time {
  align-items: center;
  padding-top: 8px;
}

.rose-time > span {
  color: var(--darkBlue);
  text-shadow: none;
}

.rose-tmst {
  font-size: 0.6rem !important;
  opacity: 0.6;
}
</style>
