// Date.toISOString() converts to UTC first, which silently shifts the
// calendar date near either edge of a day for any timezone offset from
// UTC. Use this instead of `date.toISOString().slice(0, 10)` anywhere a
// YYYY-MM-DD needs deriving from a local Date object (query params, date
// inputs, day-navigation math) -- never toISOString() for this.
function toLocalDateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Same local-time reasoning as toLocalDateString, extended with hours/
// minutes -- the exact "YYYY-MM-DDTHH:mm" shape a <input type="datetime-local">
// needs for its `value`/`defaultValue` attribute.
function toDatetimeLocalString(date) {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${toLocalDateString(date)}T${hours}:${minutes}`
}

export { toLocalDateString, toDatetimeLocalString }
