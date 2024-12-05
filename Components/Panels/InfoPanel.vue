<template>
  <div id="info-panel">
    <div class="content">
      <!-- About the app -->
      <h3>{{$t('infoPanel.title')}}</h3>
      <p> {{$t('infoPanel.p1')}} 
        <a href="https://icatmar.cat" target="_blank">{{$t('infoPanel.ICATMAR')}}</a>
        {{$t('infoPanel.p1_2')}}
        <a href="https://www.github.com/ICATMAR/CasablancaBuoy" target="_blank">{{$t('infoPanel.github')}}</a>

        
      </p>
      <!-- About obsea -->
      <h4>{{$t('infoPanel.about')}}</h4>
      <p>{{$t('infoPanel.p2')}}</p>
      <!-- https://stackoverflow.com/questions/28420080/modify-the-zoom-level-of-an-embedded-google-map
       src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d57553.93698704442!2d1.2975765851823509!3d40.700265536661675!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f130!3m2!1m1!2zNDDCsDQyJzE2LjYiTiAxwrAyMCc0NC4wIkU!5e0!3m2!1sca!2ses!4v1694524172671!5m2!1sca!2ses"

      -->
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d57553.93698704442!2d1.2975765851823509!3d40.700265536661675!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f130!3m2!1m1!2zNDDCsDQyJzE2LjYiTiAxwrAyMCc0NC4wIkU!5e0!3m2!1sca!2ses!4v1694524172671!5m2!1sca!2ses"
        width="100%" height="300px" style="border:0;" allowfullscreen="" loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"></iframe>
      <!-- Contact -->
      <h4>{{$t('infoPanel.contact')}}</h4>
      <p>{{$t('infoPanel.p3')}}</p>
      <!-- Funding -->
      <h4>{{$t('infoPanel.funding')}}</h4>
      <p>{{$t('infoPanel.p4')}}
      <a href="https://www.bluenetcat.eu" target="_blank">{{$t('infoPanel.BlueNetCat')}}</a>
        {{$t('infoPanel.p4_1')}}
        <a href="https://www.sarti.webs.upc.edu/" target="_blank">{{$t('infoPanel.SARTI_UPC')}}</a>
        {{$t('infoPanel.p4_2')}}
        <a href="https://icatmar.cat" target="_blank">{{$t('infoPanel.ICATMAR')}}</a>
      </p>


      <!-- Funding image -->
      <img src="/CasablancaBuoy/img/Logos.png" style="max-width: 100%">
    </div>
  </div>
</template>

<script>
export default {
  
}
</script>

<style scoped>
p {
  text-align: justify;
}
</style>