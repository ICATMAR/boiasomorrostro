<template>
<table class="dt-table">
  <tbody>
    <!-- Days of week -->
    <tr>
      <td v-for="day in days" :key="day.date" :colspan="day.span" class="weekDayCell">
        <span>{{ day.textLong }}</span>
      </td>
    </tr>
    <!-- Hours: single label per cell -->
    <tr>
      <td v-for="(cell, index) in cells" :key="index" class="hourCell">
        <span :style="{ opacity: ($gui.timelineHours(cell) < 6 || $gui.timelineHours(cell) >= 21) ? '0.4' : '1' }">{{ $gui.timelineHours(cell) }}</span>
      </td>
    </tr>
    <!-- Data rows provided by the caller -->
    <slot :cells="cells"></slot>
  </tbody>
</table>
</template>


<script>

export default {
  name: "DTTimelineGrid",
  computed: {
    cells() {
      const startTime = this.$gui.timelineStartDate.getTime();
      const endTime = this.$gui.timelineEndDate.getTime();
      const stepMs = this.$gui.timelineIntervalMinutes * 60 * 1000;
      let cells = [];
      for (let t = startTime; t < endTime; t += stepMs)
        cells.push(new Date(t));
      return cells;
    },
    days() {
      let days = [];
      for (const cell of this.cells) {
        const last = days[days.length - 1];
        if (last && this.$gui.timelineDate(last.date) === this.$gui.timelineDate(cell))
          last.span++;
        else
          days.push({
            date: cell,
            span: 1,
            textLong: this.$gui.timelineFormatDay(cell, this.$i18n.locale),
          });
      }
      return days;
    },
  }
}

</script>


<!-- Non-scoped: applies to slot content rendered by the DataTimeline -->
<style>
.dt-table {
  border-collapse: collapse;
  border-spacing: 0;
  align-self: flex-start;
}

.dt-table td {
  width: 40px;
  height: 22px;
  text-align: center;
}

/* Overrides the global span style (white, shadowed and larger) inside the grid */
.dt-table td > * {
  color: black;
  text-shadow: none;
  text-wrap: nowrap;
  font-size: 0.7rem;
  padding: 0;
}

.weekDayCell {
  text-align: left;
  padding-left: 15px;
  border-left: 1px solid gray;
  border-bottom: 1px solid gray;
}

.hourCell {
  border-bottom: 1px solid #0000002e;
  position: relative;
  overflow: visible;
}

.hourCell > span {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translate(-50%, -50%);
  white-space: nowrap;
}
</style>
