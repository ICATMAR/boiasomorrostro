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
      <!-- Variable names and units -->
      <div class="horizontal variable-names-row">
        <div class="vertical variable-names-subcontainer">
          <span v-for="v in variables" :key="v.code">{{ $t(v.name) }}</span>
        </div>
        <div class="vertical variable-names-subcontainer">
          <span v-for="v in variables" :key="v.code">{{ v.unit }}</span>
        </div>
      </div>
    </div>

    <!-- Data timeline -->
    <div class="horizontal table-and-info-container" ref="tableSlidingContainer"
      @mousedown="startDragging"
      @touchstart="startDragging">

      <!-- Timeline container -->
      <div class="horizontal table-container" ref="tableContainer">
        <div class="vertical" style="align-self: flex-start">
          <slot name="grid"></slot>
        </div>
      </div>
    </div>
  </div>
</template>


<script>

export default {
  name: "DTLayout",
  props: {
    variables: Array, // [{ code, name, unit }]
  },
  mounted() {
    this.resetScroll();
  },
  // Clean up global listeners if component is destroyed
  beforeUnmount() {
    this.stopDragging();
  },
  data() {
    return {
      // Dragging variables
      isDragging: false,
      startX: 0,
      scrollLeft: 0,
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

.variable-names-row {
  padding-right: 10px;
  text-align: right;
  align-self: flex-end;
}

.variable-names-subcontainer {
  align-self: flex-start;
  padding-top: 3px;
}

.variable-names-subcontainer > span {
  color: black;
  text-shadow: none;
  font-size: 0.7rem;
  height: 23px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding-left: 5px;
}

</style>
