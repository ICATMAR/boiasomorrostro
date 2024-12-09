<template>
  
  <div id="about-panel" class="content">

    <p>This application is being developed by Gerard Llorach Tó. The objective of this application is to study and understand wave dynamics at open sea.
      Do not hesitate to contact me at {{ email }}@{{ emailProvider }}.
    </p>

    <p>The concept of this web application originates from digital twins: the sea state shown here should be a replica of the real sea. Additionally, the user
      should be able to change the digital twin and create 'what-if scenarios'. You can check out some of the 3D digital twins I developed related to this web application:
    </p>

    <div class="container-vertical">
      <button onclick="window.open('https://cgi-dto.github.io/OBSEA/', '_blank')">Digital Twin of a cabled underwater observatory (OBSEA) <span class="fa">&#xf08e;</span></button>
      <button onclick="window.open('https://cgi-dto.github.io/Barcelona/', '_blank')">Digital Twin of Barcelona's sea state <span class="fa">&#xf08e;</span></button>
    </div>
    
    <p>If you want to reference this web application please use the folling citations:</p>

    <p class="citation">Llorach-Tó, G., Martínez, E., Fernández, J. D. R., & García-Ladona, E. (2023, June). Experience OBSEA: a web-based 3D virtual environment of a seafloor observatory. In OCEANS 2023-Limerick (pp. 1-6). IEEE.</p>

    <p class="citation">Llorach-Tó, G., Martínez, E., Del-Río, J., Simarro, G., Pani, M., Bucchi, A., ... & García-Ladona, E. (2024). 3D Digital Twins of the Ocean: towards an intuitive and realistic visualization of wave parameters (No. EGU24-19105). Copernicus Meetings.</p>

  </div>
  

</template>






<script>




export default {
  name: "AboutPanel",
  created() {

  },
  mounted() {

  },
  data() {
    return {
      email: 'gerard.llorach.work',
      emailProvider: 'gmail.com'
    }
  },
  methods: {

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

p {
  text-align: justify;
}

.container-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}
.container-vertical > button {
  margin: 5px;
}

.citation {
  font-style: italic;
}
</style>