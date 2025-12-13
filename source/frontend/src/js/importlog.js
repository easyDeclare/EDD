import * as d3 from 'd3'
import * as $ from 'jquery'
// import { JSONModel, XMLModel } from './model'
import { Model } from './model'
import lockUI from './lockUI'
import '../styles/importLog.scss'
import { Modal } from 'bootstrap'

import BackendServer from './backend'

/* global alert, FileReader */

export default class ImportLog {
  constructor (serverUrl) {
    this.backendServer = new BackendServer(serverUrl)
    this.backendServer.init()

    this.div = d3.select('#import-log-panel')
    this.form = this.div.select('form').attr('action', this.formUrl)
    this.container = this.div.select('#import-log-container')

    this.div.on('click', () => this.closePopup())
    this.container.on('click', (event) => event.stopPropagation())

    $(this.form.node()).on('drag dragstart dragend dragover dragenter dragleave drop', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
      .on('dragover dragenter', () => {
        this.container.classed('is-dragover', true)
      })
      .on('dragleave dragend drop', () => {
        this.container.classed('is-dragover', false)
      })
      .on('drop', (e) => {
        $(this.form.node()).find('input[type="file"]').prop('files', e.originalEvent.dataTransfer.files)
        this.readFile()
      })

    this.form.select('input').on('change', () => this.readFile())
  }

  /*
  */
  openPopup () {
    this.div
      .style('opacity', 0)
      .style('display', null)
      .transition()
      .style('opacity', 1)
  }

  closePopup () {
    this.div
      .style('opacity', 1)
      .transition()
      .style('opacity', 0)
      .style('display', 'none')
  }

  readFile () {
    lockUI.lock()
    this.closePopup()
    const file = new FormData($(this.form.node()).get(0)).get('file')
    const reader = new FileReader()
    reader.onload = ((f) => {
      return (e) => {
        const fileName = f.name
        const fileContent = e.target.result

        try {
          let promise = null
          if (fileName.endsWith('.xes')) promise = this.discoverFromXes(fileName, fileContent)
          else if (fileName.endsWith('.xes.gz')) promise = this.discoverFromXesGz(fileName, fileContent)

          promise.then(res => {
            console.log(res)
            const model = Model.fromDecl(res.model)
            window.app.init(model)
            lockUI.unlock()
          })
            .catch(res => {
              console.error(res)
              alert('Error in discovering model from log file.' + '\n\n' + JSON.stringify(res))
              lockUI.unlock()
            })
        } catch (exception) {
          alert('Not a valid input file.', '\n\n\n', exception)
          console.error(exception)
          lockUI.unlock()
        }

        /*
        if (model == null) alert('Not a valid input file.')
        else {
          // if error in reading the model
          if (model.data._errors || model.data._others) {
            // this.showImportError(model)
          }
          window.app.init(model)
        }
        */
      }
    })(file)

    if (file.name.endsWith('.xes')) {
      reader.readAsText(file)
    } else if (file.name.endsWith('.xes.gz')) {
      reader.readAsArrayBuffer(file)
    }
  }

  /* eslint-disable camelcase */
  async discoverFromXes (fileName, fileContent) {
    console.log('Discovering model from XES log file:', fileName)

    const case_name = $('#case_name').val()
    const consider_vacuity = $('#consider_vacuity').is(':checked')
    const min_support = $('#min_support').val()
    const itemsets_support = $('#itemsets_support').val()
    const max_declare_cardinality = $('#max_declare_cardinality').val()

    return this.backendServer.discoverXesLogFile(fileName, fileContent, case_name, consider_vacuity, min_support, itemsets_support, max_declare_cardinality)
  }

  /* eslint-disable camelcase */
  async discoverFromXesGz (fileName, arrayBuffer) {
    console.log('Discovering model from XES-GZ log file:', fileName)

    const case_name = $('#case_name').val()
    const consider_vacuity = $('#consider_vacuity').is(':checked')
    const min_support = $('#min_support').val()
    const itemsets_support = $('#itemsets_support').val()
    const max_declare_cardinality = $('#max_declare_cardinality').val()

    return this.backendServer.discoverXesGzLogFile(fileName, arrayBuffer, case_name, consider_vacuity, min_support, itemsets_support, max_declare_cardinality)
  }
}
