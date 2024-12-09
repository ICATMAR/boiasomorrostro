<template>
  
  <div id="discrete-waves-panel" class="content">

    <p>In this section you can visualize and modify manually the discrete waves that form the sea state.</p>

    <p>You can also drag and drop a .json file with the discrete waves. Download the properties ("Export data" button) to see the format of the .json file.</p>

    <p>Waves are limited to 10 meter height and periods of 20 seconds.</p>

    <!-- TABLE -->
    <div class="container-vertical">
      <!-- ROW -->
      <div class="container-horizontal">
        <span class="emptyCell"></span>
        <span>Wave</span>
        <span>Height</span>
        <span>Period</span>
        <span>Direction</span>
        <span>Phase</span>
      </div>

      <div class="container-horizontal" :class="index%2 == 0 ? 'odd' : ''" v-for="(ww, index) in discreteWaves">
        <button class="close-button clickable" @click="removeWave(index)"><span>x</span></button>
        <span>{{ index +1}}</span>
        <!-- Display numbers -->
        <span class="editableSpan clickable" v-show="!isEditing" @click="startEditing">{{ ww.hm0.toFixed(2) }} m</span>
        <span class="editableSpan clickable" v-show="!isEditing" @click="startEditing">{{ ww.T.toFixed(1) }} s</span>
        <span class="editableSpan clickable" v-show="!isEditing" @click="startEditing">{{ ww.dir.toFixed(0) }}º</span>
        <span class="editableSpan clickable" v-show="!isEditing" @click="startEditing">{{ ww.phase.toFixed(0) }}º</span>
        <!-- Input forms -->
        <div v-show="isEditing">
          <input  type="number" min="0.01" max="10" step="0.01" :value="ww.hm0" name="hm0" @change="onChange($event, index, 'hm0')"/>
          <span> m</span>
        </div>
        <div v-show="isEditing">
          <input  type="number" min="0.1" max="20" step="0.1" :value="ww.T" name="T" @change="onChange($event, index, 'T')"/>
          <span> s</span>
        </div>
        <div v-show="isEditing">
          <input  type="number" min="0" max="360" step="1" :value="ww.dir" name="dir" @change="onChange($event, index, 'dir')"/>
          <span> º</span>
        </div>
        <div v-show="isEditing">
          <input  type="number" min="0" max="360" step="1" :value="ww.phase" name="phase" @change="onChange($event, index, 'phase')"/>
          <span> º</span>
        </div>

      </div>
      <!-- Add new wave -->
      <div class="container-horizontal" :class="discreteWaves.length%2 == 0 ? 'odd' : ''">
        <button class="add-button clickable" @click="addWave"><span>+</span></button>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      <!-- Export button -->
      <button class="exportButton clickable" @click="exportData">Export wave's properties <span class="fa">&#xf56d;</span></button>

    </div>
  </div>
  

</template>






<script>




