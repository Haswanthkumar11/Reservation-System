const settingsRepository = require('../repositories/settingsRepository');
const ApiError = require('../utils/ApiError');

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function toHHMM(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const settingsService = {
  getSettings: () => settingsRepository.findOrCreate(),

  async updateSettings(data) {
    const patch = {};
    if (data.openingTime) {
      if (!TIME_REGEX.test(data.openingTime)) throw new ApiError(422, 'openingTime must be HH:mm');
      patch.openingTime = data.openingTime;
    }
    if (data.closingTime) {
      if (!TIME_REGEX.test(data.closingTime)) throw new ApiError(422, 'closingTime must be HH:mm');
      patch.closingTime = data.closingTime;
    }
    if (data.slotDurationMinutes) {
      const dur = Number(data.slotDurationMinutes);
      if (!dur || dur <= 0 || dur > 240) throw new ApiError(422, 'slotDurationMinutes must be between 1 and 240');
      patch.slotDurationMinutes = dur;
    }
    return settingsRepository.update(patch);
  },

  // Generates the list of bookable HH:mm slots between opening and closing time.
  async generateSlots() {
    const { openingTime, closingTime, slotDurationMinutes } = await this.getSettings();
    const start = toMinutes(openingTime);
    const end = toMinutes(closingTime);
    const slots = [];
    for (let t = start; t <= end; t += slotDurationMinutes) {
      slots.push(toHHMM(t));
    }
    return slots;
  },
};

module.exports = settingsService;
