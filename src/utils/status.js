// "in_progress" -> "In progress" -- matches Django's get_status_display()
// output closely enough for this UI's purposes.
function formatStatus(status) {
  return status.replace('_', ' ').replace(/^\w/, (char) => char.toUpperCase())
}

export { formatStatus }
