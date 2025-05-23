let es;
export default es = {
  "Date": "Fecha",
  "Longitude": "Longitud",
  "Latitude": "Latitud",
  "Time step": "Paso de tiempo",


  "Raw data": "Datos crudos",
  "Data": "Datos",
  "Data from": "Datos de",


  "About": "Acerca de",
  "intro": "Esta aplicación ofrece una visualización dinámica en 3D de la boya Somorrostro, reflejando sus condiciones reales y proporcionando acceso a datos meteorológicos y oceanográficos en tiempo real.",
  "disclaimer": "Los datos presentados en esta aplicación son únicamente para fines informativos. Aunque nos esforzamos por garantizar su precisión y fiabilidad, no podemos asegurar que los datos estén libres de errores o interrupciones. La información no debe utilizarse para la toma de decisiones críticas sin una verificación adicional. El uso de esta aplicación es bajo su propia responsabilidad.",
  "concept": "El concepto de esta aplicación web se origina en los gemelos digitales: el estado del mar mostrado aquí debería ser una réplica del mar real. Además, el usuario debería poder modificar el gemelo digital y crear 'escenarios hipotéticos'.",
  "howtocite": "Si desea hacer referencia a esta aplicación web, utilice las siguientes citas:",

  "Contact": "Contacto",
  "author-info-gerard": "Para cualquier duda, comentario o sugerencia sobre la aplicación web, puedes contactar con ",
  "contact-github-issues": "Si estás familiarizado con GitHub issues, puedes informar de errores a través de ",
  "author-info-jordi": "Para consultas sobre los datos, su tratamiento y obtención, contacta con ",
  "contact-icatmar": "Para cualquier otra cosa, puedes contactar a través de ",



  "Map": "Mapa",
  "Somorrostro buoy": "Boia Somorrostro",

  "buoyButtonTitle": "Centra la cámara en la boya de superfície",
  "baseButtonTitle": "Centra la cámara en el observatorio submarino",

  "information": "Información",
  "githubButton": "Repositorio del código abierto",
  "languageButton": "Cambia de idioma",

  "waveButtonTitle": "Configura el oleaje",
  "windButtonTitle": "Modifica el viento",

  "externalDataButton": "Conectar con datos externos",

  "externalLinkButton": "Ve a la fuente de datos",
  "measuresButton": "Obre/Cierra el panel de datos",

  "compassButtonTitle": "Orienta la camara hacia el norte",



  "WSPD": "Velocidad del viento",
  "WDIR": "Dirección del viento",
  "Hm0": "Altura oleaje (media)",
  "Hmax": "Altura máxima de oleaje",
  "Mdir": "Dirección oleaje (media)",
  "Spr1": "Difusión direccional oleaje",
  "AIRT": "Temperatura del aire",
  "TEMP": "Temperatura (base submarina)",
  "PSAL": "Salinidad (base submarina)",

  "Wind": "Viento",
  "Waves": "Oleaje",

  "Wave height": "Altura de oleaje",
  "Swell direction": "Dirección del oleaje",
  "Wave direction": "Dirección del oleaje",
  "Wave steepness": "Periodo",
  "Wave period": "Periodo",
  
  "Swell composition": "Composición del oleaje",
  "Swell composition legend": "Leyenda composición del oleaje",


  "Wind wave direction": "Dirección de oleaje de viento",
  "Wind wave significant height": "Oleaje de viento",
  "Primary swell wave direction": "Dirección del mar de fondo",
  "Primary swell wave significant height": "Mar de fondo",
  "Secondary swell wave direction": "Dirección mar de fondo 2",
  "Secondary swell wave significant height": "Mar de fondo 2",

  "Sea current direction": "Dirección de la corriente",
  "Sea surface velocity": "Corriente",
  "Sea water velocity": "Corriente",
  "Chlorophyll": "Clorofila",

  "Wind speed": "Velocidad del viento",
  "Wind direction": "Dirección del viento",
  "Wind gust": "Ráfaga de viento",
  "Wave significant height": "Altura significante de oleaje",
  "Air temperature": "Temperatura del aire",
  "Atmospheric pressure": "Pressión atmosférica",
  "Sea surface temperature": "Temperatura superficial del mar",
  "Sea bottom temperature": "Temperatura del fondo del mar",
  "Sea temperature anomaly": "Anomalia de temperatura del mar",
  "Salinity": "Salinidad",
  "Humidity": "Humedad",
  "Cloudiness": "Nubosidad",


  "swellCompositionSVG": "Azul claro: mar total; Amarillo: oleaje de viento; Azul: mar de fondo; Azul oscuro: mar de fondo 2",

  dataPanel: {
    'dataBuoyNotAvailable': 'El despliegue de la boya está previsto para el verano/otoño de 2025. Los datos oceanográficos y meteorológicos mostrados en esta sección proceden de modelos y sistemas de previsión.',
  },

  infoPanel: {
    title: "Acerca de la aplicación",
    p1: `Esta aplicación es una simulación 3D de las condiciones meteorológicas y oceanográficas
        del observatorio de submarino OBSEA. La simulación se basa en los datos recogidos por el
        observatorio. El objetivo de esta aplicación es transferir el conocimiento
        e información adquirida por el observatorio. Esta aplicación está siendo desarrollada por la
        `,
    p1_1: `en colaboració con `,
    BlueNetCat: 'Xarxa Marítima de Catalunya (BlueNetCat)',
    OBSEA_UPC: 'OBSEA de la Universitat Politècnica de Catalunya (UPC)',
    p1_2: `. Agradecimientos sinceros al Grupo de las Tecnologias de la Interacción (GTI) de la Universitat
    Pompeu Fabra por las consultas ténicas y a Emilio García por las consultas teóricas. El código de la 
    aplicación se puede encontrar en el `,
    github: `repositorio github.`,

    aboutObsea: `Acerca de OBSEA`,
    p2: `Tomado del sitio web de OBSEA: "La investigación marina requiere cada día más información medioambiental, 
    con mejores resoluciones temporales y series más largas. Los métodos tradicionales no son adecuados por 
    ecosistemas marinos con dinámicas muy lentas, con la adquisición continúa de datos durante largos periodos 
    es posible detectar cambios climáticos a la vegada que acontecimientos singulares.`,
    p2_1: `OBSEA es un observatorio submarino cableado a unos 4 km de la costa de Vilanova i la Geltrú a
     la zona protegida de pesca, e interconectado a la costa por un cable mixto de energía y comunicaciones. 
     La ventaja principal de disponer de un observatorio cableado es la de poder proporcionar energía a los 
     instrumentos científicos y disponer de un enlace de comunicación de banda ancha. De este modo se puede 
     tener información en tiempo real y se evitan los inconvenientes de los sistemas alimentados con baterías.
      La solución adoptada es la implementación de una red ethernet óptica que transmite continuamente los 
      datos de los instrumentos oceanográficos conectados al observatorio. Con el OBSEA se puede realizar una 
      observación en tiempo real de múltiples parámetros del medio marino. Desde la estación terrestre se proporciona 
      la alimentación por los dispositivos y el enlace de fibra óptica por las comunicaciones a la vez que se hace 
      la gestión de alarmas y se almacenan los datos. Con un tramo de unos 1000 metros de cable terrestre se conecta 
      con la arqueta de anclaje, punto donde el cable submarino inicia su recorrido hasta la ubicación del nodo a 
      unos 4 km de la costa y a unos 20 metros de profundidad."`,

    contact: "Contacto",
    p3: `Para consultas sobre la aplicación, póngase en contacto con Gerard Llorach (gllorach at bluenetcat.eu).
     Para consultas sobre los datos, por favor contactar a Enoc Martínez (enoc.martinez at upc.edu).`,

    funding: "Financiación",
    p4: `La Xarxa Marítima de Catalunya (BlueNetCat) está financiada por
    la Generalitat de Catalunya y por el Fondo Europeo de Desarrollo Regional (FEDER).`,

  },



  seaPanel: {
    title: "Parámetros de la simulación del mar",
    p1: "Esta simulación está hecha con olas de Gestner, según el",
    p1_1: "tutorial de Jasper Flick",
    p2: `La simulación genera los parámetros de 16 olas seguns las medidas de oleaje, tales com la altura media de oleaje,
    la altura máxima de oleaje y la dirección del oleaje.`,
    oceanSteepness: "Modifica como de picado está el mar",
    waveSignificantHeight: "Modifica la altura significante de oleaje",
    meanWaveDirection: "Modifica la dirección promedio de las olas",
    swellParams: "Modifica los parámetros del oleaje principal",
  },


  windPanel: {
    title: "Parámetros de la simulación de viento",
    p1: "La simulación de tejido está hecha con verlet integration (Hitman's ragdoll), siguiendo el",
    p1_1: "tutorial de Jared Counts",
    p2: `La simulación está basada en las medidas de la velocidad del viento y su dirección, que modifican
        las fuerzas que afectan la tela.`,
    windParams: 'Modifica el viento',
  },

  externalDataCMEMS: {
    title: "Datos de olaje y otros",
    p1: `Los datos se descargan del servicio de Copernicus. 
    En la siguiente tabla puedes ver los datos de los dias anteriors y posteriores a la fecha seleccionada (hoy por defecto).
    Los datos provienen de modelos y no de observaciones in situ.`,
    generatedCMEMS: "Generado con E.U. Copernicus Marine Service Information: ",
    datesModify: "Cambia las fechas",
  },

  "More data": "+ Datos",
  "Regenerate ocean": "↻ Regenerar simulación",

  timeControl: {
    "timeSliderTip": "Arrastra para seleccionar la fecha",
    "dailyMax": "Máximo diario (OBSEA)",
    "halfHourly": "Promedio 30min (OBSEA)",
    "playPause": "Reproducir/Parar",
    "stepForward": "Desplázate al siguiente punto",
    "stepBackward": "Desplázate al punto anterior",
    "forward": "Avance rápido",
    "backward": "Marcha atrás"
  },  
  



  
    "January": "Enero",
    "February": "Febrero",
    "March": "Marzo",
    "April": "Abril",
    "May": "Mayo",
    "June": "Junio",
    "July": "Julio",
    "August": "Agosto",
    "September": "Septiembre",
    "October": "Octubre",
    "November": "Noviembre",
    "December": "Diciembre",
    "Jan": "Ene",
    // "Feb": ,
    // "Mar": ,
    "Apr": "Abr",
    // "May": "May",
    // "Jun": ,
    // "Jul": ,
    "Aug": "Ago",
    // "Sep": "Sep",
    // "Oct": ,
    // "Nov": ,
    "Dec": "Dic",

    "Mo": "Lu",
    "Tu": "Ma",
    "We": "Mi",
    "Th": "Ju",
    "Fr": "Vi",
    "Sa": "Sa",
    "Su": "Do",
    
    "Mon": "Lu",
    "Tue": "Ma",
    "Wed": "Mi",
    "Thu": "Ju",
    "Fri": "Vi",
    "Sat": "Sa",
    "Sun": "Do",
  

}