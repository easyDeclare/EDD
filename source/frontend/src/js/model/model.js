import ActivityModel from './activityModel'
import ConstraintModel from './constraintModel'
import { ModelStringParsingError as StrError } from './error'
import { declToEdj } from './formats/decl'

export default class Model {
  static fromString (str) { // edj file
    return parseFromString(str)
  }

  static fromDecl (str) { // drom decl file
    const edjStr = declToEdj(str)
    return parseFromString(edjStr)
  }

  constructor () {
    this.fileType = 'EDJ'
    this.version = '1.0'
    this.data = {
      id: null,
      name: null,
      activities: [],
      constraints: []
    }
  }

  id (value) {
    if (value === undefined) return this.data.id
    this.data.id = value
    return this
  }

  name (value) {
    if (value === undefined) return this.data.name
    this.data.name = value
    return this
  }

  activities (value) {
    if (value === undefined) return this.data.activities
    this.data.activities = value
    return this
  }

  constraints (value) {
    if (value === undefined) return this.data.constraints
    this.data.constraints = value
    return this
  }

  toString () {
    return JSON.stringify(this, null, 2)
  }

  toDecl () {
    const str = _modelToDecl(this)
    return str
  }

  toRum () {
    console.error('toRum not implemented')
  }

  addActivity (activity) {
    this.data.activities.push(activity)
  }

  addConstraint (constraint) {
    this.data.constraints.push(constraint)
  }
}

/* ********************************************
**********        PARSER *********************
*********************************************/

function getAttr (obj, key) {
  if (key in obj) return obj[key]
  else throw new StrError(`[Model] Input obj has not key '${key}'`, obj)
}

function parseFromString (str) {
  if (typeof str !== 'string') throw StrError('Input str in not a string')
  try {
    const obj = JSON.parse(str)
    const model = new Model()

    model.id(getAttr(getAttr(obj, 'data'), 'id'))
    model.name(getAttr(getAttr(obj, 'data'), 'name'))
    model.activities(getAttr(getAttr(obj, 'data'), 'activities').map(a => ActivityModel.fromString(JSON.stringify(a))))
    model.constraints(getAttr(getAttr(obj, 'data'), 'constraints').map(c => ConstraintModel.fromString(JSON.stringify(c))))

    if (obj.data._errors) {
      model.data._errors = obj.data._errors
    }

    if (obj.data._others) {
      model.data._others = obj.data._others
    }

    return model
  } catch (exc) {
    console.error(exc)
    throw new StrError('Cannot parser Input str as a json. Invalid format.')
  }
}

function _modelToDecl (model) {
  let str = ''
  model.data.activities.forEach(activityModel => {
    str += `activity ${activityModel.activityName()}\n`
  })

  model.data.constraints.forEach(constraintModel => {
    if (constraintModel.targetActivityName() == null) {
      // unary constraint
      str += `${constraintModel.constraintName()}[${constraintModel.sourceActivityName()}]\n`
    } else {
      str += `${constraintModel.constraintName()}[${constraintModel.sourceActivityName()}, ${constraintModel.targetActivityName()}]\n`
    }
  })

  return str
}
