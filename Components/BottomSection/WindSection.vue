<template>
  <div class="vertical content" :class="{ 'content-full-screen': $gui.panelState === 'fullscreen' }">
    <BuoyStatusMessage v-if="loaded && $dataService.buoy.status !== 'ok'" :product="$dataService.buoy"></BuoyStatusMessage>

    <template v-else>
      <div class="rose-wrapper" :class="{ expanded: isFullscreen }">

        <!-- Wind history (fullscreen only): one bigger, fainter ring per 15-min
             step back from the current reading. Value + arrow reuse VISOC's
             MapCircleArrows "chip" shape (rotate to the bearing, then push out
             to the ring's radius), coloured by colorLegends.js instead of a
             fixed colour. -->
        <div class="history-rings" v-if="isFullscreen">
          <!-- Ring outlines - hovering this ring's chip or hour label thickens
               and fully opacifies it (see hoveredRing) -->
          <div class="history-ring" v-for="h in historyRings" :key="'ring-' + h.key"
            :class="{ 'no-data': !h.hasData, 'ring-hovered': hoveredRing === h.key }"
            :style="{ width: h.diameter + 'px', height: h.diameter + 'px', opacity: hoveredRing === h.key ? 1 : h.opacity }"></div>

          <!-- Value + arrow chips (painted after the rings so they sit on top).
               Hovering highlights this same ring + its hour label too. -->
          <template v-for="h in historyRings" :key="'chip-' + h.key">
            <div v-if="h.hasData" class="history-chip horizontal clickable"
              @mouseenter="hoveredRing = h.key" @mouseleave="hoveredRing = null"
              :style="{
                rotate: (h.direction - 90) + 'deg',
                transform: `translateX(calc(-50% + ${h.radius}px))`,
                background: h.color,
                opacity: 1,
              }">
              <div class="history-chip-arrow" :style="{ background: h.color }"></div>
              <span :style="{ rotate: textRotation(h.direction), display: 'block' }">{{ h.speedText }}</span>
            </div>
          </template>

          <!-- Hour labels, bottom-right of each ring. Hovering also highlights
               this ring + its chip (same effect as hovering the chip itself). -->
          <span class="history-hour clickable" v-for="h in historyRings" :key="'hour-' + h.key"
            @mouseenter="hoveredRing = h.key" @mouseleave="hoveredRing = null"
            :style="{ left: h.hourX + 'px', top: h.hourY + 'px', opacity: hoveredRing === h.key ? 1 : h.opacity }">{{ h.hourText }}</span>
        </div>

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

