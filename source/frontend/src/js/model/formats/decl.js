import * as d3 from 'd3'
import { getConstraintType } from '../../constraintTypes'
import { v4 as uuidv4 } from 'uuid'
/**
 * Parses the process mining model string and extracts:
 * - An array of activities (from lines starting with "activity ")
 * - An array of constraints (lines that follow the pattern ConstraintName[Activity...])
 * - An array of "other" lines (all lines that do not match the above)
 *
 * A constraint line is expected to follow one of these formats:
 *   ConstraintName[Activity1] ... extra info ...
 *   ConstraintName[Activity1, Activity2] ... extra info ...
 *
 * The constraint name is processed by removing all spaces (e.g. "Not Precedence" becomes "NotPrecedence")
 * and the extra information (if any) is stored as a plain string.
 *
 * @param {string} str - The process mining model as a string.
 * @returns {object} An object with three properties: activities, constraints, and others.
 */
function _parseModel (str) {
  // Arrays to store our results.
  const activities = []
  const constraints = []
  const others = []

  // Split input into lines (supporting both Unix and Windows line breaks)
  const lines = str.split(/\r?\n/)
    .filter(line => {
      const trimmedLine = line.trim()
      // Skip empty lines.
      if (!trimmedLine) return false
      // Skip comments.
      if (trimmedLine.startsWith('#')) return false
      //
      return true
    })

  // Regular expression to match constraint lines.
  // It expects: some text (constraint name), then an opening "[", then the list of activities,
  // then a closing "]", then possibly extra info.
  const constraintRegex = /^(.+?)\[(.*?)\](.*)$/

  // First, parse all the file to extract activities
  for (const line of lines) {
    const trimmedLine = line.trim()
    // If the line starts with "activity ", extract the activity name.
    if (trimmedLine.startsWith('activity ')) {
      const activityName = trimmedLine.substring('activity '.length).trim()
      activities.push(activityName)
    }
  }

  for (const line of lines) {
    const trimmedLine = line.trim()

    // If the line starts with "activity ", continue
    if (trimmedLine.startsWith('activity ')) {
      continue
    } else
    // is a constraint
    if (constraintRegex.test(trimmedLine)) {
      const match = trimmedLine.match(constraintRegex)

      // Group 1: raw constraint name (may include spaces)
      const rawName = match[1].trim()
      // Remove spaces to create a single word while maintaining the case.
      const constraintName = rawName.replace(/\s+/g, '')

      // Group 2: activity/activities inside the brackets.
      const activitiesPart = match[2].trim()
      // Split by comma if there are multiple activities.
      const constraintActivities = activitiesPart.split(',').map(act => act.trim()).filter(act => act)

      // If there are no activities, skip this line.
      if (constraintActivities.length === 0) continue

      // Check that activities exist.
      const allActivitiesExist = true
      for (const a of constraintActivities) {
        if (!activities.includes(a)) {
          activities.push(a)
        }
      }
      if (!allActivitiesExist) continue

      // Group 3: any extra text after the brackets.
      const extraInfo = match[3].trim()

      // Save the constraint.
      constraints.push({
        name: constraintName,
        activities: constraintActivities,
        extra: extraInfo
      })
    }
    // Otherwise, store the line in "others" for future reference.
    else {
      others.push(trimmedLine)
    }
  }

  // clean duplicates activities
  const duplicatesActivities = []
  for (let i = 0; i < activities.length; i++) {
    for (let j = i + 1; j < activities.length; j++) {
      if (activities[i] === activities[j]) {
        duplicatesActivities.push(j)
      }
    }
  }
  for (let i = duplicatesActivities.length - 1; i >= 0; i--) {
    activities.splice(duplicatesActivities[i], 1)
  }

  // clean duplicates constraints
  const duplicates = []
  for (let i = 0; i < constraints.length; i++) {
    for (let j = i + 1; j < constraints.length; j++) {
      if (constraints[i].name === constraints[j].name && constraints[i].activities.join(',') === constraints[j].activities.join(',')) {
        duplicates.push(j)
      }
    }
  }
  for (let i = duplicates.length - 1; i >= 0; i--) {
    constraints.splice(duplicates[i], 1)
  }

  // Return the extracted information.
  return {
    activities,
    constraints,
    others
  }
}

function _generateActivityCoordinates (N) { // N is the number of activities
  const width = 1500
  const height = 1500
  const margin = 200

  // Choose number of columns and rows so that the grid roughly matches the 2:1 aspect ratio.
  const cols = Math.ceil(Math.sqrt(N * (width / height)))
  const rows = Math.ceil(N / cols)

  // Create scalePoint for x positions:
  const xScale = d3.scalePoint()
    .domain(d3.range(cols)) // domain is [0, 1, 2, ..., cols-1]
    .range([margin, width])
    .padding(0.5) // adjust padding as desired

  // Create scalePoint for y positions:
  const yScale = d3.scalePoint()
    .domain(d3.range(rows)) // domain is [0, 1, 2, ..., rows-1]
    .range([margin, height])
    .padding(0.5)

  // Build the list of points by walking through the grid.
  const points = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      points.push({ x: xScale(c) + Math.random() * 200, y: yScale(r) + Math.random() * 200 })
      if (points.length === N) return points
    }
  }
  return points
}

export function declToEdj (str) {
  const data = _parseModel(str)

  const model = {
    fileType: 'EDJ',
    version: '1.0',
    data: {
      id: uuidv4(),
      name: 'model',
      activities: [],
      constraints: [],
      _others: data.others,
      _errors: []
    }
  }

  const coords = _generateActivityCoordinates(data.activities.length)
  model.data.activities = data.activities.map((d, i) => {
    return {
      id: `A${i}`,
      name: d,
      geometry: {
        x: coords[i].x,
        y: coords[i].y,
        width: 140,
        height: 60
      }
    }
  })

  const getActivityId = (name) => {
    return model.data.activities.find(act => act.name === name).id
  }

  data.constraints.forEach((d, i) => {
    let constraintType = null
    // check if the constraint type exist
    try {
      constraintType = getConstraintType(d.name)
    } catch (e) {
      model.data._errors.push({
        type: 'constraint',
        message: `Constraint type "${d.name}" not available in the editor.`,
        data: d
      })
      return
    }

    model.data.constraints.push({
      id: `C${i}`,
      name: constraintType.name,
      data: {
        sourceActivityId: getActivityId(d.activities[0]),
        targetActivityId: d.activities[1] ? getActivityId(d.activities[1]) : null,
        sourceActivityName: d.activities[0],
        targetActivityName: d.activities[1] || null,
        props: {
          extra: d.extra,
          min: constraintType.name === 'Existence' ? 1 : undefined,
          max: constraintType.name === 'Existence' ? 1 : undefined
        }
      },
      geometry: {
        x: null,
        y: null
      }
    })
  })

  // clean duplicates constraints
  const duplicates = []
  for (let i = 0; i < model.data.constraints.length; i++) {
    for (let j = i + 1; j < model.data.constraints.length; j++) {
      if (model.data.constraints[i].name === model.data.constraints[j].name && model.data.constraints[i].data.sourceActivityId === model.data.constraints[j].data.sourceActivityId && model.data.constraints[i].data.targetActivityId === model.data.constraints[j].data.targetActivityId) {
        duplicates.push(j)
      }
    }
  }
  for (let i = duplicates.length - 1; i >= 0; i--) {
    model.data.constraints.splice(duplicates[i], 1)
  }

  return JSON.stringify(model, null, 2)
}
