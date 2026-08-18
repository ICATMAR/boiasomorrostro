<template>
  <!-- One row per variable: coloured cell with the value and, if the
       variable has a direction, an arrow pointing where it goes -->
  <tr v-for="v in variables" :key="v.code">
    <td v-for="(cell, index) in cells" :key="index" class="value-cell"
      :style="{ background: cellColor(v, index) }"
      :title="cellTitle(v, cell, index)">
      <i v-if="arrowAngle(v, index) != undefined" class="fa-solid fa-location-arrow cell-arrow"
        :style="{ transform: `rotate(${arrowAngle(v, index) - 45}deg)` }"></i>
      <span class="cell-value">{{ cellText(v, index) }}</span>
    </td>
  </tr>
</template>


<script>

export default {
  name: "DataTimeline",
  props: {
    product: Object,  // DataProduct, see Assets/Scripts/data/products/
    variables: Array, // rows to show - already filtered for the panel state
    cells: Array,     // [Date], one per column - shared across every product in the timeline
  },
  created() {
    this.loadToken = 0; // discards responses of a previous request (not reactive)
  },
  mounted() {
    this.loadValues();
  },
  data() {
    return {
      values: {}, // { standardCode: [value per cell] }
    }
  },
  methods: {
    // Requests every variable (and its direction) on every visible cell. Cells are
    // filled as the requests resolve, so the timeline shows data progressively.
    loadValues() {
      const token = ++this.loadToken;
      const cells = this.cells;
      const intervalMinutes = this.$gui.timelineIntervalMinutes;

      const values = {};
      this.codes.forEach(code => values[code] = new Array(cells.length));
      this.values = values;

      this.codes.forEach(code => {
        cells.forEach((cell, index) => {
          this.product.getValueAt(code, cell, intervalMinutes).then(value => {
            if (token != this.loadToken) return; // cells changed while loading
            this.values[code][index] = value;
          });
        });
      });
    },
    // Value of a variable on a cell, undefined if it has not loaded or has no data
    valueAt(code, index) {
      return this.values[code] == undefined ? undefined : this.values[code][index];
    },
    // { unit, decimals, range }: the variable's own, or its group's selected unit
    unitOption(v) {
      return v.unitGroup ? this.$gui.unitOption(v.unitGroup) : v;
    },
    // Value converted to the currently selected unit (a no-op without a unitGroup)
    displayValue(v, index) {
      const raw = this.valueAt(v.code, index);
      if (raw == undefined) return undefined;
      const option = this.unitOption(v);
      return option.toDisplay ? option.toDisplay(raw) : raw;
    },
    cellText(v, index) {
      const value = this.displayValue(v, index);
      return value == undefined ? '' : value.toFixed(this.unitOption(v).decimals);
    },
    // Arrows point where the variable goes, so directions given as where it comes
    // from (wind, waves) are turned around
    arrowAngle(v, index) {
      if (v.directionCode == undefined) return undefined;
      const direction = this.valueAt(v.directionCode, index);
      if (direction == undefined) return undefined;
      const angle = v.fromDirection ? direction + 180 : direction;
      return (angle % 360 + 360) % 360; // currents come as -180..180
    },
    cellColor(v, index) {
      const value = this.displayValue(v, index);
      if (value == undefined) return 'transparent';
      const { range } = this.unitOption(v);
      const t = Math.min(Math.max((value - range[0]) / (range[1] - range[0]), 0), 1);
      const colorStops = this.$gui.colorLegend(v.code);
      for (let i = 0; i < colorStops.length - 1; i++) {
        const [t0, c0] = colorStops[i];
        const [t1, c1] = colorStops[i + 1];
        if (t <= t1) {
          const f = (t - t0) / (t1 - t0);
          const r = Math.round(c0[0] + (c1[0] - c0[0]) * f);
          const g = Math.round(c0[1] + (c1[1] - c0[1]) * f);
          const b = Math.round(c0[2] + (c1[2] - c0[2]) * f);
          return `rgb(${r}, ${g}, ${b})`;
        }
      }
      // t clamped to [0,1] should always match a segment above; this is just
      // a safety net, so use the legend's own last colour instead of a fixed one
      const [, lastColor] = colorStops[colorStops.length - 1];
      return `rgb(${lastColor[0]}, ${lastColor[1]}, ${lastColor[2]})`;
    },
    cellTitle(v, cell, index) {
      const value = this.displayValue(v, index);
      if (value == undefined) return this.$t('No data available');
      const direction = this.arrowAngle(v, index);
      const directionStr = direction == undefined ? '' : ` · ${direction.toFixed(0)}º`;
      const option = this.unitOption(v);
      return `${cell.toISOString()}\n${this.$t(v.name)}: ${value.toFixed(option.decimals)} ${option.unit}${directionStr}`;
    },
  },
  computed: {
    // Variables shown as rows, plus the directions they need
    codes() {
      const codes = [];
      this.variables.forEach(v => {
        codes.push(v.code);
        if (v.directionCode) codes.push(v.directionCode);
      });
      return codes;
    },
  },
  watch: {
    // cells changes when the timeline scale or its date range does
    cells() {
      this.loadValues();
    },
    // Compact/fullscreen swaps the rows, so the extra ones need loading
    variables() {
      this.loadValues();
    },
  },
}

</script>


<style scoped>
.value-cell {
  border-bottom: 1px solid #0000002e;
  padding: 0;
}

.cell-value {
  font-size: 0.65rem;
  color: black;
  text-shadow: none;
  padding: 0px 1px;
}

.cell-arrow {
  font-size: 9px;
  color: rgba(0, 0, 0, 0.75);
}
</style>
