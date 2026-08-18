// Time scales of the data timeline. hoursAheadBehind sets how much data is shown
// before and after the current hour (finer scales show a shorter span, so the
// number of requested cells stays similar on every scale).
const TIMESCALES = [
  { id: '1d', minutes: 1440, hoursAheadBehind: 120 },
  { id: '3h', minutes: 180,  hoursAheadBehind: 48  },
  { id: '1h', minutes: 60,   hoursAheadBehind: 24  },
];


class GUIManager {

  timescales = TIMESCALES;
  sections = ['data', 'map', 'about'];

  // BOTTOM SECTION
  _selectedSection = 'data';
  get selectedSection() { return this._selectedSection; }
  set selectedSection(id) {
    this._selectedSection = id;
    window.location.setHashValue('SECTION', id);
    // The time scale only makes sense while the data timeline is shown
    if (id == 'data') window.location.setHashValue('TIMESCALE', this._timelineScaleId);
    else window.location.removeHash('TIMESCALE');
  }

  // TIMELINE SCALE
  _timelineScaleId = '3h';
  get timelineScaleId() { return this._timelineScaleId; }
  set timelineScaleId(id) {
    this._timelineScaleId = id;
    if (this._selectedSection == 'data') window.location.setHashValue('TIMESCALE', id);
  }
  get timelineScale() { return TIMESCALES.find(t => t.id == this._timelineScaleId); }
  get timelineIntervalMinutes() { return this.timelineScale.minutes; }
  // Time scale as expected by the CMEMS WMTS retriever ('h' or 'd')
  get timelineWMTSTimeScale() { return this.timelineIntervalMinutes >= 1440 ? 'd' : 'h'; }

  // TIMELINE TIMEZONE
  timelineUseLocalTime = true;
  get timelineTimezoneLabel() {
    if (this.timelineUseLocalTime) {
      const offsetMinutes = -new Date().getTimezoneOffset();
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const absH = Math.floor(Math.abs(offsetMinutes) / 60);
      const absM = Math.abs(offsetMinutes) % 60;
      const str = absM > 0 ? `${absH}:${String(absM).padStart(2, '0')}` : `${absH}`;
      return `UTC${sign}${str}`;
    }
    return 'UTC';
  }
  // Timezone-aware helpers used by the timeline grid
  timelineHours(date) {
    return this.timelineUseLocalTime ? date.getHours() : date.getUTCHours();
  }
  timelineDate(date) {
    return this.timelineUseLocalTime ? date.getDate() : date.getUTCDate();
  }
  timelineFormatDay(date, locale) {
    const options = { weekday: 'long', day: 'numeric' };
    if (!this.timelineUseLocalTime) options.timeZone = 'UTC';
    return date.toLocaleString(locale, options);
  }

  // TIMELINE RANGE
  // Data is forecast as well as past, so the range is centered on the current hour
  get timelineStartDate() {
    let date = new Date();
    date.setMinutes(0, 0, 0);
    date.setHours(date.getHours() - this.timelineScale.hoursAheadBehind);
    // Daily cells must start at midnight so each cell is one day
    if (this.timelineIntervalMinutes >= 1440) {
      if (this.timelineUseLocalTime) date.setHours(0, 0, 0, 0);
      else date.setUTCHours(0, 0, 0, 0);
    }
    return date;
  }
  get timelineEndDate() {
    let date = new Date(this.timelineStartDate.getTime());
    date.setHours(date.getHours() + 2 * this.timelineScale.hoursAheadBehind);
    return date;
  }


  // CONSTRUCTOR
  constructor() {
    // HASH - URL configuration
    // Section <SECTION=data>
    let section = window.location.getHashValue('SECTION');
    if (section != undefined && this.sections.includes(section.toLowerCase()))
      this._selectedSection = section.toLowerCase();
    // Time scale <TIMESCALE=3h>
    let timescale = window.location.getHashValue('TIMESCALE');
    if (timescale != undefined && TIMESCALES.some(t => t.id == timescale))
      this._timelineScaleId = timescale;
    // Write back the state the app starts with
    this.selectedSection = this._selectedSection;
  }

}

export default GUIManager;
