<template>
  
  <div id="about-panel" class="content">

    <p>{{$t('intro')}}</p>

    <!-- Disclaimer -->
    <p> {{ $t('disclaimer') }}</p>

    <!-- Concept -->
    <p> {{ $t('concept') }}</p>

    <!-- <p>You can check out some of the 3D digital twins 
      developed related to this web application:</p>
    <div class="container-vertical">
      <button onclick="window.open('https://cgi-dto.github.io/OBSEA/', '_blank')">Digital Twin of a cabled underwater observatory (OBSEA) <span class="fa">&#xf08e;</span></button>
      <button onclick="window.open('https://cgi-dto.github.io/Barcelona/', '_blank')">Digital Twin of Barcelona's sea state <span class="fa">&#xf08e;</span></button>
    </div> -->
    
    <!-- References -->
    <p>{{$t('howtocite')}}</p>

    <p class="citation">Llorach-Tó, G., Martínez, E., Fernández, J. D. R., & García-Ladona, E. (2023, June). Experience OBSEA: a web-based 3D virtual environment of a seafloor observatory. In OCEANS 2023-Limerick (pp. 1-6). IEEE.</p>

    <p class="citation">Llorach-Tó, G., Martínez, E., Del-Río, J., Simarro, G., Pani, M., Bucchi, A., ... & García-Ladona, E. (2024). 3D Digital Twins of the Ocean: towards an intuitive and realistic visualization of wave parameters (No. EGU24-19105). Copernicus Meetings.</p>

    <!-- Contact -->
     <h5>{{ $t('Contact') }}</h5>
    <p>
      {{ $t('author-info-gerard') }} {{ email }}@{{ emailProvider }}. {{ $t('contact-github-issues') }} <a href="https://github.com/ICATMAR/boiasomorrostro" title="repository" target="_blank">github</a>. {{ $t('contact-icatmar') }} {{ emailObs }}@{{ emailProviderIcatmar }}
    </p>

    <!-- Attributions -->
     <!-- Funding agencies icons-->
     <div class="attributions-container">
      <div class="logos-container">
        <img src="img/logos/ICATMAR512.png">
        <img src="img/logos/AjuntamentBarcelona.png">
        <img src="img/logos/Generalitat.png">
        <img src="img/logos/ICM.png">
        <img src="img/logos/CSIC.png">
      </div>
    </div>
    

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
      email: 'gerard.llorach',
      emailProvider: 'csic.es',
      emailObs: 'observacions',
      emailProviderIcatmar: 'icatmar.cat'
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



.attributions-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logos-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  
}
.logos-container > img {
  width: 20%;
  object-fit: contain;
  padding-left: 2%;
  padding-right: 2%;
  max-width: 150px;
}
</style>