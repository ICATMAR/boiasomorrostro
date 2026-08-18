<template>
  <!-- Data and timeline section -->
  <div class="horizontal data-timeline-container">
    <!-- Variables -->
    <div class="vertical variable-names-container">
      <!-- Interval zoom buttons -->
      <div class="horizontal interval-picker">
        <button class="zoom-btn clickable" :disabled="!canZoomOut" @click="zoomOut" :title="$t('Time step')">
          <i class="fa-solid fa-magnifying-glass-minus"></i>
        </button>
        <span class="scale-label">{{ $gui.timelineScaleId }}</span>
        <button class="zoom-btn clickable" :disabled="!canZoomIn" @click="zoomIn" :title="$t('Time step')">
          <i class="fa-solid fa-magnifying-glass-plus"></i>
        </button>
      </div>
      <!-- Timezone toggle -->
      <div class="horizontal interval-picker">
        <span class="clickable" style="text-decoration: underline;" @click="$gui.timelineUseLocalTime = !$gui.timelineUseLocalTime">{{ $gui.timelineTimezoneLabel }}</span>
      </div>
      <!-- Variable names and units, grouped per data product -->
      <div class="vertical variable-names-list">
        <template v-for="group in groups" :key="group.name">
          <!-- Spacer matching the product row on the right (see DataSection.vue) -->
          <div class="group-spacer"></div>
          <div class="horizontal name-row" v-for="v in group.product.variables" :key="v.code">
            <span class="var-name">{{ $t(v.name) }}</span>
            <span class="var-unit">{{ v.unit }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Data timeline -->
    <div class="horizontal table-and-info-container" ref="tableSlidingContainer"
      @mousedown="startDragging"
      @touchstart="startDragging">

      <!-- Timeline container -->
      <div class="horizontal table-container" ref="tableContainer">
        <div class="vertical timeline-inner">
          <slot name="grid"></slot>
          <!-- Current time marker, non-interactive -->
          <div class="now-line" :style="{ left: nowLineLeft + 'px' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>

const CELL_WIDTH_PX = 40; // must match .dt-table td width in DTTimelineGrid.vue

export default {
  name: "DTLayout",
  props: {
    groups: Array, // [{ name, product }], see $dataService.dataProducts
  },
  mounted() {
    this.resetScroll();
    // Move the current time marker forward as time passes
    this.nowTimer = setInterval(() => { this.now = Date.now(); }, 60000);
  },
  // Clean up global listeners if component is destroyed
  beforeUnmount() {
    this.stopDragging();
    clearInterval(this.nowTimer);
  },
  data() {
    return {
      // Dragging variables
      isDragging: false,
      startX: 0,
      scrollLeft: 0,
      now: Date.now(),
    }
  },
  methods: {
    // Index of the selected time scale, ordered coarse -> fine (zoom out -> zoom in)
    currentScaleIdx() {
      return this.$gui.timescales.findIndex(t => t.id === this.$gui.timelineScaleId);
    },
    zoomIn() {
      this.$gui.timelineScaleId = this.$gui.timescales[this.currentScaleIdx() + 1].id;
      this.resetScroll();
    },
    zoomOut() {
      this.$gui.timelineScaleId = this.$gui.timescales[this.currentScaleIdx() - 1].id;
      this.resetScroll();
    },
    // Reset scroll position so the current time is centered
    resetScroll() {
      this.$nextTick(() => {
        const slidingContainer = this.$refs.tableSlidingContainer;
        const tableContainer = this.$refs.tableContainer;
        slidingContainer.scrollLeft = Math.max(0, (tableContainer.offsetWidth - slidingContainer.offsetWidth) / 2);
      });
    },

    // DRAGGING THE TIMELINE
    startDragging(e) {
      this.isDragging = true;

      // Get the initial X position (support both Mouse and Touch)
      const pageX = e.type === 'touchstart' ? e.touches[0].pageX : e.pageX;

      const container = this.$refs.tableSlidingContainer;
      this.startX = pageX - container.offsetLeft;
      this.scrollLeft = container.scrollLeft;

      // Add global listeners so dragging continues even if mouse leaves the div
      window.addEventListener('mousemove', this.onDragging);
      window.addEventListener('touchmove', this.onDragging);
      window.addEventListener('mouseup', this.stopDragging);
      window.addEventListener('touchend', this.stopDragging);
    },
    onDragging(e) {
      if (!this.isDragging) return;

      // Prevent default behavior to stop text selection or page bounce
      if (e.cancelable) e.preventDefault();

      const pageX = e.type === 'touchmove' ? e.touches[0].pageX : e.pageX;
      const container = this.$refs.tableSlidingContainer;

      const x = pageX - container.offsetLeft;
      // Multiplier makes the scroll speed feel more responsive
      const walk = (x - this.startX) * 1.5;
      container.scrollLeft = this.scrollLeft - walk;
    },
    stopDragging() {
      this.isDragging = false;
      window.removeEventListener('mousemove', this.onDragging);
      window.removeEventListener('touchmove', this.onDragging);
      window.removeEventListener('mouseup', this.stopDragging);
      window.removeEventListener('touchend', this.stopDragging);
    },
  },
  computed: {
    canZoomIn() {
      return this.currentScaleIdx() < this.$gui.timescales.length - 1;
    },
    canZoomOut() {
      return this.currentScaleIdx() > 0;
    },
    // Horizontal offset of the current-time marker, in pixels along the grid
    nowLineLeft() {
      const elapsedMs = this.now - this.$gui.timelineStartDate.getTime();
      const cellMs = this.$gui.timelineIntervalMinutes * 60 * 1000;
      return (elapsedMs / cellMs) * CELL_WIDTH_PX;
    },
  }
}

</script>


<style scoped>
.data-timeline-container {
  min-width: 100%;
  background: var(--lightBlue);
  align-items: flex-start;
}

.table-and-info-container {
  height: 100%;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  scroll-behavior: auto;
  width: calc(100% - 145px);
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.table-and-info-container:active {
  cursor: grabbing;
}

.table-container {
  height: 100%;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.85);
}

.timeline-inner {
  align-self: flex-start;
  position: relative;
}

.now-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--red);
  pointer-events: none;
  z-index: 2;
}

.variable-names-container {
  width: 145px;
  min-width: 145px;
  font-size: 0.7rem;
  height: 100%;
  background: var(--lightBlue);
  align-items: flex-end;
}

.interval-picker {
  height: 22px;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
  padding-right: 10px;
}

.scale-label {
  font-size: 0.7rem;
  padding: 0px 2px;
}

.zoom-btn {
  background: none;
  padding: 2px 3px;
  font-size: small;
  color: white;
  text-shadow: 0 0 4px black;
  border-radius: 4px;
  line-height: 1;
}

.zoom-btn:disabled {
  color: rgba(255, 255, 255, 0.8);
  text-shadow: none;
  cursor: default;
  transform: none;
}

.zoom-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.variable-names-list {
  width: 100%;
  padding-right: 10px;
  align-self: flex-start;
}

/* Matches the height of the product row on the right (a plain .dt-table td) */
.group-spacer {
  height: 22px;
}

.name-row {
  height: 22px;
  justify-content: flex-end;
  gap: 6px;
}

.name-row > span {
  color: black;
  text-shadow: none;
  font-size: 0.7rem;
  padding: 0;
}

.var-unit {
  text-decoration: underline;
}

</style>
