let ca;
export default ca = {
  "Date": "Data",
  "Longitude": "Longitud",
  "Latitude": "Latitud",

  "buoyButtonTitle": "Centra la càmara a la boia de superficie",
  "baseButtonTitle": "Centra la càmara a l'observatori submarí",

  "information": "Informació",
  "githubButton": "Repositori del codi obert",
  "languageButton": "Canvia de llengua",

  "waveButtonTitle": "Configura l'onatge",
  "windButtonTitle": "Modifica el vent",

  "externalDataButton": "Connecta amb dades externes",

  "externalLinkButton": "Ves a la font de dades",
  "measuresButton": "Obre/Tanca el panell de dades",

  "compassButtonTitle": "Orienta la càmara cap al nord",


  "WSPD": "Velocitat del vent",
  "WDIR": "Direcció del vent",
  "Hm0": "Altura d'onatge (mitja)",
  "Hmax": "Altura màxima d'onatge",
  "Mdir": "Direcció d'onatge (mitja)",
  "Spr1": "Difusió direccional d'onatge",
  "AIRT": "Temperatura de l'aire",
  "TEMP": "Temperatura (base submarina)",
  "PSAL": "Salinitat (base submarina)",

  "Wind": "Vent",
  "Waves": "Onatge",

  "Wave height": "Altura d'onatge",
  "Swell direction": "Direcció de l'onatge",
  "Wave direction": "Direcció de l'onatge",
  "Wave steepness": "Període",
  "Wave period": "Període",

  "Swell composition": "Composició de l'onatge",
  "Swell composition legend": "Llegenda composició d'onatge",

  "Wind wave direction": "Direcció de l'onatge de vent",
  "Wind wave significant height": "Onatge de vent",
  "Primary swell wave direction": "Direcció del mar de fons",
  "Primary swell wave significant height": "Mar de fons",
  "Secondary swell wave direction": "Direcció del mar de fons 2",
  "Secondary swell wave significant height": "Mar de fons 2",

  "Sea current direction": "Direcció del corrent",
  "Sea surface velocity": "Corrent",
  "Chlorophyll": "Clorofil·la",

  "Wind speed": "Velocitat del vent",
  "Wind direction": "Direcció del vent",
  "Wave significant height": "Altura significant d'onatge",
  "Air temperature": "Temperatura de l'aire",
  "Atmospheric pressure": "Pressió atmosfèrica",
  "Sea surface temperature": "Temperatura superficial del mar",
  "Sea bottom temperature": "Temperatura del fons del mar",
  "Salinity": "Salinitat",


  "swellCompositionSVG": "Blau clar: mar total; Groc: onatge de vent; Blau: mar de fons; Blau fosc: mar de fons 2",


  infoPanel: {
    title: "Sobre l'aplicació",
    p1: `Aquesta aplicació és una simulació en 3D de les condicions meteorològiques i oceanogràfiques de 
    la boia "Casablanca". La boia està instal·lada a prop de la plataforma petrolífera 
    "Casablanca" de REPSOL. L'objectiu de aplicació és transferir el coneixement i la 
    informació adquirida per la boia. Aquesta aplicació està sent desenvolupada per l'`,
    ICATMAR: 'ICATMAR (Institut Català de Recerca per la Governança del Mar)',
    p1_2: ` amb l'objectiu de transferir la informació adquirida per la boia. El codi obert es pot trobar al `,

    SARTI_UPC: 'grup SARTI de la Universitat Politècnica de Catalunya (UPC)',
    BlueNetCat: 'Xarxa Marítima de Catalunya (BlueNetCat)',
    p1_3: `2020-2022 amb la col·laboració del `,
    p1_4: `. Agraïments sincers al Grup de les Tecnologies de la Interacció (GTI) de la Universitat Pompeu Fabra pel
    suport tècnic i a l'Emilio García per les consultes teòriques. El codi de l'aplicació es pot trobar al `,
    github: `repositori github.`,

    about: `Sobre Casablanca`,
    p2: `La plataforma d'extracció de petroli "Casablanca" de REPSOL va deixar de ser operativa l'any 2021, 
    després de més de 40 anys d'activitat. S'ha col·laborat amb REPSOL amb l'instal·lació de la boia oceanogràfica.
    El desplegament es va fer a principis de Juliol del 2023.`,


    contact: "Contacte",
    p3: `Per a consultes sobre l'aplicació, poseu-vos en contacte amb en Gerard Llorach (gerard.llorach at csic.es).
      Per a consultes sobre les dades, poseu-vos en contacte amb l'Emili García (emilio at icm.csic.es ).`,

    funding: "Finançament",
    p4: `El codi parteix d'una aplicació semblant desenvolupada dins de l'eix de Dades de la `,
    p4_1: ` que va ser cofinanciada per la Generalitat de Catalunya i els fons FEDER (ref: 2018 XARDI 00005, 2020-2022) amb la 
    col·laboració del `,
    p4_2: `. La implementació final està finançada l'`,
  },


  seaPanel: {
    title: "Paràmetres de la simulació del mar",
    p1: "Aquesta simulació està fet amb onades de Gestner, seguint el",
    p1_1: "tutorial de Jasper Flick",
    p2: `La simulació genera els paràmetres de 16 onades segons les mesures d'onatge, tals com l'altura mitjana d'onatge,
    l'altura màxima d'onatge i la direcció de l'onatge.`,
    oceanSteepness: "Modifica com de picat está el mar",
    waveSignificantHeight: "Modifica l'altura significant d'onatge",
    meanWaveDirection: "Modifica la direcció promig de les onades",
    swellParams: "Modifica els paràmetres de l'onatge principal",
  },


  windPanel: {
    title: "Paràmetres de la simulació de vent",
    p1: "La simulació de tela està feta amb verlet integration (Hitman's ragdoll), seguint el",
    p1_1: "tutorial de Jared Counts",
    p2: `La simulació està basada en les mesures de la velocitat del vent i la seva direcció, que modifiquen
        les forces que afecten la tela.`,
    windParams: 'Modifica el vent',
  },

  externalDataCMEMS: {
    title: "Dades d'onatge i altres",
    p1: `Les dades es descarreguen del servei de Copernicus. 
    A la següent taula podràs veure les dades dels dies anteriors i posteriors a la data seleccionada (avui per defecte). 
    Les dades provenen de models i no d'observacions en situ.`,
    generatedCMEMS: "Generat amb E.U. Copernicus Marine Service Information: ",
    datesModify: "Canvia les dates",
  }, 

  "More data": "+ Dades",
  "Regenerate ocean": "↻ Regenerar simulació",

  timeControl: {
    "timeSliderTip": "Arrossega per seleccionar la data",
    "dailyMax": "Màxim diari (OBSEA)",
    "halfHourly": "Mitjana 30min (OBSEA)",
    "playPause": "Reproduïr/Aturar",
    "stepForward": "Ves al següent punt",
    "stepBackward": "Ves al punt anterior",
    "forward": "Avanç rápid",
    "backward": "Rebobinar"
  },


    "January": "Gener",
    "February": "Febrer",
    "March": "Març",
    "April": "Abril",
    "May": "Maig",
    "June": "Juny",
    "July": "Juliol",
    "August": "Agost",
    "September": "Setembre",
    "October": "Octubre",
    "November": "Novembre",
    "December": "Desembre",
    "Jan": "Gen",
    // "Feb": ,
    // "Mar": ,
    "Apr": "Abr",
    "May": "Maig",
    // "Jun": ,
    // "Jul": ,
    "Aug": "Ago",
    "Sep": "Set",
    // "Oct": ,
    // "Nov": ,
    "Dec": "Des",

    "Mo": "Dl",
    "Tu": "Dt",
    "We": "Dm",
    "Th": "Dj",
    "Fr": "Dv",
    "Sa": "Ds",
    "Su": "Dg",

    "Mon": "Dl",
    "Tue": "Dt",
    "Wed": "Dm",
    "Thu": "Dj",
    "Fri": "Dv",
    "Sat": "Ds",
    "Sun": "Dg",
  
  "Data": "Dades",
}