// Wind history (fullscreen only): concentric rings going back in time
const HISTORY_COUNT = 8;             // 2 hours of 15-min steps
const HISTORY_STEP_MINUTES = 15;
const HISTORY_RADIUS_STEP = 40;      // px added per step
const HISTORY_OPACITY_START = 0.75;  // at 15 min
const HISTORY_OPACITY_FLOOR = 0.4;   // reached at 1h, held for the rest
const HISTORY_OPACITY_FLOOR_MINUTES = 60;
const HISTORY_CENTER = RADIUS + HISTORY_COUNT * HISTORY_RADIUS_STEP; // half of the history box

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
    if (this.row) this.loadHistory();
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
      history: [], // [{ date, WSPD, WDIR }], 15 min apart, oldest last - see loadHistory()
      hoveredRing: null, // key of the history ring currently hovered (via its chip or hour label)
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
    // Wind at each 15-min step going back from the reference row, for the
    // fullscreen history rings. Cheap: the buoy's data is already loaded in
    // memory, getValueAt() just reads it (see SourceErddapBuoy).
    async loadHistory() {
      const buoy = this.$dataService.buoy;
      const baseTime = this.row.date.getTime();
      const entries = [];
      for (let i = 1; i <= HISTORY_COUNT; i++) {
        const date = new Date(baseTime - i * HISTORY_STEP_MINUTES * 60000);
        const [WSPD, WDIR] = await Promise.all([
          buoy.getValueAt('WSPD', date, HISTORY_STEP_MINUTES),
          buoy.getValueAt('WDIR', date, HISTORY_STEP_MINUTES),
        ]);
        entries.push({ date, WSPD, WDIR });
      }
      this.history = entries;
    },
    // Colour for a raw (m/s) wind speed, using the WIND legend and the
    // currently selected unit's range - moves if the user switches units
    colorForSpeed(rawSpeed) {
      const { range, toDisplay } = this.windUnit;
      const value = toDisplay(rawSpeed);
      const t = Math.min(Math.max((value - range[0]) / (range[1] - range[0]), 0), 1);
      const stops = this.$gui.colorLegend('WSPD');
      for (let i = 0; i < stops.length - 1; i++) {
        const [t0, c0] = stops[i];
        const [t1, c1] = stops[i + 1];
        if (t <= t1) {
          const f = (t - t0) / (t1 - t0);
          const r = Math.round(c0[0] + (c1[0] - c0[0]) * f);
          const g = Math.round(c0[1] + (c1[1] - c0[1]) * f);
          const b = Math.round(c0[2] + (c1[2] - c0[2]) * f);
          return `rgb(${r}, ${g}, ${b})`;
        }
      }
      const [, last] = stops[stops.length - 1];
      return `rgb(${last[0]}, ${last[1]}, ${last[2]})`;
    },
    // HH:MM for a history ring's hour label, respecting the app's local/UTC toggle
    formatHour(date) {
      const h = this.$gui.timelineUseLocalTime ? date.getHours() : date.getUTCHours();
      const m = this.$gui.timelineUseLocalTime ? date.getMinutes() : date.getUTCMinutes();
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    },
    // Same simplification as VISOC's MapCircleArrows: flip 180° on the bottom
    // half so the value text never renders upside-down, without a full
    // counter-rotation (the chip itself is rotated to the wind's bearing)
    textRotation(angle) {
      return angle > 180 ? '180deg' : '0deg';
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
    isFullscreen() {
      return this.$gui.panelState === 'fullscreen';
    },
    // Ring geometry/content for each 15-min step back from the reference row
    historyRings() {
      if (!this.row) return [];
      const bottomRightRad = (135 - 90) * Math.PI / 180; // bottom-right of the ring
      return this.history.map((h, i) => {
        const step = i + 1;
        const minutesAgo = step * HISTORY_STEP_MINUTES;
        const radius = RADIUS + step * HISTORY_RADIUS_STEP;
        const hasData = h.WSPD != undefined && h.WDIR != undefined;
        const opacityT = Math.min(Math.max(
          (minutesAgo - HISTORY_STEP_MINUTES) / (HISTORY_OPACITY_FLOOR_MINUTES - HISTORY_STEP_MINUTES), 0), 1);
        return {
          key: minutesAgo,
          radius,
          diameter: radius * 2,
          opacity: HISTORY_OPACITY_START + (HISTORY_OPACITY_FLOOR - HISTORY_OPACITY_START) * opacityT,
          hasData,
          direction: hasData ? h.WDIR : undefined,
          speedText: hasData ? this.windUnit.toDisplay(h.WSPD).toFixed(this.windUnit.decimals) : '',
          color: hasData ? this.colorForSpeed(h.WSPD) : undefined,
          hourX: HISTORY_CENTER + radius * Math.cos(bottomRightRad),
          hourY: HISTORY_CENTER + radius * Math.sin(bottomRightRad),
          hourText: this.formatHour(h.date),
        };
      });
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

/* Fills (and is capped by) whatever height .section-content gives this panel
   in fullscreen, instead of growing past the viewport once the wind-history
   rings expand .rose-wrapper to 860px - min-height:0 lets IT shrink so its
   own overflow:auto scrolls internally, keeping the top-left icons and bottom
   tab bar on screen. align-items/justify-content start (not center) so the
   scrollable area has no "unreachable" region on either axis. */
.content-full-screen {
  flex: 1;
  min-height: 0;
  justify-content: flex-start;
  overflow: hidden;
}

.rose-wrapper {
  position: relative;
  width: 220px;
  height: 220px;
  flex-shrink: 0;
}

.rose-wrapper.expanded {
  width: 860px;
  height: 860px;
  /* Never squeezed by flex-shrink: every ring/chip below is positioned with
     px math that assumes this box is exactly 860x860 - if flex shrank it,
     .history-rings (inset:0) would shrink with it while its children kept
     their large computed sizes, spilling far outside the smaller box. Fixed
     size + the scroll container above is what keeps it contained instead. */
  flex-shrink: 0;
}

.rose {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 220px;
  height: 220px;
  pointer-events: none;
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

/* WIND HISTORY (fullscreen) */
.history-rings {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

/* No explicit top/left: its "static position" (see CSS abspos-flex-item
   rules) is the flex-centered one, i.e. the shared center of every ring.
   Transition so hovering its chip/hour (a sibling, so :hover itself doesn't
   apply here) still animates smoothly. */
.history-ring {
  position: absolute;
  box-sizing: border-box;
  border: 1px solid var(--darkBlue);
  border-radius: 50%;
}

.history-ring.no-data {
  border-width: 0.5px;
}

.history-ring.ring-hovered {
  border-width: 2px;
}

/* Same shape as VISOC's MapCircleArrows .variableValue/.variableArrow: a
   rounded-on-one-side chip with a diamond "pointer" behind it, rotated to the
   wind's bearing then pushed out to the ring's radius. Colour set inline
   (colorForSpeed) instead of VISOC's fixed var(--blue). */
.history-chip {
  position: absolute;
  pointer-events: auto; /* hoverable despite .history-rings' pointer-events:none */
  font-size: 0.65rem;
  padding-right: 3px;
  padding-left: 5px;
  border-radius: 50px 0 0 50px;
  white-space: nowrap;
}

.history-chip > span {
  color: black;
  text-shadow: none;
  z-index: 1;
}

.history-chip-arrow {
  position: absolute;
  left: 0;
  transform: translate(4%) rotate(45deg);
      height: 40px;
    width: 40px;
  z-index: 0;
  border-radius: 0 100px 0 0;
}

.history-hour {
  position: absolute;
  transform: translate(-50%, -50%);
  font-size: 0.55rem;
  color: var(--darkBlue);
  text-shadow: none;
  white-space: nowrap;
  pointer-events: auto; /* hoverable now (see hoveredRing) - .clickable's own auto would work too, but set explicitly to be sure */
  background: #ffffff94;
  border-radius: 8px;
  padding: 0px 4px;
  transition: opacity 0.2s ease-in-out;
}
</style>
