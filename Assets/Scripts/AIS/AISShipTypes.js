// https://api.vtexplorer.com/docs/ref-aistypes.html
const shipTypes = [
  "Not available (default)",   // 0
  "Reserved for future use",   // 1
  "Reserved for future use",   // 2
  "Reserved for future use",   // 3
  "Reserved for future use",   // 4
  "Reserved for future use",   // 5
  "Reserved for future use",   // 6
  "Reserved for future use",   // 7
  "Reserved for future use",   // 8
  "Reserved for future use",   // 9
  "Reserved for future use",   // 10
  "Reserved for future use",   // 11
  "Reserved for future use",   // 12
  "Reserved for future use",   // 13
  "Reserved for future use",   // 14
  "Reserved for future use",   // 15
  "Reserved for future use",   // 16
  "Reserved for future use",   // 17
  "Reserved for future use",   // 18
  "Reserved for future use",   // 19
  "Wing in ground (WIG), all ships of this type", // 20
  "Wing in ground (WIG), Hazardous category A",   // 21
  "Wing in ground (WIG), Hazardous category B",   // 22
  "Wing in ground (WIG), Hazardous category C",   // 23
  "Wing in ground (WIG), Hazardous category D",   // 24
  "Wing in ground (WIG), Reserved for future use", // 25
  "Wing in ground (WIG), Reserved for future use", // 26
  "Wing in ground (WIG), Reserved for future use", // 27
  "Wing in ground (WIG), Reserved for future use", // 28
  "Wing in ground (WIG), Reserved for future use", // 29
  "Fishing",         // 30
  "Towing",          // 31
  "Towing: length exceeds 200m or breadth exceeds 25m", // 32
  "Dredging or underwater ops", // 33
  "Diving ops",     // 34
  "Military ops",   // 35
  "Sailing",        // 36
  "Pleasure Craft", // 37
  "Reserved",       // 38
  "Reserved",       // 39
  "High speed craft (HSC), all ships of this type", // 40
  "High speed craft (HSC), Hazardous category A",   // 41
  "High speed craft (HSC), Hazardous category B",   // 42
  "High speed craft (HSC), Hazardous category C",   // 43
  "High speed craft (HSC), Hazardous category D",   // 44
  "High speed craft (HSC), Reserved for future use", // 45
  "High speed craft (HSC), Reserved for future use", // 46
  "High speed craft (HSC), Reserved for future use", // 47
  "High speed craft (HSC), Reserved for future use", // 48
  "High speed craft (HSC), No additional information", // 49
  "Pilot Vessel",      // 50
  "Search and Rescue vessel", // 51
  "Tug",               // 52
  "Port Tender",       // 53
  "Anti-pollution equipment", // 54
  "Law Enforcement",   // 55
  "Spare - Local Vessel", // 56
  "Spare - Local Vessel", // 57
  "Medical Transport", // 58
  "Noncombatant ship according to RR Resolution No. 18", // 59
  "Passenger, all ships of this type", // 60
  "Passenger, Hazardous category A",   // 61
  "Passenger, Hazardous category B",   // 62
  "Passenger, Hazardous category C",   // 63
  "Passenger, Hazardous category D",   // 64
  "Passenger, Reserved for future use", // 65
  "Passenger, Reserved for future use", // 66
  "Passenger, Reserved for future use", // 67
  "Passenger, Reserved for future use", // 68
  "Passenger, No additional information", // 69
  "Cargo, all ships of this type", // 70
  "Cargo, Hazardous category A",   // 71
  "Cargo, Hazardous category B",   // 72
  "Cargo, Hazardous category C",   // 73
  "Cargo, Hazardous category D",   // 74
  "Cargo, Reserved for future use", // 75
  "Cargo, Reserved for future use", // 76
  "Cargo, Reserved for future use", // 77
  "Cargo, Reserved for future use", // 78
  "Cargo, No additional information", // 79
  "Tanker, all ships of this type", // 80
  "Tanker, Hazardous category A",   // 81
  "Tanker, Hazardous category B",   // 82
  "Tanker, Hazardous category C",   // 83
  "Tanker, Hazardous category D",   // 84
  "Tanker, Reserved for future use", // 85
  "Tanker, Reserved for future use", // 86
  "Tanker, Reserved for future use", // 87
  "Tanker, Reserved for future use", // 88
  "Tanker, No additional information", // 89
  "Other Type, all ships of this type", // 90
  "Other Type, Hazardous category A",   // 91
  "Other Type, Hazardous category B",   // 92
  "Other Type, Hazardous category C",   // 93
  "Other Type, Hazardous category D",   // 94
  "Other Type, Reserved for future use", // 95
  "Other Type, Reserved for future use", // 96
  "Other Type, Reserved for future use", // 97
  "Other Type, Reserved for future use", // 98
  "Other Type, No additional information" // 99
];

export default shipTypes;