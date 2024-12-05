<template>
  <div class="timeStringContainer">
    <!-- Backward 24h -->
    <div class="white-text clickable" @click="changeSelectedDate(-24)" title="-24h">≪</div>
    <!-- Backward 1h -->
    <div class="white-text clickable" @click="changeSelectedDate(-1)" title="-1h">&lt;</div>
    <!-- Time string -->
    <div class="white-text clickable" @click="isCalendarVisible = true">
      <span class="fa">&#xf073; </span>{{ timeStr }}
    </div>
    <!-- Forward 1h -->
    <div class="white-text clickable" @click="changeSelectedDate(1)" title="+1h">></div>
    <!-- Forward 24h -->
    <div class="white-text clickable" @click="changeSelectedDate(24)" title="+24h">≫</div>
  </div>

  <Transition> <!-- Vue transition -->
    <calendar v-show=isCalendarVisible @hideCalendar="isCalendarVisible = false"></calendar>
  </Transition>
</template>



<script>

import Calendar from "./Calendar.vue"

export default {
  name: "TimeString",
  emits: ["changeSelectedDate"],
  created() {
    
  },
  mounted() {
    // EVENTS
    
    // window.eventBus.on('DataStreamsBar_SelectedDateChanged', setTimeStr);
    window.eventBus.on('Calendar_SelectedDate', this.setTimeStr);
    // window.eventBus.on('HFRadarDataLoaded', (tmst) =>{
    //   if(tmst != undefined)
    //     setTimeStr(tmst);
    // });

    // Automatic update of time string (time diff mainly)
    this.updateTimeString();
    
  },
  data (){
    return {
      // Time string
      timeStr: 'Loading dataset...',
      isCalendarVisible: false,
      currentTmst: undefined,
    }
  },
  methods: {
    // USER ACTIONS
    // Change current timestamp
    changeSelectedDate(timeDifferenceInHours){
      let d = new Date(this.currentTmst);
      d.setUTCHours(d.getUTCHours() + timeDifferenceInHours);
      this.currentTmst = d.toISOString();
      this.setTimeStr(this.currentTmst);
    },


    // PRIVATE
    setTimeStr: function(tmst) {
      this.timeStr = this.formatTimestampString(tmst);
      // Emit event
      window.eventBus.emit('TimeString_SelectedDateChanged', tmst);
    },

    // Format the time string to a human readable format
    formatTimestampString: function(tmst){
      this.currentTmst = tmst;
      let dd = new Date(tmst);
      let ss = dd.toLocaleString('en-GB');
      ss = ss.substring(0, ss.length - 6) + ':00';
      // Add time difference from now
      let now = new Date();
      let timeDiff = dd.getTime() - now.getTime();
      let hoursDiff = Math.floor(timeDiff/(60*60*1000));
      let minDiff = 60 - Math.floor(timeDiff/(60*1000) - hoursDiff*60);
    
      if (hoursDiff < -24 * 31 || hoursDiff > 24 * 31){
        return ss;
      }
      else if (hoursDiff < -24 || hoursDiff > 24){
        let daysDiff = Math.floor(hoursDiff / 24);
        hoursDiff = hoursDiff - daysDiff*24;
        return ss + " ("+ daysDiff + "d " + Math.abs(hoursDiff+1) + "h)";
      } else
        return ss + " (" + (hoursDiff+1) + "h " + minDiff + "min)";
    },

    
    // Update time string to display
    updateTimeString: function(){
      if (this.currentTmst != undefined){
        this.timeStr = this.formatTimestampString(this.currentTmst);
      }

      // Loop
      setTimeout(() => {
        this.updateTimeString();
      }, 30*1000); // Every 30 seconds
    },



    // PUBLIC
    setCurrentTmst: function(tmst){
      this.setTimeStr(tmst);
    }
  },
  components: {
    calendar: Calendar
  }
}
</script>












<style scoped>
.timeStringContainer {
  /* position:absolute; 
  top: -30px;  */
  width: 100%;
  background: linear-gradient(90deg, rgba(20, 120, 167, 0) 0%, rgba(20, 120, 167, 0.8) 10%, rgba(20, 120, 167, 0.8) 90%, rgba(20, 120, 167, 0) 100%);

  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}
.timeStringContainer > div {
  text-align: center;
  user-select: none;
  min-width: 20px;
  font-size: clamp(0.8rem, 1.2vw, 0.8rem);
}



/* Transition */
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  height: 0;
  transform: translateY(20px);
}
</style>