export default {
  name: "DiscreteWavesPanel",
  created() {

  },
  mounted() {
    document.body.addEventListener("drop", this.onDropFile);
    document.body.addEventListener("dragover", this.onDragOver);
    if (window.sceneManager != undefined){
      this.discreteWaves = window.sceneManager.getDiscreteWaves();
    }
  },
  data() {
    return {
      discreteWaves: [
        {hm0: 0.92, T: 10, dir: 50, phase: 0},
        {hm0: 0.15, T: 3.7, dir: 84, phase: 0},
        {hm0: 0.53, T: 5.1, dir: 345, phase: 0},
        {hm0: 0.18, T: 5.2, dir: 239, phase: 0},
      ],
      isEditing: false,
    }
  },
  methods: {
    // DRAG AND DROP
    // DRAG & DROP FILES
    onDragOver: function(event) {
      event.preventDefault();
      event.stopPropagation();
    },
    // On drop event
    onDropFile: function(event) {
      event.preventDefault();
      event.stopPropagation();

      let files = event.dataTransfer.files;
      let file = files[files.length - 1]; // Latest file

      let reader = new FileReader();
      reader.fileName = file.name;
      console.log("File dropped: " + file.name);

      // On load file
      reader.addEventListener('load', e => {
        try {
          this.discreteWaves = JSON.parse(reader.result);
          window.eventBus.emit('DiscreteWavesPanel_setDiscreteWaves', this.discreteWaves);
        } catch (e) {
          console.error(e);
          alert('Could not read .json\n' + e);
        }
      });
      reader.addEventListener('error', e => {
        console.error('Could not read file ' + reader.file.name);
        console.error(e);
      })
      // Read as text
      reader.readAsText(file);
    
    },
    // USER INPUT
    addWave: function(e){
      if (e){ e.preventDefault(); e.stopPropagation();}
      // Create wave
      this.discreteWaves.push({
        hm0: (Math.random()*1+0.5),
        T: (Math.random()*12 + 2),
        dir: (Math.random()*90),
        phase: Math.random()*360,
      });
      this.startEditing();
      window.eventBus.emit('DiscreteWavesPanel_setDiscreteWaves', this.discreteWaves);
    },
    removeWave: function(index){
      this.discreteWaves.splice(index, 1);
      window.eventBus.emit('DiscreteWavesPanel_setDiscreteWaves', this.discreteWaves);
    },
    exportData: function(){
      const link = document.createElement('a');
      link.download = 'discreteWaves.json';
      let data = this.discreteWaves;
      link.href = window.URL.createObjectURL(new Blob([JSON.stringify(data)], {type: 'text/json'}));
      link.click();
      link.delete;
    },
    // START / STOP EDITING VALUES
    startEditing: function(e){
      if (e !== undefined){
        e.stopPropagation();
        e.preventDefault();
      }
      this.isEditing = true;
      // EVENTS
      // Stops editing when clicking outside the input forms or pressing Enter / Escape
      const stopEditing = (e)=>{
        // Do not apply if clicking input EL
        if (e.type == 'click'){
          if (e.target.nodeName == 'INPUT')
            return
        }
        // Apply only for escape
        if (e.type == 'keyup'){
          if (e.key != 'Escape' && e.key != 'NumpadEnter' && e.key != 'Enter')
            return;
        }
        this.isEditing = false;
        document.removeEventListener("click", stopEditing);        
        window.removeEventListener("keyup", stopEditing);
      };
      document.addEventListener("click", stopEditing);
      window.addEventListener("keyup", stopEditing);
    },
    onChange: function(e, index, key){
      let value = parseFloat(e.target.valueAsNumber);
      // Limit value
      if (value > parseFloat(e.target.max) || isNaN(value)){
        e.target.valueAsNumber = parseFloat(e.target.max);
        e.target.value = value = parseFloat(e.target.max);
      } else if (value < parseFloat(e.target.min) || isNaN(value)){
        e.target.valueAsNumber = parseFloat(e.target.min);
        e.target.value = value = parseFloat(e.target.min);
      }
       // TODO: TAKE INTO ACCOUNT RELATIONSHIP BETWEEN HM0 AND T (steepness below 0.5)
      this.discreteWaves[index][key] = value;
      window.eventBus.emit('DiscreteWavesPanel_setDiscreteWaves', this.discreteWaves);
    }
  },
  components: {

  }
}
</script>



<style scoped>

.content {
  padding: 20px;
  overflow: auto;
  font-size: small;
  max-width: 700px;
}

.container-vertical{
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;

  padding: 20px;
  background: var(--lightBlue);
  border-radius: 20px;
}

.container-horizontal {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-evenly;
  padding: 2px;
}

.container-horizontal > * {
  width: 100%;
  display: flex;
  justify-content: center;
}

.odd {
  background: linear-gradient(90deg, transparent 0%, #77cfef 10%, #77cfef 90%, transparent 100%);;
}

.close-button {
  width: 20px;
  height: 20px;
  background: var(--red);
  border-radius: 50%;
  text-align: center;

  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.6);
}

.add-button {
  width: 20px;
  height: 20px;
  background: #1dbb1d;
  border-radius: 50%;
  text-align: center;

  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.6);
}


.emptyCell{
  width: 60px;
  height: 20px;
}

.exportButton{
  margin: 20px 20px 0px 20px;
}

.exportButton:hover{
  background: var(--blue);
}

.editableSpan {
  cursor: pointer;
}

input {
  text-align: center;
  font-size: clamp(0.8rem, 1.2vw, 0.8rem);
}
</style>